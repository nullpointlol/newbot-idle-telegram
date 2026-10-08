import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/database/db.js';
import { cache } from '../src/cache/redisClient.js';

describe('TCK-0091-C1-01: Database & Cache Resilience Suite', () => {
  let testUser;

  before(() => {
    // Clean test user if exists
    const existing = db.getUserByTelegramId(999001);
    if (!existing) {
      testUser = db.createUser({
        telegram_id: 999001,
        username: 'test_idle_trader',
        first_name: 'Test',
        initial_balance: 100.0,
        last_active_timestamp: Math.floor(Date.now() / 1000)
      });
    } else {
      testUser = existing;
    }
  });

  test('Gherkin: Usuario acumula recursos en Redis y sincroniza transaccionalmente en BD sin pérdida', async () => {
    // 1. Load user into cache
    const initialCached = await cache.loadUserBalance(testUser.id);
    assert.ok(initialCached, 'Cache should load user');
    const startBalance = initialCached.balance;
    const startVersion = initialCached.version;

    // 2. Mutate balance in cache (simulate 3 rapid clicks + 500 idle gain)
    await cache.mutateBalance(testUser.id, 500.0);
    const updatedCached = cache.get(`user:balance:${testUser.id}`);
    assert.equal(updatedCached.balance, startBalance + 500.0, 'Cache balance must reflect increment');

    // 3. Synchronize to database using Compare-And-Swap
    const syncSuccess = await cache.syncBalanceToDb(testUser.id);
    assert.equal(syncSuccess, true, 'CAS synchronization must succeed');

    // 4. Verify DB reflects state and incremented version
    const dbUser = db.getUserById(testUser.id);
    assert.equal(dbUser.balance, startBalance + 500.0, 'DB balance must match cache exactly');
    assert.equal(dbUser.version, startVersion + 1, 'DB version must increment by 1');
  });

  test('CAS Protection: Previene colisiones de concurrencia y sobreescrituras desfasadas', async () => {
    const freshUser = db.getUserById(testUser.id);
    const currentVersion = freshUser.version;

    // Attempting CAS with obsolete version should fail
    const conflictSuccess = db.updateUserBalanceCAS({
      id: testUser.id,
      expectedVersion: currentVersion - 1, // outdated version
      newBalance: 99999.0
    });
    assert.equal(conflictSuccess, false, 'Outdated version CAS update must be rejected');

    // Database balance must remain untouched
    const untouchedUser = db.getUserById(testUser.id);
    assert.equal(untouchedUser.balance, freshUser.balance);
  });

  test('Distributed Lock (Redlock): Previene accesos simultáneos conflictivos', async () => {
    const lock1 = await cache.acquireLock(`user:${testUser.id}`, 2000);
    assert.ok(lock1, 'First lock acquisition should succeed');

    // Second lock attempt on same resource before release must fail
    const lock2 = await cache.acquireLock(`user:${testUser.id}`, 2000);
    assert.equal(lock2, null, 'Concurrent lock attempt must return null');

    // Release lock
    const released = await cache.releaseLock(`user:${testUser.id}`, lock1);
    assert.equal(released, true, 'Lock release should succeed');

    // Can now acquire again
    const lock3 = await cache.acquireLock(`user:${testUser.id}`, 2000);
    assert.ok(lock3, 'Lock acquisition after release should succeed');
    await cache.releaseLock(`user:${testUser.id}`, lock3);
  });

  test('Financial Ledger: Restricción UNIQUE en telegram_payment_charge_id previene doble gasto', () => {
    const chargeId = 'tx_charge_stars_' + Date.now();

    // First transaction insert succeeds
    const tx1 = db.createTransaction({
      user_id: testUser.id,
      type: 'TELEGRAM_STARS',
      amount: 250.0,
      telegram_payment_charge_id: chargeId
    });
    assert.ok(tx1.id);

    // Duplicate transaction with same chargeId must throw UNIQUE constraint error
    assert.throws(() => {
      db.createTransaction({
        user_id: testUser.id,
        type: 'TELEGRAM_STARS',
        amount: 250.0,
        telegram_payment_charge_id: chargeId
      });
    }, /UNIQUE constraint failed/);
  });
});
