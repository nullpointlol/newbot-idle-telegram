import { calculateTotalCPS } from '../math/engine.js';
import db from '../database/db.js';
import cache from '../cache/redisClient.js';

export const MAX_OFFLINE_SECONDS = parseInt(process.env.MAX_OFFLINE_SECONDS || '86400', 10); // 24 hours cap

/**
 * Service for calculating and accrediting offline idle revenue
 * Server-authoritative Unix timestamp comparison to prevent client-side time cheats.
 */
export class OfflineService {
  /**
   * Process offline earnings for a given user
   * @param {string} userId - User UUID
   * @param {object} options - Options { clientTimestamp, serverNow, temporaryBoost }
   */
  static processOfflineEarnings(userId, options = {}) {
    const user = db.getUserById(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    const serverNow = options.serverNow || Math.floor(Date.now() / 1000);
    const lastActive = user.last_active_timestamp;

    // Time difference strictly evaluated against server clock
    let deltaSeconds = serverNow - lastActive;

    // Clock skew / anti-cheat guard:
    // If client timestamp manipulation or negative time diff, clamp to 0
    if (deltaSeconds < 0) {
      deltaSeconds = 0;
    }

    // Cap offline duration to MAX_OFFLINE_SECONDS
    const cappedDeltaSeconds = Math.min(deltaSeconds, MAX_OFFLINE_SECONDS);

    // Fetch user assets to compute accurate CPS
    const assets = db.getUserAssets(userId);
    const temporaryBoost = options.temporaryBoost || 1.0;
    const totalCPS = calculateTotalCPS(assets, {
      prestigePoints: user.prestige_points,
      temporaryBoost
    });

    const earned = Math.round(cappedDeltaSeconds * totalCPS * 100) / 100;
    const newBalance = Math.round((user.balance + earned) * 100) / 100;

    // Commit change atomically using CAS (Compare-And-Swap)
    const casSuccess = db.updateUserBalanceCAS({
      id: userId,
      expectedVersion: user.version,
      newBalance,
      lifetimeDelta: earned,
      last_active_timestamp: serverNow
    });

    if (!casSuccess) {
      throw new Error(`Concurrency race condition during offline sync for user ${userId}`);
    }

    // Refresh cache with new synchronized values
    cache.set(`user:balance:${userId}`, {
      balance: newBalance,
      version: user.version + 1,
      lastSync: serverNow
    }, 3600);

    return {
      userId,
      elapsedSeconds: deltaSeconds,
      cappedSeconds: cappedDeltaSeconds,
      totalCPS,
      earned,
      previousBalance: user.balance,
      newBalance,
      lastActiveTimestamp: lastActive,
      serverTimestamp: serverNow
    };
  }
}

export default OfflineService;
