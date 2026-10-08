import { verifyAdsgramSignature } from '../security/crypto.js';
import db from '../database/db.js';
import cache from '../cache/redisClient.js';

export const ADSGRAM_SECRET = process.env.ADSGRAM_SECRET || 'adsgram_secret_test_key_2026';

export class AdsgramService {
  /**
   * Process incoming Server-to-Server (S2S) Adsgram reward webhook
   * @param {object} payload - { userId, event: 'reward', trackingId, timestamp }
   * @param {string} signature - HMAC-SHA256 signature header
   */
  static processWebhook(payload, signature) {
    if (!payload || !signature) {
      return { success: false, status: 400, error: 'Missing payload or signature' };
    }

    // 1. Cryptographic signature check
    const isValid = verifyAdsgramSignature(payload, signature, ADSGRAM_SECRET);
    if (!isValid) {
      return { success: false, status: 401, error: 'Invalid HMAC signature' };
    }

    const { userId, event, trackingId } = payload;
    if (event !== 'reward') {
      return { success: false, status: 400, error: 'Ignored non-reward event' };
    }

    // 2. Replay attack prevention: verify unique trackingId
    const nonceKey = `adsgram:tracking:${trackingId}`;
    if (cache.get(nonceKey)) {
      return { success: false, status: 409, error: 'Replay detected: trackingId already processed' };
    }
    // Set 24 hour TTL for tracking ID
    cache.set(nonceKey, 'PROCESSED', 86400);

    const user = db.getUserById(userId);
    if (!user) {
      return { success: false, status: 404, error: 'User not found' };
    }

    // 3. Grant temporary 2x multiplier for 4 hours (14400s)
    const durationSeconds = 14400;
    const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString();

    const task = db.upsertTask({
      user_id: userId,
      task_type: 'ADSGRAM_BOOST',
      target_id: trackingId,
      reward_multiplier: 2.0,
      duration_seconds: durationSeconds,
      status: 'CLAIMED',
      expires_at: expiresAt
    });

    // Record transaction
    db.createTransaction({
      user_id: userId,
      type: 'ADSGRAM_REWARD',
      amount: 0,
      status: 'COMPLETED',
      metadata: { trackingId, boost: 2.0, durationSeconds, expiresAt }
    });

    // Cache active boost for fast game loop evaluation
    cache.set(`user:boost:${userId}`, {
      multiplier: 2.0,
      expiresAt: Date.now() + durationSeconds * 1000
    }, durationSeconds);

    return {
      success: true,
      status: 200,
      reward: {
        multiplier: 2.0,
        durationSeconds,
        expiresAt
      }
    };
  }

  /**
   * Retrieves active ad boost multiplier (1.0 if expired)
   */
  static getActiveBoost(userId) {
    const boost = cache.get(`user:boost:${userId}`);
    if (!boost) return 1.0;
    if (boost.expiresAt < Date.now()) return 1.0;
    return boost.multiplier || 1.0;
  }
}

export default AdsgramService;
