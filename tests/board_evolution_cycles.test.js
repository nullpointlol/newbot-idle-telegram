import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import db from '../src/database/db.js';
import cache from '../src/cache/redisClient.js';
import { NotificationBroadcastService } from '../src/services/notificationBroadcast.js';
import { TaskVerificationService } from '../src/services/tasks.js';
import { AdsgramService } from '../src/services/adsgram.js';
import { generateAdsgramSignature } from '../src/security/crypto.js';

describe('Board Evolution Cycles (Cycles 133-137) Advanced Architecture Suite', () => {
  const testTgId1 = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 50000);
  const testTgId2 = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 50000) + 100000;
  let user1, user2;

  before(() => {
    // Create users with past timestamp (> 5 hours ago)
    const fiveHoursAgo = Math.floor(Date.now() / 1000) - (5 * 3600);

    user1 = db.createUser({
      telegram_id: testTgId1,
      username: 'inactive_whale_' + testTgId1,
      first_name: 'Whale'
    });
    // Manually set old last_active_timestamp
    db.sqlite.prepare('UPDATE users SET last_active_timestamp = ? WHERE id = ?').run(fiveHoursAgo, user1.id);
    db.upsertAsset({ user_id: user1.id, asset_type: 'lemonade', level: 10 });

    user2 = db.createUser({
      telegram_id: testTgId2,
      username: 'inactive_miner_' + testTgId2,
      first_name: 'Miner'
    });
    db.sqlite.prepare('UPDATE users SET last_active_timestamp = ? WHERE id = ?').run(fiveHoursAgo, user2.id);
    db.upsertAsset({ user_id: user2.id, asset_type: 'lemonade', level: 5 });
  });

  test('TCK-0091-C137-04: Candidate Discovery & Offline Earnings Calculation', () => {
    const candidates = NotificationBroadcastService.getCandidates(14400, 200);
    assert.ok(candidates.length >= 2, 'Should detect at least 2 inactive candidates');

    const c1 = candidates.find(c => c.userId === user1.id);
    assert.ok(c1, 'Candidate 1 should be found');
    assert.ok(c1.estimatedEarnings > 0, 'Should have positive accumulated earnings');
    assert.equal(c1.telegramId, testTgId1);
  });

  test('TCK-0091-C137-04: Rate Limiter & Throttled Delivery (< 30 msgs/second limit)', async () => {
    const dispatched = [];
    const dispatchTimes = [];

    // Mock sender tracking dispatch timestamps
    NotificationBroadcastService.setSenderHandler(async (tgId, text) => {
      dispatchTimes.push(Date.now());
      dispatched.push({ tgId, text });
      return { success: true, messageId: Math.floor(Math.random() * 1000) };
    });

    const result = await NotificationBroadcastService.runReactivationBroadcast({
      inactiveThresholdSeconds: 14400,
      throttleMs: 35 // 35ms delay = max ~28 msgs/sec, strictly compliant with 30 msgs/s
    });

    assert.ok(result.sentCount >= 2, 'Should send messages to candidates');
    assert.ok(dispatched[0].text.includes('Quino te extraña'));

    if (dispatchTimes.length >= 2) {
      const diff = dispatchTimes[1] - dispatchTimes[0];
      assert.ok(diff >= 30, `Throttle between messages must be at least 30ms (actual: ${diff}ms)`);
    }

    NotificationBroadcastService.setSenderHandler(null);
  });

  test('TCK-0091-C137-04: Deduplication Cache prevents re-notifying within 24 hours', async () => {
    const candidatesAfter = NotificationBroadcastService.getCandidates(14400, 10);
    const c1 = candidatesAfter.find(c => c.userId === user1.id);
    assert.equal(c1, undefined, 'User1 must not be included again because 24h dedup key is active');
  });

  test('TCK-0091-C136-02: Telegram chat_member_updated webhook immediately invalidates cache', () => {
    const channelId = -100123456789;
    const userTelegramId = 44556677;

    // Simulate join event
    const joinUpdate = {
      chat_member: {
        chat: { id: channelId },
        from: { id: userTelegramId },
        new_chat_member: { status: 'member' }
      }
    };

    const joinResult = TaskVerificationService.handleChatMemberUpdated(joinUpdate);
    assert.ok(joinResult);
    assert.equal(joinResult.isMember, true);

    // Verify cache was set without calling API
    const cached = cache.get(`task:membership:${channelId}:${userTelegramId}`);
    assert.equal(cached, true);

    // Simulate leave event
    const leaveUpdate = {
      chat_member: {
        chat: { id: channelId },
        from: { id: userTelegramId },
        new_chat_member: { status: 'left' }
      }
    };

    const leaveResult = TaskVerificationService.handleChatMemberUpdated(leaveUpdate);
    assert.equal(leaveResult.isMember, false);
    const cachedLeave = cache.get(`task:membership:${channelId}:${userTelegramId}`);
    assert.equal(cachedLeave, false);
  });

  test('TCK-0091-C137-03: Replay protection with 24h TTL rejects duplicate reward callbacks', () => {
    const trackingId = 'board_cycle_track_' + Date.now();
    const payload = {
      userId: user1.id,
      event: 'reward',
      trackingId,
      timestamp: Math.floor(Date.now() / 1000)
    };
    const signature = generateAdsgramSignature(payload, 'adsgram_secret_test_key_2026');

    // First request must succeed
    const firstCall = AdsgramService.processWebhook(payload, signature);
    assert.equal(firstCall.success, true);
    assert.equal(firstCall.status, 200);

    // Immediate second call with identical trackingId must be rejected with 409 Conflict
    const replayCall = AdsgramService.processWebhook(payload, signature);
    assert.equal(replayCall.success, false);
    assert.equal(replayCall.status, 409);
    assert.match(replayCall.error, /Replay detected/);
  });

  test('TCK-0091-C3-03: Diagnostic & Support Console provides health and ledger audit', () => {
    const stats = db.getDiagnosticStats();
    assert.ok(stats.totalUsers >= 2);
    assert.ok(typeof stats.totalTransactions === 'number');

    const recentTx = db.getRecentTransactions(10);
    assert.ok(Array.isArray(recentTx));
  });
});
