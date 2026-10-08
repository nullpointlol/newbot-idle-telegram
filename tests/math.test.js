import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextLevelCost,
  calculateBulkCost,
  calculateAssetCPS,
  getMilestoneMultiplier,
  calculateTotalCPS,
  calculateClaimablePrestige,
  getPrestigeMultiplier
} from '../src/math/engine.js';
import { OfflineService, MAX_OFFLINE_SECONDS } from '../src/services/offline.js';
import db from '../src/database/db.js';

describe('TCK-0091-C1-02: Idle Math & Offline Progression Suite', () => {
  let testUser;

  before(() => {
    testUser = db.createUser({
      telegram_id: 995000 + Math.floor(Math.random() * 100000),
      username: 'offline_tester',
      first_name: 'IdlePro',
      initial_balance: 50.0,
      last_active_timestamp: 1000000 // Fixed historical timestamp for testing
    });

    // Seed test assets: Level 10 Lemonade + Level 5 Newspaper
    db.upsertAsset({ user_id: testUser.id, asset_type: 'lemonade', level: 10, multiplier: 1.0 });
    db.upsertAsset({ user_id: testUser.id, asset_type: 'newspaper', level: 5, multiplier: 1.0 });
  });

  test('Fórmula de Costo Geométrico: Level individual y compra en masa por serie geométrica', () => {
    // Lemonade base: 4, growthRate: 1.07
    // Cost(0) = 4 * 1.07^0 = 4.00
    assert.equal(calculateNextLevelCost('lemonade', 0), 4.00);

    // Cost(1) = 4 * 1.07^1 = 4.28
    assert.equal(calculateNextLevelCost('lemonade', 1), 4.28);

    // Bulk cost of 10 levels should match sum of individual costs
    let manualSum = 0;
    for (let i = 0; i < 10; i++) {
      manualSum += calculateNextLevelCost('lemonade', i);
    }
    const bulkCost = calculateBulkCost('lemonade', 0, 10);
    assert.ok(Math.abs(bulkCost - manualSum) < 0.2, `Bulk cost (${bulkCost}) should match manual sum (${manualSum})`);
  });

  test('Hitos de Producción (Milestones): Duplican velocidad en niveles 25, 50, 100', () => {
    assert.equal(getMilestoneMultiplier(10), 1);
    assert.equal(getMilestoneMultiplier(25), 2);
    assert.equal(getMilestoneMultiplier(50), 4);
    assert.equal(getMilestoneMultiplier(100), 8);
    assert.equal(getMilestoneMultiplier(200), 16);
  });

  test('CPS y Multiplicador de Prestigio: Acumulación correcta de ingresos pasivos', () => {
    // Lemonade level 10: 10 * baseCps(1) * milestone(1) = 10
    // Newspaper level 5: 5 * baseCps(20) * milestone(1) = 100
    // Sum = 110 CPS
    const assets = [
      { asset_type: 'lemonade', level: 10, multiplier: 1.0 },
      { asset_type: 'newspaper', level: 5, multiplier: 1.0 }
    ];

    const cpsWithoutPrestige = calculateTotalCPS(assets, { prestigePoints: 0 });
    assert.equal(cpsWithoutPrestige, 110.0);

    // With 10 prestige points (each grants +2% = +20% -> 1.2x)
    const cpsWithPrestige = calculateTotalCPS(assets, { prestigePoints: 10 });
    assert.equal(cpsWithPrestige, 132.0); // 110 * 1.2 = 132
  });

  test('Fórmula de Prestigio Adventure Capitalist: 150 * sqrt(Earnings / 10^12)', () => {
    // 1 Trillion earnings (10^12): 150 * sqrt(1) = 150 points
    const pointsAt1T = calculateClaimablePrestige(1000000000000);
    assert.equal(pointsAt1T, 150);

    // 4 Trillion earnings: 150 * sqrt(4) = 300 points
    const pointsAt4T = calculateClaimablePrestige(4000000000000);
    assert.equal(pointsAt4T, 300);
  });

  test('Gherkin: Usuario regresa tras 2 horas de inactividad y backend acredita ganancias exactamente', () => {
    const historicalTime = 1000000;
    const twoHoursLater = historicalTime + 7200; // 2 hours = 7200 seconds

    // Total CPS is 110.00
    // Expected offline earnings: 7200 * 110 = 792,000.00
    const result = OfflineService.processOfflineEarnings(testUser.id, {
      serverNow: twoHoursLater
    });

    assert.equal(result.elapsedSeconds, 7200);
    assert.equal(result.totalCPS, 110.0);
    assert.equal(result.earned, 792000.0);
    assert.equal(result.newBalance, 50.0 + 792000.0);

    // Verify DB reflects updated balance and new last_active_timestamp
    const freshUser = db.getUserById(testUser.id);
    assert.equal(freshUser.balance, 792050.0);
    assert.equal(freshUser.last_active_timestamp, twoHoursLater);
  });

  test('Límite de Inactividad (Cap): Tiempo fuera de línea está acotado por MAX_OFFLINE_SECONDS', () => {
    const user = db.getUserById(testUser.id);
    const excessiveTime = user.last_active_timestamp + 200000; // > 86400 seconds

    const result = OfflineService.processOfflineEarnings(testUser.id, {
      serverNow: excessiveTime
    });

    assert.equal(result.cappedSeconds, MAX_OFFLINE_SECONDS);
    assert.equal(result.earned, MAX_OFFLINE_SECONDS * 110.0);
  });

  test('Anti-Cheat: Desajustes de reloj y timestamps manipulados en cliente son neutralizados', () => {
    const user = db.getUserById(testUser.id);
    // Client sends time in the past or negative difference
    const pastTime = user.last_active_timestamp - 500;

    const result = OfflineService.processOfflineEarnings(testUser.id, {
      serverNow: pastTime
    });

    assert.equal(result.cappedSeconds, 0);
    assert.equal(result.earned, 0.0);
  });
});
