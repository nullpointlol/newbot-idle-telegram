import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ASSET_DEFINITIONS = {
  feeding: {
    name: 'Comedero de Manjares',
    icon: '🍎',
    baseCost: 4.0,
    baseCps: 1.0,
    growthRate: 1.07,
    unlockOrder: 1,
    description: 'Frutas arcanas y néctar nutritivo para alimentar a tu compañero.'
  },
  hygiene: {
    name: 'Baño Termal & Burbujas',
    icon: '🧼',
    baseCost: 60.0,
    baseCps: 20.0,
    growthRate: 1.15,
    unlockOrder: 2,
    description: 'Aguas cristalinas y esponjas suaves para mantener su pelaje impecable.'
  },
  play: {
    name: 'Parque de Juegos & Estimulación',
    icon: '🎾',
    baseCost: 720.0,
    baseCps: 90.0,
    growthRate: 1.14,
    unlockOrder: 3,
    description: 'Pelotas saltarinas y circuitos de agilidad para disparar su alegría.'
  },
  shelter: {
    name: 'Nido Acolchado & Descanso',
    icon: '🛌',
    baseCost: 8640.0,
    baseCps: 360.0,
    growthRate: 1.13,
    unlockOrder: 4,
    description: 'Cápsula mullida donde tu mascota sueña y regenera vigor pasivo.'
  },
  training: {
    name: 'Cámara de Mutagénesis & Poder',
    icon: '🧬',
    baseCost: 103680.0,
    baseCps: 2160.0,
    growthRate: 1.12,
    unlockOrder: 5,
    description: 'Entrenamiento ancestral para despertar sus dones genéticos ocultos.'
  },
  sanctuary: {
    name: 'Templo de Ascensión & Linaje',
    icon: '👑',
    baseCost: 1244160.0,
    baseCps: 6480.0,
    growthRate: 1.11,
    unlockOrder: 6,
    description: 'Monumento sagrado que consagra a tu criatura como leyenda viva.'
  },
  // Backward compatibility aliases
  grain: { name: 'Comedero de Manjares', icon: '🍎', baseCost: 4.0, baseCps: 1.0, growthRate: 1.07, unlockOrder: 1 },
  pottery: { name: 'Baño Termal & Burbujas', icon: '🧼', baseCost: 60.0, baseCps: 20.0, growthRate: 1.15, unlockOrder: 2 },
  smithy: { name: 'Parque de Juegos & Estimulación', icon: '🎾', baseCost: 720.0, baseCps: 90.0, growthRate: 1.14, unlockOrder: 3 },
  vineyard: { name: 'Nido Acolchado & Descanso', icon: '🛌', baseCost: 8640.0, baseCps: 360.0, growthRate: 1.13, unlockOrder: 4 },
  fleet: { name: 'Cámara de Mutagénesis & Poder', icon: '🧬', baseCost: 103680.0, baseCps: 2160.0, growthRate: 1.12, unlockOrder: 5 },
  mint: { name: 'Templo de Ascensión & Linaje', icon: '👑', baseCost: 1244160.0, baseCps: 6480.0, growthRate: 1.11, unlockOrder: 6 },
  lemonade: { name: 'Comedero de Manjares', icon: '🍎', baseCost: 4.0, baseCps: 1.0, growthRate: 1.07, unlockOrder: 1 },
  newspaper: { name: 'Baño Termal & Burbujas', icon: '🧼', baseCost: 60.0, baseCps: 20.0, growthRate: 1.15, unlockOrder: 2 },
  carwash: { name: 'Parque de Juegos & Estimulación', icon: '🎾', baseCost: 720.0, baseCps: 90.0, growthRate: 1.14, unlockOrder: 3 },
  pizza: { name: 'Nido Acolchado & Descanso', icon: '🛌', baseCost: 8640.0, baseCps: 360.0, growthRate: 1.13, unlockOrder: 4 },
  donut: { name: 'Cámara de Mutagénesis & Poder', icon: '🧬', baseCost: 103680.0, baseCps: 2160.0, growthRate: 1.12, unlockOrder: 5 },
  bank: { name: 'Templo de Ascensión & Linaje', icon: '👑', baseCost: 1244160.0, baseCps: 6480.0, growthRate: 1.11, unlockOrder: 6 }
};

// Dynamically integrate all facilities from the 10 Algorithmic Worlds
try {
  const worldsPath = path.join(__dirname, '..', '..', 'content', 'worlds', 'worlds_catalog.json');
  if (fs.existsSync(worldsPath)) {
    const worlds = JSON.parse(fs.readFileSync(worldsPath, 'utf8'));
    for (const world of worlds) {
      if (Array.isArray(world.facilities)) {
        world.facilities.forEach((fac, idx) => {
          ASSET_DEFINITIONS[fac.id] = {
            name: fac.name,
            icon: fac.icon,
            baseCost: fac.baseCost,
            baseCps: fac.baseCps,
            growthRate: fac.growth || world.growthRate || 1.12,
            unlockOrder: idx + 1,
            description: world.specialMechanic
          };
        });
      }
    }
  }
} catch (e) {
  // Silent fallback in isolated test environments
}

/**
 * Currency Conversion for Option A: Metales Clásicos
 * 100 Bronce = 1 Plata
 * 100 Plata = 1 Oro (= 10,000 Bronce)
 */
export function formatAncientCurrency(totalBronze) {
  const amount = Math.floor(totalBronze || 0);
  if (amount < 0) return '0 🥉';

  if (amount < 100) {
    return `${amount} 🥉`;
  }

  const gold = Math.floor(amount / 10000);
  const silver = Math.floor((amount % 10000) / 100);
  const bronze = amount % 100;

  if (gold >= 1000000) {
    return `${(gold / 1000000).toFixed(2)}M 🥇`;
  }
  if (gold >= 1000) {
    return `${(gold / 1000).toFixed(1)}K 🥇`;
  }

  const parts = [];
  if (gold > 0) parts.push(`${gold} 🥇`);
  if (silver > 0) parts.push(`${silver} 🥈`);
  if (bronze > 0 && gold === 0) parts.push(`${bronze} 🥉`);

  return parts.join(' ') || `${amount} 🥉`;
}

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
