import db from '../database/db.js';
import cache from '../cache/redisClient.js';

export const REFERRAL_BONUS = {
  REFERRER: 500.0,
  REFEREE: 500.0
};

export class ReferralService {
  /**
   * Generates a deep link for a user
   */
  static generateDeepLink(telegramId, botUsername = 'IdleTraderBot') {
    return `https://t.me/${botUsername}?start=ref_${telegramId}`;
  }

  /**
   * Extracts referrer Telegram ID from start payload
   */
  static parseReferrerFromPayload(payload) {
    if (!payload || typeof payload !== 'string') return null;
    const match = payload.match(/^ref_(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Processes a referral link upon user registration or onboarding
   * Bilateral rewards awarded idempotently.
   */
  static async processReferral({ refereeTelegramId, referrerTelegramId }) {
    if (!refereeTelegramId || !referrerTelegramId) {
      return { success: false, error: 'Missing telegram IDs' };
    }

    if (refereeTelegramId === referrerTelegramId) {
      return { success: false, error: 'Self-referral is forbidden' };
    }

    // 1. Acquire distributed lock for referee to prevent double registration race conditions
    const lockId = await cache.acquireLock(`referee:${refereeTelegramId}`, 3000);
    if (!lockId) {
      return { success: false, error: 'Concurrent referral processing underway' };
    }

    try {
      const referee = db.getUserByTelegramId(refereeTelegramId);
      const referrer = db.getUserByTelegramId(referrerTelegramId);

      if (!referee) return { success: false, error: 'Referee user not found' };
      if (!referrer) return { success: false, error: 'Referrer user not found' };

      // 2. Check if referee was already attributed
      const existing = db.getReferralByReferee(referee.id);
      if (existing) {
        return { success: false, error: 'Referee already has an assigned referrer' };
      }

      // 3. Create referral record in database
      const referral = db.createReferral({
        referrer_id: referrer.id,
        referee_id: referee.id,
        referrer_bonus: REFERRAL_BONUS.REFERRER,
        referee_bonus: REFERRAL_BONUS.REFEREE
      });

      // 4. Bilateral Reward Credit via CAS
      db.updateUserBalanceCAS({
        id: referrer.id,
        expectedVersion: referrer.version,
        newBalance: referrer.balance + REFERRAL_BONUS.REFERRER,
        lifetimeDelta: REFERRAL_BONUS.REFERRER
      });

      db.updateUserBalanceCAS({
        id: referee.id,
        expectedVersion: referee.version,
        newBalance: referee.balance + REFERRAL_BONUS.REFEREE,
        lifetimeDelta: REFERRAL_BONUS.REFEREE
      });

      // Ledger entries
      db.createTransaction({
        user_id: referrer.id,
        type: 'REFERRAL_BONUS',
        amount: REFERRAL_BONUS.REFERRER,
        metadata: { role: 'REFERRER', referee_id: referee.id }
      });

      db.createTransaction({
        user_id: referee.id,
        type: 'REFERRAL_BONUS',
        amount: REFERRAL_BONUS.REFEREE,
        metadata: { role: 'REFEREE', referrer_id: referrer.id }
      });

      db.markReferralBonusCredited(referral.id);

      // Invalidate cache balances
      await cache.loadUserBalance(referrer.id);
      await cache.loadUserBalance(referee.id);

      return {
        success: true,
        referralId: referral.id,
        referrerBonus: REFERRAL_BONUS.REFERRER,
        refereeBonus: REFERRAL_BONUS.REFEREE
      };
    } finally {
      await cache.releaseLock(`referee:${refereeTelegramId}`, lockId);
    }
  }
}

export default ReferralService;
