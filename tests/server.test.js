import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';
import { generateAdsgramSignature } from '../src/security/crypto.js';
import { ADSGRAM_SECRET } from '../src/services/adsgram.js';
import db from '../src/database/db.js';

describe('Task 5: Core Server & Telegram Mini App Integration Suite', () => {
  let server;
  let baseUrl;
  let testTgId = 777001;

  before(async () => {
    process.env.NODE_ENV = 'test';
    server = createServer();
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  test('GET /health: Servidor responde en tiempo récord con RAM < 25MB (Cumplimiento NFR)', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.status, 'ok');
    assert.ok(data.uptime >= 0);
    assert.ok(data.heapUsedMB < 25, `Heap memory footprint (${data.heapUsedMB}MB) must be strictly under 25MB`);
  });

  test('POST /api/user/sync: Autocrea usuario y calcula ganancias offline iniciales', async () => {
    const res = await fetch(`${baseUrl}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId: testTgId,
        username: 'server_integration_tester',
        firstName: 'Tester'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();

    assert.ok(data.user);
    assert.equal(data.user.telegram_id, testTgId);
    assert.ok(Array.isArray(data.assets));
    assert.ok(data.offlineEarnings);
  });

  test('POST /api/asset/buy: Compra niveles de activo y descuenta balance transaccionalmente', async () => {
    const user = db.getUserByTelegramId(testTgId);

    // Give user enough money to buy
    db.updateUserBalanceCAS({
      id: user.id,
      expectedVersion: user.version,
      newBalance: 100.0
    });

    const freshUser = db.getUserById(user.id);

    const res = await fetch(`${baseUrl}/api/asset/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: freshUser.id,
        assetType: 'lemonade',
        count: 1
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.cost > 0);
    assert.equal(data.newBalance, Math.round((freshUser.balance - data.cost) * 100) / 100);
  });

  test('POST /webhook/adsgram: Recibe webhook con firma HMAC y activa multiplicador', async () => {
    const user = db.getUserByTelegramId(testTgId);
    const payload = {
      userId: user.id,
      event: 'reward',
      trackingId: 'e2e_adsgram_' + Date.now(),
      timestamp: Math.floor(Date.now() / 1000)
    };
    const signature = generateAdsgramSignature(payload, ADSGRAM_SECRET);

    const res = await fetch(`${baseUrl}/webhook/adsgram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Adsgram-Signature': signature
      },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.reward.multiplier, 2.0);
  });

  test('POST /webhook/telegram: Procesa pago exitoso con Telegram Stars de forma idempotente', async () => {
    const user = db.getUserByTelegramId(testTgId);
    const chargeId = 'e2e_charge_' + Date.now();

    const update = {
      message: {
        from: { id: user.telegram_id },
        successful_payment: {
          telegram_payment_charge_id: chargeId,
          total_amount: 25,
          invoice_payload: 'starter_pack'
        }
      }
    };

    const res = await fetch(`${baseUrl}/webhook/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.idempotent, false);
    assert.equal(data.granted.creditedBalance, 10000.0);
  });

  test('GET /: Servidor entrega correctamente el HTML de la Telegram Mini App', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<title>Tamagotchi Idle - Crianza de Mascotas<\/title>/);
    assert.match(html, /telegram-web-app\.js/);
  });
});
