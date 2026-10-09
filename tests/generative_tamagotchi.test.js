import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CreatureGenerativeLoop } from '../src/content/generator.js';
import { calculateAssetCPS, getMilestoneMultiplier } from '../src/math/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

describe('GameDev: Tamagotchi Mechanics & Generative Content Loop Suite', () => {
  test('Generative Loop: Genera criaturas válidas para las 4 categorías (Doméstico, Salvaje, Fantasía, Sci-Fi)', () => {
    const categories = ['domestic', 'wild', 'fantasy', 'scifi'];

    for (const cat of categories) {
      const creature = CreatureGenerativeLoop.generateCreature(cat);
      assert.ok(creature.id);
      assert.ok(creature.name);
      assert.equal(creature.category, cat);
      assert.ok(creature.avatar);
      assert.ok(creature.carePreferences.favoriteActivity);
      assert.ok(creature.carePreferences.bonusMultiplier >= 1.0);
      assert.equal(creature.stages.length, 4);
    }
  });

  test('Emergency HALT Guardrail (gamedev-init): Interrumpe la generación si existe archivo HALT', () => {
    const haltFile = path.join(ROOT_DIR, 'HALT');
    try {
      // Create HALT file
      fs.writeFileSync(haltFile, 'EMERGENCY_HALT', 'utf8');

      assert.throws(() => {
        CreatureGenerativeLoop.generateCreature();
      }, /EMERGENCY HALT/);
    } finally {
      // Always cleanup HALT file
      if (fs.existsSync(haltFile)) {
        fs.unlinkSync(haltFile);
      }
    }
  });

  test('Headless Simulation: Simula 1,000 ticks de crianza sin NaN ni desbordamientos matemáticos', () => {
    let balance = 100.0;
    let feedingLevel = 1;
    let hygieneLevel = 1;

    for (let tick = 0; tick < 1000; tick++) {
      const feedingCps = calculateAssetCPS('feeding', feedingLevel);
      const hygieneCps = calculateAssetCPS('hygiene', hygieneLevel);
      const totalCps = feedingCps + hygieneCps;

      balance += totalCps * 0.1;

      // Simulate leveling up at ticks
      if (tick === 250) feedingLevel = 25;
      if (tick === 500) hygieneLevel = 50;
      if (tick === 800) feedingLevel = 100;
    }

    assert.ok(!isNaN(balance), 'Balance must never be NaN');
    assert.ok(isFinite(balance), 'Balance must be finite');
    assert.ok(balance > 100.0, 'Balance must grow positively');
  });

  test('Milestone Evolution Curves: Crecimiento exponencial cuadruplicado en hitos', () => {
    assert.equal(getMilestoneMultiplier(1), 1);
    assert.equal(getMilestoneMultiplier(25), 2);
    assert.equal(getMilestoneMultiplier(50), 4);
    assert.equal(getMilestoneMultiplier(100), 8);
  });
});
