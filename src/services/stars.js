import db from '../database/db.js';

export const STARS_CATALOG = {
  cosmetic_golden_suit: {
    id: 'cosmetic_golden_suit',
    name: 'Túnica del Emperador Dorado',
    starsCost: 50,
    type: 'COSMETIC',
    description: 'Atuendo imperial ceremonial para distinguir tu perfil en el reino'
  },
  permanent_multiplier_2x: {
    id: 'permanent_multiplier_2x',
    name: 'Bendición de los Dioses x2',
    starsCost: 150,
    type: 'ACCELERATOR',
    multiplier: 2.0,
    description: 'Duplica para siempre la producción de todas tus posesiones y talleres'
  },
  starter_pack: {
    id: 'starter_pack',
    name: 'Cofre del Tesoro Arcaico',
    starsCost: 25,
    type: 'BUNDLE',
    instantBonus: 10000.0,
    description: '10,000 monedas de bronce instantáneas para fundar tu imperio'
  }
};

export class TelegramStarsService {
  /**
   * Pre-checkout validation step required by Telegram Bot API
   */
  static handlePreCheckoutQuery(query) {
    const { id, currency, total_amount, invoice_payload } = query;

    // Telegram Stars always use currency "XTR"
    if (currency !== 'XTR') {
      return { ok: false, error_message: 'Only Telegram Stars (XTR) accepted' };
    }

    const item = STARS_CATALOG[invoice_payload];
    if (!item) {
      return { ok: false, error_message: 'Invalid item in invoice payload' };
    }

    if (total_amount < item.starsCost) {
      return { ok: false, error_message: 'Insufficient Stars specified' };
    }

    return { ok: true, pre_checkout_query_id: id };
  }

  /**
   * Processes confirmed successful payment with strict idempotency
   */
  static handleSuccessfulPayment({ userId, payment }) {
    const {
      telegram_payment_charge_id,
      provider_payment_charge_id,
      total_amount,
      invoice_payload
    } = payment;

    if (!telegram_payment_charge_id) {
      throw new Error('Missing telegram_payment_charge_id');
    }

    // 1. Idempotency Check: prevent duplicate crediting upon network timeouts / webhook retries
    const existingTx = db.getTransactionByChargeId(telegram_payment_charge_id);
    if (existingTx) {
      return {
        idempotent: true,
        alreadyProcessed: true,
        transaction: existingTx,
        message: 'Transaction already credited'
      };
    }

    const user = db.getUserById(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    const item = STARS_CATALOG[invoice_payload] || {
      name: 'Custom Accelerator',
      type: 'COSMETIC'
    };

    // 2. Persist transaction into financial ledger
    const tx = db.createTransaction({
      user_id: userId,
      type: 'TELEGRAM_STARS',
      amount: total_amount,
      telegram_payment_charge_id,
      provider_payment_charge_id,
      status: 'COMPLETED',
      metadata: { item, invoice_payload }
    });

    // 3. Grant digital goods / accelerators
    let grantResult = {};
    if (item.type === 'BUNDLE' && item.instantBonus) {
      db.updateUserBalanceCAS({
        id: userId,
        expectedVersion: user.version,
        newBalance: user.balance + item.instantBonus,
        lifetimeDelta: item.instantBonus
      });
      grantResult = { creditedBalance: item.instantBonus };
    } else if (item.type === 'ACCELERATOR' && item.multiplier) {
      // Upgrade global asset multipliers
      const assets = db.getUserAssets(userId);
      for (const asset of assets) {
        db.upsertAsset({
          user_id: userId,
          asset_type: asset.asset_type,
          level: asset.level,
          multiplier: (asset.multiplier || 1.0) * item.multiplier
        });
      }
      grantResult = { permanentMultiplier: item.multiplier };
    } else {
      grantResult = { cosmeticUnlocked: item.id };
    }

    return {
      idempotent: false,
      alreadyProcessed: false,
      transaction: tx,
      granted: grantResult
    };
  }
}

export default TelegramStarsService;
