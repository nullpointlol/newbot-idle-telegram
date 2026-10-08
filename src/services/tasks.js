import db from '../database/db.js';
import cache from '../cache/redisClient.js';

export class TaskVerificationService {
  /**
   * Injectable Telegram API fetcher (supports mocks in tests)
   */
  static fetchHandler = null;

  /**
   * Sets custom fetch handler for mocking Telegram Bot API calls
   */
  static setFetchHandler(handler) {
    this.fetchHandler = handler;
  }

  /**
   * Verifies if a user is a member of the sponsored Telegram channel
   * Uses Redis caching (15-min TTL) to prevent hammering Telegram API.
   */
  static async checkChannelMembership(channelId, userTelegramId, botToken = process.env.TELEGRAM_BOT_TOKEN) {
    const cacheKey = `task:membership:${channelId}:${userTelegramId}`;
    const cachedStatus = cache.get(cacheKey);

    if (cachedStatus !== null) {
      return cachedStatus;
    }

    let isMember = false;

    if (this.fetchHandler) {
      const response = await this.fetchHandler(channelId, userTelegramId);
      isMember = response.isMember;
    } else if (botToken && botToken.includes(':')) {
      try {
        const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(channelId)}&user_id=${userTelegramId}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && data.result) {
          const status = data.result.status;
          isMember = ['creator', 'administrator', 'member', 'restricted'].includes(status);
        }
      } catch (err) {
        // Fallback on network errors
        isMember = false;
      }
    }

    // Cache the verification result for 15 minutes (900 seconds)
    cache.set(cacheKey, isMember, 900);
    return isMember;
  }

  /**
   * Verifies and claims a channel subscription task
   */
  static async verifyAndClaimChannelTask({ userId, taskId, channelId, userTelegramId, botToken }) {
    const user = db.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const task = db.getTask(taskId);
    if (!task) return { success: false, error: 'Task not found' };
    if (task.status === 'CLAIMED') {
      return { success: false, error: 'Task already claimed' };
    }

    // 1. Check membership via Telegram Bot API with Redis cache
    const isSubscribed = await this.checkChannelMembership(channelId, userTelegramId, botToken);
    if (!isSubscribed) {
      return {
        success: false,
        error: 'Channel subscription not detected. Please join the channel first.'
      };
    }

    // 2. Mark task claimed
    db.completeTask(taskId);

    // 3. Grant temporary multiplier
    const durationSeconds = task.multiplier_duration_seconds || 14400;
    cache.set(`user:boost:${userId}`, {
      multiplier: task.reward_multiplier,
      expiresAt: Date.now() + durationSeconds * 1000
    }, durationSeconds);

    db.createTransaction({
      user_id: userId,
      type: 'TASK_REWARD',
      amount: 0,
      metadata: { taskId, channelId, multiplier: task.reward_multiplier, durationSeconds }
    });

    return {
      success: true,
      rewardMultiplier: task.reward_multiplier,
      durationSeconds,
      expiresAt: new Date(Date.now() + durationSeconds * 1000).toISOString()
    };
  }
}

export default TaskVerificationService;
