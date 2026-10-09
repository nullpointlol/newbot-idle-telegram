import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORLDS_PATH = path.join(__dirname, '..', '..', 'content', 'worlds', 'worlds_catalog.json');

export const WORLDS = JSON.parse(fs.readFileSync(WORLDS_PATH, 'utf8'));

export class WorldsEngine {
  static getWorld(worldId) {
    return WORLDS.find(w => w.id === worldId) || WORLDS[0];
  }

  static getAllWorlds() {
    return WORLDS;
  }

  /**
   * Cost calculation adhering to the specific mathematical curve of the realm
   */
  static calculateFacilityCost(worldId, facilityIndex, currentLevel, count = 1) {
    const world = this.getWorld(worldId);
    const facility = world.facilities[facilityIndex];
    if (!facility) throw new Error(`Facility index ${facilityIndex} not found in world ${worldId}`);

    const r = facility.growth || world.growthRate || 1.12;
    const baseCost = facility.baseCost;

    if (count === 1) {
      return Math.round(baseCost * Math.pow(r, currentLevel));
    }

    const firstTerm = baseCost * Math.pow(r, currentLevel);
    const total = firstTerm * (Math.pow(r, count) - 1) / (r - 1);
    return Math.round(total);
  }

  /**
   * Production calculation taking into account the unique algorithmic curve
   */
  static calculateFacilityCPS(worldId, facilityIndex, level, multiplier = 1.0) {
    const world = this.getWorld(worldId);
    const facility = world.facilities[facilityIndex];
    if (!facility || level <= 0) return 0;

    let milestone = 1;
    // World 4 (mecha_droid) uses binary clock frequency milestones (every 16 levels)
    if (world.mathCurve === 'BinaryPowerCurve') {
      if (level >= 16) milestone *= 2;
      if (level >= 32) milestone *= 2;
      if (level >= 64) milestone *= 4;
      if (level >= 128) milestone *= 8;
    } else {
      // Standard milestone doubles
      if (level >= 25) milestone *= 2;
      if (level >= 50) milestone *= 2;
      if (level >= 100) milestone *= 2;
      if (level >= 200) milestone *= 2;
    }

    return facility.baseCps * level * milestone * multiplier;
  }

  /**
   * Aggregate total CPS across the realm
   */
  static calculateTotalWorldCPS(worldId, userFacilities = [], options = {}) {
    const world = this.getWorld(worldId);
    let baseSum = 0;

    for (let i = 0; i < world.facilities.length; i++) {
      const userLevel = userFacilities[i] ? userFacilities[i].level : 0;
      const userMult = userFacilities[i] ? userFacilities[i].multiplier : 1.0;
      baseSum += this.calculateFacilityCPS(worldId, i, userLevel, userMult);
    }

    // World-specific algorithm modifiers
    let worldModifier = 1.0;

    if (world.mathCurve === 'RegenerativeTides') {
      // Periodic tidal oscillation between 1.0 and 1.5
      const tidePhase = (Date.now() / 1000) % 60;
      worldModifier = tidePhase < 30 ? 1.5 : 1.0;
    } else if (world.mathCurve === 'GoldenRatioFibonacci') {
      // +10% alchemical bonus
      worldModifier = 1.10;
    } else if (world.mathCurve === 'GeometricSmooth') {
      // Zen purr continuous bonus
      worldModifier = 1.10;
    }

    const prestigePoints = options.prestigePoints || 0;
    const prestigeMult = 1.0 + prestigePoints * 0.02;
    const tempBoost = options.temporaryBoost || 1.0;

    return Math.round(baseSum * worldModifier * prestigeMult * tempBoost * 100) / 100;
  }
}

export default WorldsEngine;
