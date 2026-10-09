import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { WorldsEngine, WORLDS } from '../src/math/worldsEngine.js';

describe('GameDev Skill Verification: Headless Playtester Bot Simulation', () => {
  test('Persona 1: "The Tap Spammer Bot" ejecuta 500 toques y progresión de compra temprana', () => {
    // Test on Zen Cat and Mecha Droid
    for (const world of [WORLDS[0], WORLDS[3]]) {
      let balance = 10; // Starting bonus
      const facilities = world.facilities.map(() => ({ level: 0, multiplier: 1.0 }));
      facilities[0].level = 1; // 1st facility unlocked

      let totalClicks = 0;
      for (let step = 0; step < 500; step++) {
        // Tap gives click bonus based on CPS
        const cps = WorldsEngine.calculateTotalWorldCPS(world.id, facilities);
        const tapGain = Math.max(1, Math.round(cps * 0.1));
        balance += tapGain;
        totalClicks++;

        // Attempt buying lowest facility when affordable
        const cost0 = WorldsEngine.calculateFacilityCost(world.id, 0, facilities[0].level, 1);
        if (balance >= cost0) {
          balance -= cost0;
          facilities[0].level++;
        }
      }

      assert.equal(totalClicks, 500);
      assert.ok(facilities[0].level > 1, `Facility 0 should be leveled up (got ${facilities[0].level})`);
      assert.ok(balance >= 0, 'Balance must never be negative');
      assert.ok(!isNaN(balance), 'Balance must not be NaN');
    }
  });

  test('Persona 2: "The Idle AFK Saver Bot" simula desconexión prolongada y compras de alto nivel', () => {
    for (const world of WORLDS) {
      const facilities = world.facilities.map((f, i) => ({ level: i === 0 ? 10 : 0, multiplier: 1.0 }));
      const baseCps = WorldsEngine.calculateTotalWorldCPS(world.id, facilities);
      assert.ok(baseCps > 0, `World ${world.id} base CPS must be > 0`);

      // Simulate 8 hours offline (28,800 seconds)
      const offlineSeconds = 28800;
      const offlineEarnings = baseCps * offlineSeconds;

      assert.ok(!isNaN(offlineEarnings), `Offline earnings in ${world.id} must be valid number`);
      assert.ok(offlineEarnings > 1000, `Offline earnings should be substantial after 8h`);

      // Bot logs back in and buys facilities 1, 2, 3
      let bank = offlineEarnings;
      for (let i = 1; i <= 3; i++) {
        const cost = WorldsEngine.calculateFacilityCost(world.id, i, 0, 1);
        if (bank >= cost) {
          bank -= cost;
          facilities[i].level = 1;
        }
      }

      const upgradedCps = WorldsEngine.calculateTotalWorldCPS(world.id, facilities);
      assert.ok(upgradedCps > baseCps, `CPS must increase after buying higher facilities in ${world.id}`);
    }
  });

  test('Persona 3: "The Min-Max Optimizer Bot" evalúa ROI marginal en los 10 mundos', () => {
    // Tests all 10 worlds with an algorithmic greedy solver for 200 simulation ticks
    for (const world of WORLDS) {
      let balance = 50;
      const facilities = world.facilities.map((f, i) => ({ level: i === 0 ? 1 : 0, multiplier: 1.0 }));

      for (let tick = 0; tick < 200; tick++) {
        const currentCps = WorldsEngine.calculateTotalWorldCPS(world.id, facilities);
        balance += currentCps * 0.5;

        // Evaluate marginal ROI (gain / cost) for next level of all 6 facilities
        let bestChoice = -1;
        let bestRoi = -1;

        for (let i = 0; i < world.facilities.length; i++) {
          const cost = WorldsEngine.calculateFacilityCost(world.id, i, facilities[i].level, 1);
          if (balance >= cost) {
            const currentFacCps = WorldsEngine.calculateFacilityCPS(world.id, i, facilities[i].level, 1.0);
            const nextFacCps = WorldsEngine.calculateFacilityCPS(world.id, i, facilities[i].level + 1, 1.0);
            const deltaCps = nextFacCps - currentFacCps;
            const roi = deltaCps / cost;

            if (roi > bestRoi) {
              bestRoi = roi;
              bestChoice = i;
            }
          }
        }

        if (bestChoice !== -1) {
          const cost = WorldsEngine.calculateFacilityCost(world.id, bestChoice, facilities[bestChoice].level, 1);
          balance -= cost;
          facilities[bestChoice].level++;
        }
      }

      // Check results of optimization across all 10 realms
      const finalCps = WorldsEngine.calculateTotalWorldCPS(world.id, facilities);
      assert.ok(finalCps >= 10, `Optimized play in world ${world.id} must achieve high CPS (got ${finalCps})`);
      assert.ok(balance >= 0, `Balance in world ${world.id} must remain positive`);
    }
  });

  test('Anti-Deadlock & Economic Inflation Guard: Previene desbordamiento en 10,000 ticks', () => {
    // Run an extended stress simulation on the highest scaling world (AggressiveBurst)
    const world = WORLDS[1]; // frost_wolf
    let balance = 1000;
    const facilities = world.facilities.map((f, i) => ({ level: 25, multiplier: 1.0 }));

    for (let tick = 0; tick < 10000; tick++) {
      const cps = WorldsEngine.calculateTotalWorldCPS(world.id, facilities);
      balance += cps * 0.1;
      assert.ok(isFinite(balance), 'Balance must remain finite throughout 10,000 ticks');
    }

    assert.ok(balance > 0);
  });
});
