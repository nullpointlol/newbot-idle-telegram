import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { ReferralService, REFERRAL_BONUS } from '../src/services/referral.js';
import { TaskVerificationService } from '../src/services/tasks.js';
import db from '../src/database/db.js';
import cache from '../src/cache/redisClient.js';

describe('TCK-0091-C1-04: Referrals & Channel Task Verification Suite', () => {
  let referrerUser;
  let refereeUser;
  let taskUser;

  before(() => {
    referrerUser = db.createUser({
      telegram_id: 888001,
      username: 'influencer_tg',
      first_name: 'Alex',
      initial_balance: 100.0
    });

    refereeUser = db.createUser({
      telegram_id: 888002,
      username: 'newbie_tg',
      first_name: 'Bob',
      initial_balance: 50.0
    });

    taskUser = db.createUser({
      telegram_id: 888003,
      username: 'task_hunter',
      first_name: 'Charlie',
      initial_balance: 0.0
    });
  });

  test('Deep Links: Generación de enlace y parseo de payload de inicio', () => {
    const link = ReferralService.generateDeepLink(888001, 'IdleCapitalistBot');
    assert.equal(link, 'https://t.me/IdleCapitalistBot?start=ref_888001');

    const parsed = ReferralService.parseReferrerFromPayload('ref_888001');
    assert.equal(parsed, 888001);

    const invalid = ReferralService.parseReferrerFromPayload('invalid_payload');
    assert.equal(invalid, null);
  });

  test('Gherkin: Usuario invita a otro y sistema otorga bonificación bilateral (+500 cada uno)', async () => {
    const res = await ReferralService.processReferral({
      refereeTelegramId: refereeUser.telegram_id,
      referrerTelegramId: referrerUser.telegram_id
    });

    assert.equal(res.success, true);
    assert.equal(res.referrerBonus, 500.0);
    assert.equal(res.refereeBonus, 500.0);

    // Verify balances in database
    const freshReferrer = db.getUserById(referrerUser.id);
    const freshReferee = db.getUserById(refereeUser.id);

    assert.equal(freshReferrer.balance, 100.0 + 500.0);
    assert.equal(freshReferee.balance, 50.0 + 500.0);
  });

  test('Seguridad Referidos: Auto-referencia prohibida y duplicados prevenidos', async () => {
    // Attempt self-referral
    const selfRes = await ReferralService.processReferral({
      refereeTelegramId: referrerUser.telegram_id,
      referrerTelegramId: referrerUser.telegram_id
    });
    assert.equal(selfRes.success, false);
    assert.equal(selfRes.error, 'Self-referral is forbidden');

    // Attempt second referral for same referee
    const secondRes = await ReferralService.processReferral({
      refereeTelegramId: refereeUser.telegram_id,
      referrerTelegramId: referrerUser.telegram_id
    });
    assert.equal(secondRes.success, false);
    assert.match(secondRes.error, /already has an assigned referrer/);
  });

  test('Gherkin: Usuario se une a canal patrocinado y backend desbloquea multiplicador temporal', async () => {
    // Create pending task for taskUser
    const task = db.upsertTask({
      user_id: taskUser.id,
      task_type: 'CHANNEL_SUBSCRIBE',
      target_id: '@SponsoredEcosystem',
      reward_multiplier: 2.5,
      duration_seconds: 14400,
      status: 'PENDING'
    });

    // Mock Telegram Bot API response: simulate verified member
    let apiCallCount = 0;
    TaskVerificationService.setFetchHandler(async (channelId, userId) => {
      apiCallCount++;
      return { isMember: true, status: 'member' };
    });

    // 1. Verify and claim task
    const claimRes = await TaskVerificationService.verifyAndClaimChannelTask({
      userId: taskUser.id,
      taskId: task.id,
      channelId: '@SponsoredEcosystem',
      userTelegramId: taskUser.telegram_id
    });

    assert.equal(claimRes.success, true);
    assert.equal(claimRes.rewardMultiplier, 2.5);

    // Verify task status in database
    const claimedTask = db.getTask(task.id);
    assert.equal(claimedTask.status, 'CLAIMED');

    // 2. Redis Caching Test: subsequent check should hit cache without calling Telegram API again
    const cachedMember = await TaskVerificationService.checkChannelMembership('@SponsoredEcosystem', taskUser.telegram_id);
    assert.equal(cachedMember, true);
    assert.equal(apiCallCount, 1, 'Telegram API must not be called again due to Redis cache (protecting rate limit)');

    // 3. Claiming again must be rejected
    const repeatClaim = await TaskVerificationService.verifyAndClaimChannelTask({
      userId: taskUser.id,
      taskId: task.id,
      channelId: '@SponsoredEcosystem',
      userTelegramId: taskUser.telegram_id
    });
    assert.equal(repeatClaim.success, false);
    assert.match(repeatClaim.error, /already claimed/);
  });

  after(() => {
    TaskVerificationService.setFetchHandler(null);
  });
});
