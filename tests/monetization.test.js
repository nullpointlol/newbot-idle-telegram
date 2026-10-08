import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { generateAdsgramSignature, verifyAdsgramSignature } from '../src/security/crypto.js';
import { AdsgramService, ADSGRAM_SECRET } from '../src/services/adsgram.js';
import { TelegramStarsService, STARS_CATALOG } from '../src/services/stars.js';
import db from '../src/database/db.js';

describe('TCK-0091-C1-03: Adsgram & Telegram Stars Monetization Suite', () => {
  let testUser;

  before(() => {
    testUser = db.createUser({
      telegram_id: 990000 + Math.floor(Math.random() * 100000),
      username: 'monetized_trader',
      first_name: 'MoneyMaker',
      initial_balance: 500.0,
      last_active_timestamp: Math.floor(Date.now() / 1000)
    });

    db.upsertAsset({ user_id: testUser.id, asset_type: 'lemonade', level: 5, multiplier: 1.0 });
  });

  test('Firma Criptográfica HMAC: Verificación y rechazo de payloads alterados', () => {
    const payload = { userId: testUser.id, event: 'reward', trackingId: 'track_123' };
    const validSig = generateAdsgramSignature(payload, ADSGRAM_SECRET);

    assert.equal(verifyAdsgramSignature(payload, validSig, ADSGRAM_SECRET), true, 'Valid signature must pass');
    assert.equal(verifyAdsgramSignature(payload, 'invalid_signature_hex', ADSGRAM_SECRET), false, 'Tampered signature must fail');
  });

  test('Gherkin: Usuario visualiza anuncio Adsgram y backend acredita multiplicador temporal x2', () => {
    const trackingId = 'adsgram_evt_' + Date.now();
    const payload = {
      userId: testUser.id,
      event: 'reward',
      trackingId,
      timestamp: Math.floor(Date.now() / 1000)
    };
    const signature = generateAdsgramSignature(payload, ADSGRAM_SECRET);

    const result = AdsgramService.processWebhook(payload, signature);
    assert.equal(result.success, true);
    assert.equal(result.reward.multiplier, 2.0);
    assert.equal(result.reward.durationSeconds, 14400);

    // Verify active boost in service
    const activeBoost = AdsgramService.getActiveBoost(testUser.id);
    assert.equal(activeBoost, 2.0, 'User should have active 2x boost');
  });

  test('Adsgram Replay Protection: Tracking ID duplicado es rechazado con error 409', () => {
    const trackingId = 'adsgram_replay_test_' + Date.now();
    const payload = {
      userId: testUser.id,
      event: 'reward',
      trackingId,
      timestamp: Math.floor(Date.now() / 1000)
    };
    const signature = generateAdsgramSignature(payload, ADSGRAM_SECRET);

    // First call succeeds
    const res1 = AdsgramService.processWebhook(payload, signature);
    assert.equal(res1.success, true);

    // Immediate second call with identical trackingId must be blocked
    const res2 = AdsgramService.processWebhook(payload, signature);
    assert.equal(res2.success, false);
    assert.equal(res2.status, 409, 'Replay attempt must return HTTP 409 Conflict');
  });

  test('Telegram Stars Pre-Checkout: Valida moneda XTR y catálogo de ítems', () => {
    const validQuery = {
      id: 'pre_check_001',
      currency: 'XTR',
      total_amount: 50,
      invoice_payload: 'cosmetic_golden_suit'
    };
    const result = TelegramStarsService.handlePreCheckoutQuery(validQuery);
    assert.equal(result.ok, true);

    // Invalid currency
    const invalidCurrency = { ...validQuery, currency: 'USD' };
    assert.equal(TelegramStarsService.handlePreCheckoutQuery(invalidCurrency).ok, false);
  });

  test('Gherkin: Usuario paga con Stars y backend acredita acelerador con ledger idempotente', () => {
    const chargeId = 'stars_charge_' + Date.now();
    const initialBalance = db.getUserById(testUser.id).balance;

    const payment = {
      telegram_payment_charge_id: chargeId,
      provider_payment_charge_id: 'provider_123',
      total_amount: 25,
      invoice_payload: 'starter_pack'
    };

    // First payment execution: credits starter pack bonus (10,000)
    const res1 = TelegramStarsService.handleSuccessfulPayment({
      userId: testUser.id,
      payment
    });

    assert.equal(res1.idempotent, false);
    assert.equal(res1.alreadyProcessed, false);
    assert.equal(res1.granted.creditedBalance, 10000.0);

    const updatedUser = db.getUserById(testUser.id);
    assert.equal(updatedUser.balance, initialBalance + 10000.0);

    // Duplicate webhook execution with identical chargeId (network timeout simulation)
    const res2 = TelegramStarsService.handleSuccessfulPayment({
      userId: testUser.id,
      payment
    });

    assert.equal(res2.idempotent, true);
    assert.equal(res2.alreadyProcessed, true, 'Duplicate chargeId must be marked as already processed');

    // Balance must NOT be credited a second time!
    const unchangedUser = db.getUserById(testUser.id);
    assert.equal(unchangedUser.balance, initialBalance + 10000.0);
  });
});
