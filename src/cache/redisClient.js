import { randomUUID } from 'node:crypto';
import db from '../database/db.js';

/**
 * Resilient Cache & Session Store
 * Implements Redlock-style locking, atomic balance mutations,
 * and Compare-And-Swap (CAS) synchronization with persistence layer.
 */
export class FastCacheClient {
  constructor() {
    this.store = new Map();
    this.locks = new Map();
    this.dirtyUsers = new Set();
  }

  // --- Core Cache Operations ---
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds = null) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  del(key) {
    return this.store.delete(key);
  }

  // --- Redlock-style Distributed Locking ---
  async acquireLock(resource, ttlMs = 5000) {
    const lockKey = `lock:${resource}`;
    const now = Date.now();
    const existing = this.locks.get(lockKey);

    if (existing && existing.expiresAt > now) {
      return null; // Resource locked
    }

    const lockId = randomUUID();
    this.locks.set(lockKey, { lockId, expiresAt: now + ttlMs });
    return lockId;
  }

  async releaseLock(resource, lockId) {
    const lockKey = `lock:${resource}`;
    const existing = this.locks.get(lockKey);
    if (existing && existing.lockId === lockId) {
      this.locks.delete(lockKey);
      return true;
    }
    return false;
  }

  // --- Atomic Balance Cache & CAS Sync ---
  /**
   * Initializes or refreshes user balance in cache from database
   */
  async loadUserBalance(userId) {
    const user = db.getUserById(userId);
    if (!user) return null;

    const cacheKey = `user:balance:${userId}`;
    const cached = {
      balance: user.balance,
      version: user.version,
      lastSync: user.last_active_timestamp
    };
    this.set(cacheKey, cached, 3600);
    return cached;
  }

  /**
   * Mutates balance atomically under Redlock
   */
  async mutateBalance(userId, delta, newActiveTimestamp = Math.floor(Date.now() / 1000)) {
    const lockId = await this.acquireLock(`user:${userId}`, 3000);
    if (!lockId) {
      throw new Error(`Concurrency collision: could not acquire lock for user ${userId}`);
    }

    try {
      const cacheKey = `user:balance:${userId}`;
      let cached = this.get(cacheKey);
      if (!cached) {
        cached = await this.loadUserBalance(userId);
      }
      if (!cached) {
        throw new Error(`User ${userId} not found`);
      }

      cached.balance = Math.max(0, cached.balance + delta);
      cached.lastSync = newActiveTimestamp;
      this.set(cacheKey, cached, 3600);
      this.dirtyUsers.add(userId);

      return cached;
    } finally {
      await this.releaseLock(`user:${userId}`, lockId);
    }
  }

  /**
   * Synchronizes dirty balance from cache to PostgreSQL/Database via CAS (Compare-And-Swap)
   */
  async syncBalanceToDb(userId) {
    const lockId = await this.acquireLock(`user:${userId}`, 3000);
    if (!lockId) return false;

    try {
      const cacheKey = `user:balance:${userId}`;
      const cached = this.get(cacheKey);
      if (!cached) return false;

      const user = db.getUserById(userId);
      if (!user) return false;

      const lifetimeDelta = Math.max(0, cached.balance - user.balance);

      const success = db.updateUserBalanceCAS({
        id: userId,
        expectedVersion: cached.version,
        newBalance: cached.balance,
        lifetimeDelta,
        last_active_timestamp: cached.lastSync
      });

      if (success) {
        cached.version += 1;
        this.set(cacheKey, cached, 3600);
        this.dirtyUsers.delete(userId);
        return true;
      } else {
        // Version mismatch (concurrent modification in DB): reload from DB
        await this.loadUserBalance(userId);
        return false;
      }
    } finally {
      await this.releaseLock(`user:${userId}`, lockId);
    }
  }

  /**
   * Batch synchronization of all dirty users
   */
  async flushAllDirty() {
    const results = [];
    for (const userId of Array.from(this.dirtyUsers)) {
      results.push(await this.syncBalanceToDb(userId));
    }
    return results;
  }
}

export const cache = new FastCacheClient();
export default cache;
