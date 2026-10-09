import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

class DatabaseAdapter {
  constructor(options = {}) {
    this.dbPath = options.dbPath || join(process.cwd(), 'data', 'app.db');
    mkdirSync(dirname(this.dbPath), { recursive: true });
    this.sqlite = new DatabaseSync(this.dbPath);
    this.init();
  }

  init() {
    // Enable Write-Ahead Logging (WAL) and busy timeout for high concurrency
    this.sqlite.exec('PRAGMA journal_mode = WAL;');
    this.sqlite.exec('PRAGMA busy_timeout = 5000;');
    this.sqlite.exec('PRAGMA foreign_keys = ON;');

    // Initialize tables identical to PostgreSQL schema
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        telegram_id INTEGER UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        balance REAL NOT NULL DEFAULT 0.0,
        lifetime_earnings REAL NOT NULL DEFAULT 0.0,
        prestige_points INTEGER NOT NULL DEFAULT 0,
        last_active_timestamp INTEGER NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        asset_type TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 0,
        multiplier REAL NOT NULL DEFAULT 1.0,
        purchased_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE (user_id, asset_type)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        telegram_payment_charge_id TEXT UNIQUE,
        provider_payment_charge_id TEXT,
        status TEXT NOT NULL DEFAULT 'COMPLETED',
        payload_hash TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_type TEXT NOT NULL,
        target_id TEXT,
        reward_multiplier REAL NOT NULL DEFAULT 2.0,
        multiplier_duration_seconds INTEGER NOT NULL DEFAULT 14400,
        status TEXT NOT NULL DEFAULT 'PENDING',
        expires_at TEXT,
        completed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS referrals (
        id TEXT PRIMARY KEY,
        referrer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referee_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        bonus_credited INTEGER NOT NULL DEFAULT 0,
        referrer_bonus REAL NOT NULL DEFAULT 500.0,
        referee_bonus REAL NOT NULL DEFAULT 500.0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_user_offline ON users(id, last_active_timestamp);
      CREATE INDEX IF NOT EXISTS idx_asset_user ON assets(user_id);
      CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_task_user ON tasks(user_id, status);
      CREATE INDEX IF NOT EXISTS idx_referral_referee ON referrals(referee_id);
    `);
  }

  // --- User Operations ---
  createUser({ telegram_id, username = '', first_name = '', initial_balance = 0.0, last_active_timestamp = Math.floor(Date.now() / 1000) }) {
    const existing = this.getUserByTelegramId(telegram_id);
    if (existing) {
      return existing;
    }
    const id = randomUUID();
    const stmt = this.sqlite.prepare(`
      INSERT INTO users (id, telegram_id, username, first_name, balance, lifetime_earnings, prestige_points, last_active_timestamp, version)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, 1)
      RETURNING *
    `);
    return stmt.get(id, telegram_id, username, first_name, initial_balance, initial_balance, last_active_timestamp);
  }

  getUserByTelegramId(telegram_id) {
    const stmt = this.sqlite.prepare('SELECT * FROM users WHERE telegram_id = ?');
    return stmt.get(telegram_id);
  }

  getUserById(id) {
    const stmt = this.sqlite.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * Optimistic Concurrency Control (Compare-And-Swap)
   * Updates balance and version only if current version matches expected version.
   * Returns true on success, false if version conflict occurred.
   */
  updateUserBalanceCAS({ id, expectedVersion, newBalance, lifetimeDelta = 0, last_active_timestamp = Math.floor(Date.now() / 1000) }) {
    const stmt = this.sqlite.prepare(`
      UPDATE users
      SET balance = ?,
          lifetime_earnings = lifetime_earnings + ?,
          last_active_timestamp = ?,
          version = version + 1,
          updated_at = datetime('now')
      WHERE id = ? AND version = ?
    `);
    const result = stmt.run(newBalance, lifetimeDelta, last_active_timestamp, id, expectedVersion);
    return result.changes > 0;
  }

  updatePrestige({ id, prestigePoints, expectedVersion }) {
    const stmt = this.sqlite.prepare(`
      UPDATE users
      SET balance = 0,
          prestige_points = prestige_points + ?,
          version = version + 1,
          updated_at = datetime('now')
      WHERE id = ? AND version = ?
    `);
    const result = stmt.run(prestigePoints, id, expectedVersion);
    return result.changes > 0;
  }

  // --- Asset Operations ---
  getUserAssets(user_id) {
    const stmt = this.sqlite.prepare('SELECT * FROM assets WHERE user_id = ? ORDER BY asset_type ASC');
    return stmt.all(user_id);
  }

  upsertAsset({ user_id, asset_type, level, multiplier = 1.0 }) {
    const stmt = this.sqlite.prepare(`
      INSERT INTO assets (id, user_id, asset_type, level, multiplier, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, asset_type) DO UPDATE SET
        level = excluded.level,
        multiplier = excluded.multiplier,
        updated_at = datetime('now')
      RETURNING *
    `);
    const id = randomUUID();
    return stmt.get(id, user_id, asset_type, level, multiplier);
  }

  resetAssetsForPrestige(user_id) {
    const stmt = this.sqlite.prepare('UPDATE assets SET level = 0, multiplier = 1.0 WHERE user_id = ?');
    stmt.run(user_id);
  }

  // --- Transaction Operations (Financial Ledger) ---
  createTransaction({ user_id, type, amount, telegram_payment_charge_id = null, provider_payment_charge_id = null, status = 'COMPLETED', payload_hash = null, metadata = null }) {
    const id = randomUUID();
    const metaStr = typeof metadata === 'object' && metadata !== null ? JSON.stringify(metadata) : metadata;
    const stmt = this.sqlite.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, telegram_payment_charge_id, provider_payment_charge_id, status, payload_hash, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
    return stmt.get(id, user_id, type, amount, telegram_payment_charge_id, provider_payment_charge_id, status, payload_hash, metaStr);
  }

  getTransactionByChargeId(chargeId) {
    if (!chargeId) return null;
    const stmt = this.sqlite.prepare('SELECT * FROM transactions WHERE telegram_payment_charge_id = ?');
    return stmt.get(chargeId);
  }

  // --- Referrals & Tasks ---
  createReferral({ referrer_id, referee_id, referrer_bonus = 500, referee_bonus = 500 }) {
    const id = randomUUID();
    const stmt = this.sqlite.prepare(`
      INSERT INTO referrals (id, referrer_id, referee_id, bonus_credited, referrer_bonus, referee_bonus)
      VALUES (?, ?, ?, 0, ?, ?)
      RETURNING *
    `);
    return stmt.get(id, referrer_id, referee_id, referrer_bonus, referee_bonus);
  }

  getReferralByReferee(referee_id) {
    const stmt = this.sqlite.prepare('SELECT * FROM referrals WHERE referee_id = ?');
    return stmt.get(referee_id);
  }

  markReferralBonusCredited(id) {
    const stmt = this.sqlite.prepare('UPDATE referrals SET bonus_credited = 1 WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  upsertTask({ user_id, task_type, target_id, reward_multiplier = 2.0, duration_seconds = 14400, status = 'PENDING', expires_at = null }) {
    const id = randomUUID();
    const stmt = this.sqlite.prepare(`
      INSERT INTO tasks (id, user_id, task_type, target_id, reward_multiplier, multiplier_duration_seconds, status, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
    return stmt.get(id, user_id, task_type, target_id, reward_multiplier, duration_seconds, status, expires_at);
  }

  getTask(id) {
    const stmt = this.sqlite.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id);
  }

  completeTask(id) {
    const stmt = this.sqlite.prepare(`
      UPDATE tasks
      SET status = 'CLAIMED',
          completed_at = datetime('now')
      WHERE id = ? AND status = 'PENDING'
    `);
    return stmt.run(id).changes > 0;
  }

  getInactiveUsers(inactiveThresholdSeconds = 14400, maxResults = 100) {
    const cutoff = Math.floor(Date.now() / 1000) - inactiveThresholdSeconds;
    const stmt = this.sqlite.prepare(`
      SELECT * FROM users
      WHERE last_active_timestamp < ?
      ORDER BY last_active_timestamp ASC
      LIMIT ?
    `);
    return stmt.all(cutoff, maxResults);
  }

  close() {
    this.sqlite.close();
  }
}

// Singleton database instance
export const db = new DatabaseAdapter();
export default db;
