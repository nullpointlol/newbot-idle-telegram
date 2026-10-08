import crypto from 'node:crypto';

/**
 * Validates HMAC-SHA256 signature for Adsgram S2S webhooks
 * Uses timing-safe string comparison to prevent timing attacks.
 */
export function verifyAdsgramSignature(payload, signature, secret) {
  if (!signature || !secret) return false;

  const dataString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(dataString)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (sigBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

/**
 * Generates HMAC-SHA256 signature (used for testing and webhook signing)
 */
export function generateAdsgramSignature(payload, secret) {
  const dataString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(dataString)
    .digest('hex');
}

/**
 * Validates Telegram Mini App initData cryptographic authenticity
 * Standard Telegram WebApp authentication algorithm
 */
export function verifyTelegramInitData(initDataString, botToken) {
  if (!initDataString || !botToken) return false;

  const params = new URLSearchParams(initDataString);
  const hash = params.get('hash');
  if (!hash) return false;

  params.delete('hash');

  // Sort keys alphabetically
  const sortedPairs = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // 1. Secret key = HMAC_SHA256("WebAppData", botToken)
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // 2. Data check hash = HMAC_SHA256(secretKey, dataCheckString)
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(sortedPairs)
    .digest('hex');

  const hashBuffer = Buffer.from(hash, 'utf8');
  const calcBuffer = Buffer.from(calculatedHash, 'utf8');

  if (hashBuffer.length !== calcBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, calcBuffer);
}
