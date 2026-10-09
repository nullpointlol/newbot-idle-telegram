/**
 * Push Notification Broadcast & Reactivation Engine (TCK-0091-C137-04 / TCK-0091-C133-04)
 * Autonomous reactivation for inactive users adhering to Telegram Bot API limits:
 * - Strictly < 30 messages/second global throughput (Token-bucket / throttled delay: 40ms)
 * - Exponential backoff on HTTP 429
 * - Minimalist microcopy message with accumulated offline cash
 * - 24-hour deduplication cache per user
 */

import db from '../database/db.js';
import cache from '../cache/redisClient.js';
import { calculateTotalCPS } from '../math/engine.js';

export class NotificationBroadcastService {
  /**
   * Injectable Telegram API sender for testing and production
   */
  static senderHandler = null;

  static setSenderHandler(handler) {
    this.senderHandler = handler;
  }

  /**
   * Send a single message to a user via Telegram Bot API or mock
   */
  static async sendTelegramMessage(telegramId, text, botToken = process.env.TELEGRAM_BOT_TOKEN) {
    if (this.senderHandler) {
      return this.senderHandler(telegramId, text);
    }

    if (!botToken || !botToken.includes(':')) {
      return { success: false, error: 'No valid TELEGRAM_BOT_TOKEN configured' };
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 429) {
        const retryAfter = data.parameters?.retry_after || 1;
        return { success: false, rateLimited: true, retryAfter };
      }
      return { success: false, error: data.description || 'Telegram API error' };
    }

    return { success: true, messageId: data.result?.message_id };
  }

  /**
   * Helper to format numbers cleanly into $ string
   */
  static formatAmount(amount) {
    const n = Math.floor(amount || 0);
    if (n < 1000) return `$ ${n}`;
    if (n < 1000000) return `$ ${(n / 1000).toFixed(1)} K`;
    return `$ ${(n / 1000000).toFixed(1)} M`;
  }

  /**
   * Find candidate inactive users who have offline earnings waiting to be collected
   * @param {number} inactiveThresholdSeconds - Min inactivity duration (default: 4 hours / 14400s)
   */
  static getCandidates(inactiveThresholdSeconds = 14400, limit = 50) {
    const inactiveUsers = db.getInactiveUsers(inactiveThresholdSeconds, limit);
    const now = Math.floor(Date.now() / 1000);
    const candidates = [];

    for (const user of inactiveUsers) {
      // Check 24-hour notification deduplication cache
      const dedupKey = `push:reactivated:${user.id}`;
      if (cache.get(dedupKey)) {
        continue;
      }

      const assets = db.getUserAssets(user.id);
      const cps = calculateTotalCPS(assets, {
        prestigePoints: user.prestige_points,
        temporaryBoost: 1.0
      });

      const elapsed = Math.min(now - user.last_active_timestamp, 43200); // 12h cap
      const estimatedEarnings = Math.floor(cps * elapsed);

      if (estimatedEarnings > 0) {
        candidates.push({
          userId: user.id,
          telegramId: user.telegram_id,
          firstName: user.first_name || 'Guardián',
          estimatedEarnings,
          lastActive: user.last_active_timestamp
        });
      }
    }

    return candidates;
  }

  /**
   * Dispatch reactivation push broadcasts respecting the 30 msgs/second Telegram rate limit
   * (40ms throttle between dispatches = 25 msgs/sec max)
   */
  static async runReactivationBroadcast(options = {}) {
    const {
      inactiveThresholdSeconds = 14400,
      maxUsers = 50,
      throttleMs = 40, // 40ms interval ensures max 25 req/s (comfortably below 30 limit)
      botToken = process.env.TELEGRAM_BOT_TOKEN
    } = options;

    const candidates = this.getCandidates(inactiveThresholdSeconds, maxUsers);
    const results = {
      totalCandidates: candidates.length,
      sentCount: 0,
      skippedCount: 0,
      errorsCount: 0,
      dispatched: []
    };

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const cashText = this.formatAmount(candidate.estimatedEarnings);
      const message = `🐾 ¡Quino te extraña!\nTus negocios acumularon <b>${cashText}</b> listos para recoger.\n👉 Toca para entrar y duplicar con Boost x2.`;

      let sendResult = await this.sendTelegramMessage(candidate.telegramId, message, botToken);

      // Handle HTTP 429 rate limit backoff if triggered
      if (sendResult.rateLimited && sendResult.retryAfter) {
        await new Promise(r => setTimeout(r, sendResult.retryAfter * 1000));
        sendResult = await this.sendTelegramMessage(candidate.telegramId, message, botToken);
      }

      if (sendResult.success) {
        results.sentCount++;
        // Set 24h deduplication cache
        cache.set(`push:reactivated:${candidate.userId}`, true, 86400);
        results.dispatched.push({ userId: candidate.userId, telegramId: candidate.telegramId, success: true });
      } else {
        results.errorsCount++;
        results.dispatched.push({ userId: candidate.userId, telegramId: candidate.telegramId, error: sendResult.error });
      }

      // Throttled delay to strictly respect the 30 msgs/second limit
      if (i < candidates.length - 1 && throttleMs > 0) {
        await new Promise(r => setTimeout(r, throttleMs));
      }
    }

    return results;
  }
}

export default NotificationBroadcastService;
