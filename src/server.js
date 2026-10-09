import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './database/db.js';
import cache from './cache/redisClient.js';
import { OfflineService } from './services/offline.js';
import { calculateNextLevelCost, calculateBulkCost, calculateTotalCPS, calculateClaimablePrestige } from './math/engine.js';
import { AdsgramService } from './services/adsgram.js';
import { TelegramStarsService } from './services/stars.js';
import { ReferralService } from './services/referral.js';
import { TaskVerificationService } from './services/tasks.js';
import { NotificationBroadcastService } from './services/notificationBroadcast.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEBAPP_DIR = path.join(__dirname, '..', 'webapp');

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch (e) {}
}

const PORT = parseInt(process.env.PORT || '3001', 10);

/**
 * Helper to parse JSON body
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1e6) { // 1MB payload limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Helper to send JSON responses
 */
function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Adsgram-Signature, Authorization'
  });
  res.end(json);
}

/**
 * Static file server for Telegram Mini App
 */
function serveStatic(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    }
  });
}

export function createServer() {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Adsgram-Signature, Authorization'
      });
      return res.end();
    }

    try {
      // 1. Health check & memory footprint monitor
      if (pathname === '/health' && req.method === 'GET') {
        const memUsage = process.memoryUsage();
        const rssMB = Math.round((memUsage.rss / 1024 / 1024) * 100) / 100;
        const heapUsedMB = Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100;
        return sendJson(res, 200, {
          status: 'ok',
          uptime: process.uptime(),
          heapUsedMB,
          memoryRSS_MB: rssMB,
          timestamp: Math.floor(Date.now() / 1000)
        });
      }

      // 1.1 Worlds & Algorithmic Catalog
      if (pathname === '/api/worlds' && req.method === 'GET') {
        const worldsPath = path.join(__dirname, '..', 'content', 'worlds', 'worlds_catalog.json');
        if (fs.existsSync(worldsPath)) {
          const worldsData = JSON.parse(fs.readFileSync(worldsPath, 'utf8'));
          return sendJson(res, 200, worldsData);
        }
        return sendJson(res, 404, { error: 'Worlds catalog not found' });
      }

      // 2. User Sync & Offline Calculation
      if (pathname === '/api/user/sync' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        let user = body.telegramId ? db.getUserByTelegramId(body.telegramId) : (body.userId ? db.getUserById(body.userId) : null);

        // Auto-create user if first time visiting
        if (!user && body.telegramId) {
          user = db.createUser({
            telegram_id: body.telegramId,
            username: body.username || '',
            first_name: body.firstName || '',
            initial_balance: 10.0 // Starting bonus
          });
          // Unlock initial lemonade stand at level 1
          db.upsertAsset({ user_id: user.id, asset_type: 'lemonade', level: 1 });
        }

        if (!user) return sendJson(res, 404, { error: 'User not found' });

        const boost = AdsgramService.getActiveBoost(user.id);
        const offlineResult = OfflineService.processOfflineEarnings(user.id, {
          temporaryBoost: boost
        });

        const assets = db.getUserAssets(user.id);
        const claimablePrestige = calculateClaimablePrestige(user.lifetime_earnings, user.prestige_points);

        return sendJson(res, 200, {
          user: db.getUserById(user.id),
          assets,
          offlineEarnings: offlineResult,
          activeBoost: boost,
          claimablePrestige
        });
      }

      // 3. Purchase Asset Level
      if (pathname === '/api/asset/buy' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { userId, assetType, count = 1 } = body;
        const user = db.getUserById(userId);
        if (!user) return sendJson(res, 404, { error: 'User not found' });

        const assets = db.getUserAssets(userId);
        const currentAsset = assets.find(a => a.asset_type === assetType);
        const currentLevel = currentAsset ? currentAsset.level : 0;

        const cost = calculateBulkCost(assetType, currentLevel, count);
        if (user.balance < cost) {
          return sendJson(res, 400, { error: 'Insufficient balance', cost, balance: user.balance });
        }

        // Deduct balance via CAS
        const newBalance = Math.round((user.balance - cost) * 100) / 100;
        const casSuccess = db.updateUserBalanceCAS({
          id: userId,
          expectedVersion: user.version,
          newBalance
        });

        if (!casSuccess) {
          return sendJson(res, 409, { error: 'Concurrency conflict, please retry' });
        }

        const updatedAsset = db.upsertAsset({
          user_id: userId,
          asset_type: assetType,
          level: currentLevel + count,
          multiplier: currentAsset ? currentAsset.multiplier : 1.0
        });

        return sendJson(res, 200, {
          success: true,
          asset: updatedAsset,
          cost,
          newBalance
        });
      }

      // 4. Prestige Reset
      if (pathname === '/api/prestige/claim' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const user = db.getUserById(body.userId);
        if (!user) return sendJson(res, 404, { error: 'User not found' });

        const claimable = calculateClaimablePrestige(user.lifetime_earnings, user.prestige_points);
        if (claimable <= 0) {
          return sendJson(res, 400, { error: 'No prestige points claimable' });
        }

        db.updatePrestige({
          id: user.id,
          prestigePoints: claimable,
          expectedVersion: user.version
        });

        // Reset asset levels to 0 except initial lemonade level 1
        db.resetAssetsForPrestige(user.id);
        db.upsertAsset({ user_id: user.id, asset_type: 'lemonade', level: 1 });

        return sendJson(res, 200, {
          success: true,
          claimedPoints: claimable,
          totalPrestigePoints: user.prestige_points + claimable
        });
      }

      // 5. Adsgram S2S Webhook
      if (pathname === '/webhook/adsgram' && req.method === 'POST') {
        const signature = req.headers['x-adsgram-signature'];
        const body = await parseJsonBody(req);
        const result = AdsgramService.processWebhook(body, signature);
        return sendJson(res, result.status || 200, result);
      }

      // 6. Telegram Bot Webhook
      if (pathname === '/webhook/telegram' && req.method === 'POST') {
        const update = await parseJsonBody(req);

        // Real-time chat_member_updated handling for task verification (TCK-0091-C136-02)
        if (update.chat_member) {
          const memberResult = TaskVerificationService.handleChatMemberUpdated(update);
          return sendJson(res, 200, { ok: true, chatMemberUpdated: memberResult });
        }

        // Pre-checkout query handling (Telegram Stars)
        if (update.pre_checkout_query) {
          const preCheck = TelegramStarsService.handlePreCheckoutQuery(update.pre_checkout_query);
          return sendJson(res, 200, preCheck);
        }

        // Successful payment handling (Telegram Stars)
        if (update.message && update.message.successful_payment) {
          const fromUser = db.getUserByTelegramId(update.message.from.id);
          if (fromUser) {
            const payRes = TelegramStarsService.handleSuccessfulPayment({
              userId: fromUser.id,
              payment: update.message.successful_payment
            });
            return sendJson(res, 200, payRes);
          }
        }

        // /start deep link handling
        if (update.message && update.message.text && update.message.text.startsWith('/start')) {
          const parts = update.message.text.split(' ');
          const payload = parts[1];
          const referrerTgId = ReferralService.parseReferrerFromPayload(payload);

          let user = db.getUserByTelegramId(update.message.from.id);
          if (!user) {
            user = db.createUser({
              telegram_id: update.message.from.id,
              username: update.message.from.username || '',
              first_name: update.message.from.first_name || '',
              initial_balance: 10.0
            });
            db.upsertAsset({ user_id: user.id, asset_type: 'lemonade', level: 1 });
          }

          if (referrerTgId && user) {
            await ReferralService.processReferral({
              refereeTelegramId: user.telegram_id,
              referrerTelegramId: referrerTgId
            });
          }

          return sendJson(res, 200, { ok: true, message: 'Welcome to Idle Capitalist TMA!' });
        }

        return sendJson(res, 200, { ok: true });
      }

      // 6.1 Push Reactivation Broadcast (TCK-0091-C137-04 / TCK-0091-C133-04)
      if (pathname === '/api/broadcast/reactivation' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = await NotificationBroadcastService.runReactivationBroadcast({
          inactiveThresholdSeconds: body.inactiveThresholdSeconds || 14400,
          maxUsers: body.maxUsers || 50
        });
        return sendJson(res, 200, result);
      }

      // 6.2 Diagnostic & Support Console (TCK-0091-C3-03)
      if (pathname === '/api/diagnostic' && req.method === 'GET') {
        const memoryUsage = process.memoryUsage();
        const stats = db.getDiagnosticStats();
        const transactions = db.getRecentTransactions(20);
        return sendJson(res, 200, {
          status: 'ok',
          uptimeSeconds: Math.floor(process.uptime()),
          memory: {
            heapUsedMB: +(memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
            rssMB: +(memoryUsage.rss / 1024 / 1024).toFixed(2)
          },
          network: {
            lanIp: '192.168.0.61',
            port: PORT,
            mobileUrl: `http://192.168.0.61:${PORT}/`,
            qrApiUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://192.168.0.61:${PORT}/`
          },
          stats,
          recentTransactions: transactions
        });
      }

      if (pathname === '/api/diagnostic/retry-transaction' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { chargeId } = body;
        if (!chargeId) {
          return sendJson(res, 400, { error: 'chargeId is required' });
        }
        const tx = db.getTransactionByChargeId(chargeId);
        if (!tx) {
          return sendJson(res, 404, { error: 'Transaction not found in ledger' });
        }
        return sendJson(res, 200, { ok: true, transaction: tx, message: 'Transaction verified and synced' });
      }

      // 7. Static Mini App Serving & UI Preview Studio
      if (pathname === '/' || pathname === '/index.html') {
        return serveStatic(req, res, path.join(WEBAPP_DIR, 'index.html'));
      }

      if (pathname === '/preview' || pathname === '/preview/' || pathname === '/preview.html') {
        return serveStatic(req, res, path.join(WEBAPP_DIR, 'preview.html'));
      }

      const requestedStaticFile = path.join(WEBAPP_DIR, pathname);
      if (fs.existsSync(requestedStaticFile) && fs.statSync(requestedStaticFile).isFile()) {
        return serveStatic(req, res, requestedStaticFile);
      }

      // Default 404
      sendJson(res, 404, { error: 'Route not found' });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
  });

  return server;
}

const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('server.js') ||
  process.argv[1].endsWith('server')
);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  function startServerOnPort(port, attemptsLeft = 5) {
    const server = createServer();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.warn(`⚠️ Puerto ${port} en uso. Intentando puerto ${port + 1}...`);
        startServerOnPort(port + 1, attemptsLeft - 1);
      } else {
        console.error('Error al iniciar el servidor:', err);
      }
    });

    server.listen(port, () => {
      console.log(`🚀 Telegram Idle Ecosystem running on http://localhost:${port}`);
      console.log(`📱 Telegram Mini App available at http://localhost:${port}/`);
    });
  }

  startServerOnPort(PORT);
}
