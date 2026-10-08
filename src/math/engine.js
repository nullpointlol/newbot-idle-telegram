/**
 * Adventure Capitalist Mathematical Engine
 * Exact idle progression, geometric series cost calculations,
 * milestone speed multipliers, and prestige formulas.
 */

export const ASSET_DEFINITIONS = {
  lemonade: {
    name: 'Puesto de Limonadas',
    baseCost: 4.0,
    baseCps: 1.0,
    growthRate: 1.07,
    unlockOrder: 1
  },
  newspaper: {
    name: 'Reparto de Periódicos',
    baseCost: 60.0,
    baseCps: 20.0,
    growthRate: 1.15,
    unlockOrder: 2
  },
  carwash: {
    name: 'Lavadero de Autos',
    baseCost: 720.0,
    baseCps: 90.0,
    growthRate: 1.14,
    unlockOrder: 3
  },
  pizza: {
    name: 'Pizzería Artesanal',
    baseCost: 8640.0,
    baseCps: 360.0,
    growthRate: 1.13,
    unlockOrder: 4
  },
  donut: {
    name: 'Cadena de Donas',
    baseCost: 103680.0,
    baseCps: 2160.0,
    growthRate: 1.12,
    unlockOrder: 5
  },
  bank: {
    name: 'Banco Privado',
    baseCost: 1244160.0,
    baseCps: 6480.0,
    growthRate: 1.11,
    unlockOrder: 6
  }
};

/**
 * Milestone multiplier:
 * Adventure Capitalist doubles production at level 25, 50, 100, 200, 300, 400...
 */
export function getMilestoneMultiplier(level) {
  if (level <= 0) return 0;
  let multiplier = 1;
  if (level >= 25) multiplier *= 2;
  if (level >= 50) multiplier *= 2;
  if (level >= 100) multiplier *= 2;
  if (level >= 200) multiplier *= 2;
  if (level >= 300) multiplier *= 2;
  if (level >= 400) multiplier *= 2;
  return multiplier;
}

/**
 * Calculate the cost of the next level for an asset
 * Cost(L) = BaseCost * (r ^ L)
 */
export function calculateNextLevelCost(assetType, currentLevel) {
  const asset = ASSET_DEFINITIONS[assetType];
  if (!asset) throw new Error(`Unknown asset type: ${assetType}`);
  return Math.round(asset.baseCost * Math.pow(asset.growthRate, currentLevel) * 100) / 100;
}

/**
 * Calculate the bulk cost of purchasing `count` levels using Geometric Series:
 * TotalCost = BaseCost * (r ^ currentLevel) * (r ^ count - 1) / (r - 1)
 */
export function calculateBulkCost(assetType, currentLevel, count) {
  const asset = ASSET_DEFINITIONS[assetType];
  if (!asset) throw new Error(`Unknown asset type: ${assetType}`);
  if (count <= 0) return 0;
  if (count === 1) return calculateNextLevelCost(assetType, currentLevel);

  const r = asset.growthRate;
  const firstTerm = asset.baseCost * Math.pow(r, currentLevel);
  const total = firstTerm * (Math.pow(r, count) - 1) / (r - 1);
  return Math.round(total * 100) / 100;
}

/**
 * Calculate CPS (Coins Per Second) for a single asset
 */
export function calculateAssetCPS(assetType, level, assetCustomMultiplier = 1.0) {
  const asset = ASSET_DEFINITIONS[assetType];
  if (!asset || level <= 0) return 0;

  const milestone = getMilestoneMultiplier(level);
  return asset.baseCps * level * milestone * assetCustomMultiplier;
}

/**
 * Calculate permanent multiplier from prestige points
 * Each prestige point grants +2% (+0.02) permanent CPS
 */
export function getPrestigeMultiplier(prestigePoints) {
  if (!prestigePoints || prestigePoints <= 0) return 1.0;
  return 1.0 + prestigePoints * 0.02;
}

/**
 * Calculate total CPS for a portfolio of assets and active multipliers
 */
export function calculateTotalCPS(userAssets = [], options = {}) {
  const { prestigePoints = 0, temporaryBoost = 1.0 } = options;

  let baseCpsSum = 0;
  for (const asset of userAssets) {
    baseCpsSum += calculateAssetCPS(asset.asset_type, asset.level, asset.multiplier || 1.0);
  }

  const prestigeMult = getPrestigeMultiplier(prestigePoints);
  const total = baseCpsSum * prestigeMult * temporaryBoost;
  return Math.round(total * 100) / 100;
}

/**
 * Adventure Capitalist Prestige Reset Formula:
 * Claimable Angels/Prestige Points = floor(150 * sqrt(LifetimeEarnings / 10^12))
 */
export function calculateClaimablePrestige(lifetimeEarnings, currentPrestigePoints = 0) {
  const DIVISOR = 1000000000000; // 10^12 (1 Trillion)
  if (lifetimeEarnings <= 0) return 0;

  const totalCalculated = Math.floor(150 * Math.sqrt(lifetimeEarnings / DIVISOR));
  const claimable = Math.max(0, totalCalculated - currentPrestigePoints);
  return claimable;
}
