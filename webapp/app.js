/**
 * COZY PET TYCOON - COMPLETE GAME ENGINE & UI CONTROLLER
 * Minimalist Microcopy, Juicy Micro-Interactions, Adventure Capitalist Loop,
 * Dynamic Skyline Window, and 8-bit Web Audio Sound Effects.
 */

import { PixelPetRenderer } from './pixelRenderer.js';

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// 7 Classic Businesses (Adventure Capitalist Blueprint)
const BUSINESS_DEFS = [
  { id: 'design_store', name: 'Tienda de diseño', icon: '🏪', baseCost: 4.0, baseCps: 1.0, growth: 1.07, cycleSec: 1.2 },
  { id: 'container_factory', name: 'Fábrica de contenedores', icon: '🏭', baseCost: 60.0, baseCps: 20.0, growth: 1.15, cycleSec: 3.0 },
  { id: 'coffee_shop', name: 'Cafetería', icon: '☕', baseCost: 720.0, baseCps: 90.0, growth: 1.14, cycleSec: 6.0 },
  { id: 'crypto_farm', name: 'Cripto', icon: '🪙', baseCost: 8640.0, baseCps: 360.0, growth: 1.13, cycleSec: 12.0 },
  { id: 'organic_farm', name: 'Granja Orgánica', icon: '🥬', baseCost: 103680.0, baseCps: 2160.0, growth: 1.12, cycleSec: 24.0 },
  { id: 'toy_factory', name: 'Fábrica de Juguetes', icon: '🧸', baseCost: 1244160.0, baseCps: 6480.0, growth: 1.11, cycleSec: 48.0 },
  { id: 'space_agency', name: 'Agencia Espacial', icon: '🚀', baseCost: 14929920.0, baseCps: 25920.0, growth: 1.10, cycleSec: 96.0 }
];

// Tycoon Mascot Phrases
const TYCOON_QUOTES = [
  '"Un gran imperio también necesita patas, mimos y comida. ♡"',
  '"¡Quino manda, tú cobras!"',
  '"Tus sueños también generan ingresos."',
  '"El ronroneo del gato es música para el capital."',
  '"Pequeños cuidados, billones de resultados."',
  '"¡A seguir haciendo crecer el imperio!"'
];

// Game State
let state = {
  user: null,
  assets: [],
  liveBalance: 1248376.0,
  currentCPS: 12430.0,
  goldBars: 42,
  gems: 3,
  buyMultiplier: 1, // 1, 10, 100, or 'max'
  activeSpeciesId: 'zen_cat',
  activeBoost: 1.0,
  claimablePrestige: 0,
  soundEnabled: true,
  theme: localStorage.getItem('pet_tycoon_theme') || 'color',

  // Pet Vitals
  pet: {
    name: 'Quino',
    food: 85,
    happy: 95,
    energy: 70,
    affectionHearts: 4
  },

  // Daily Tasks
  tasks: {
    feedFed: true,
    upgradedCount: 3,
    cashTargetReached: true,
    claimed: false
  },

  // Progress cycle fractions for businesses
  cycles: [0, 0, 0, 0, 0, 0, 0]
};

// Canvas Renderer
let petRenderer = null;
let audioCtx = null;

// ==========================================
// 8-BIT SOUND SYNTHESIZER (WEB AUDIO API)
// ==========================================
function playSound(freq, duration = 0.08, type = 'square') {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playCoinSound() {
  playSound(1800, 0.05);
  setTimeout(() => playSound(2400, 0.07), 50);
}

function playPetChime() {
  playSound(1200, 0.06, 'triangle');
  setTimeout(() => playSound(1600, 0.08, 'triangle'), 60);
  setTimeout(() => playSound(2200, 0.1, 'triangle'), 130);
}

// ==========================================
// PUNCHY MINIMALIST CURRENCY FORMATTER
// ==========================================
function formatCash(num) {
  const n = Math.floor(num || 0);
  if (n < 0) return '$ 0';

  if (n < 1000) {
    return `$ ${n}`;
  }
  if (n < 1000000) {
    return `$ ${(n / 1000).toFixed(1)} K`;
  }
  if (n < 1000000000) {
    return `$ ${(n / 1000000).toFixed(1)} M`;
  }
  if (n < 1000000000000) {
    return `$ ${(n / 1000000000).toFixed(2)} B`;
  }
  return `$ ${(n / 1000000000000).toFixed(2)} T`;
}

function formatRate(num) {
  const n = Math.floor(num || 0);
  if (n < 1000) return `+ $ ${n} /s`;
  if (n < 1000000) return `+ $ ${(n / 1000).toFixed(1)} K /s`;
  if (n < 1000000000) return `+ $ ${(n / 1000000).toFixed(1)} M /s`;
  return `+ $ ${(n / 1000000000).toFixed(2)} B /s`;
}

// ==========================================
// ADVENTURE CAPITALIST MATH & MILESTONES
// ==========================================
function getMilestone(level) {
  let m = 1;
  if (level >= 25) m *= 2;
  if (level >= 50) m *= 2;
  if (level >= 100) m *= 2;
  if (level >= 200) m *= 2;
  return m;
}

function calculateCost(baseCost, growth, currentLevel, count = 1) {
  if (count === 1) {
    return Math.round(baseCost * Math.pow(growth, currentLevel));
  }
  const first = baseCost * Math.pow(growth, currentLevel);
  const total = first * (Math.pow(growth, count) - 1) / (growth - 1);
  return Math.round(total);
}

function getMaxBuyable(baseCost, growth, currentLevel, balance) {
  let count = 0;
  let totalCost = 0;
  let nextCost = calculateCost(baseCost, growth, currentLevel);

  while (balance >= totalCost + nextCost && count < 1000) {
    totalCost += nextCost;
    count++;
    nextCost = calculateCost(baseCost, growth, currentLevel + count);
  }
  return { count: Math.max(1, count), cost: Math.max(nextCost, totalCost) };
}

// Symbiotic Pet Bliss Multiplier
function getPetBlissMultiplier() {
  const avg = (state.pet.food + state.pet.happy + state.pet.energy) / 3;
  if (avg >= 90) return 3.0; // Pet Bliss MAX
  if (avg >= 70) return 2.0; // Happy
  if (avg >= 40) return 1.5;
  return 1.0;
}

function computeTotalCPS() {
  let sum = 0;
  BUSINESS_DEFS.forEach((biz, idx) => {
    const asset = state.assets.find(a => a.asset_type === biz.id || (idx === 0 && a.asset_type === 'lemonade'));
    const level = asset ? asset.level : (idx === 0 ? 3 : (idx === 1 ? 2 : (idx === 2 ? 1 : (idx === 3 ? 1 : 0))));
    if (level > 0) {
      sum += biz.baseCps * level * getMilestone(level) * (asset?.multiplier || 1.0);
    }
  });

  const prestigeMult = 1.0 + (state.user?.prestige_points || 0) * 0.02;
  const blissMult = getPetBlissMultiplier();
  return sum * prestigeMult * blissMult * (state.activeBoost || 1.0);
}

// ==========================================
// DYNAMIC SKYLINE WINDOW (DAY / DUSK / NIGHT)
// ==========================================
function updateWindowSkyline() {
  const windowSky = document.getElementById('window-sky');
  if (!windowSky) return;

  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) {
    // Día
    windowSky.style.background = 'linear-gradient(180deg, #60a5fa 0%, #bfdbfe 100%)';
  } else if (hour >= 18 && hour < 21) {
    // Atardecer cálido
    windowSky.style.background = 'linear-gradient(180deg, #ea580c 0%, #fde047 100%)';
  } else {
    // Noche estrellada
    windowSky.style.background = 'linear-gradient(180deg, #090d16 0%, #1e293b 100%)';
  }
}

// ==========================================
// RENDER BIZ LIST
// ==========================================
function renderBusinessesList() {
  const container = document.getElementById('businesses-list');
  if (!container) return;
  container.innerHTML = '';

  BUSINESS_DEFS.forEach((biz, idx) => {
    const asset = state.assets.find(a => a.asset_type === biz.id || (idx === 0 && a.asset_type === 'lemonade'));
    const defaultLevels = [3, 2, 1, 1, 0, 0, 0];
    const level = asset ? asset.level : (defaultLevels[idx] || 0);

    let buyCount = state.buyMultiplier === 'max' ? 1 : state.buyMultiplier;
    let cost = calculateCost(biz.baseCost, biz.growth, level, buyCount);

    if (state.buyMultiplier === 'max') {
      const maxInfo = getMaxBuyable(biz.baseCost, biz.growth, level, state.liveBalance);
      buyCount = maxInfo.count;
      cost = maxInfo.cost;
    }

    const rate = level > 0 ? (biz.baseCps * level * getMilestone(level) * getPetBlissMultiplier()) : 0;
    const canAfford = state.liveBalance >= cost;

    const card = document.createElement('div');
    card.className = 'business-card';
    card.innerHTML = `
      <div class="biz-icon-box">${biz.icon}</div>
      <div class="biz-info-col">
        <div class="biz-title-row">
          <span class="biz-title">${biz.name}</span>
          <span class="biz-level-badge">Nv. ${level}</span>
        </div>
        <div class="biz-rate">+ ${formatCash(rate)} /s</div>
        <div class="biz-track">
          <div class="biz-fill" id="biz-fill-${idx}" style="width: ${level > 0 ? (state.cycles[idx] * 100) : 0}%"></div>
        </div>
      </div>
      <button class="biz-btn-buy" data-idx="${idx}" data-count="${buyCount}" ${!canAfford ? 'disabled' : ''}>
        <span>MEJORAR</span>
        <span class="biz-price-tag">${formatCash(cost)}</span>
      </button>
    `;
    container.appendChild(card);
  });

  // Attach button click events
  container.querySelectorAll('.biz-btn-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const count = parseInt(btn.dataset.count, 10);
      buyBusinessUpgrade(idx, count);
    });
  });
}

// Upgrade a business
async function buyBusinessUpgrade(bizIndex, count) {
  const biz = BUSINESS_DEFS[bizIndex];
  const asset = state.assets.find(a => a.asset_type === biz.id || (bizIndex === 0 && a.asset_type === 'lemonade'));
  const currentLevel = asset ? asset.level : (bizIndex === 0 ? 3 : (bizIndex === 1 ? 2 : (bizIndex === 2 ? 1 : (bizIndex === 3 ? 1 : 0))));
  const cost = calculateCost(biz.baseCost, biz.growth, currentLevel, count);

  if (state.liveBalance < cost) return;

  state.liveBalance -= cost;
  playCoinSound();

  if (asset) {
    asset.level += count;
  } else {
    state.assets.push({ asset_type: biz.id, level: currentLevel + count, multiplier: 1.0 });
  }

  // Update tasks
  state.tasks.upgradedCount++;

  state.currentCPS = computeTotalCPS();
  updateTopHUD();
  renderBusinessesList();

  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

  // Sync with backend if user exists
  if (state.user) {
    try {
      await fetch('/api/asset/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id, assetType: asset ? asset.asset_type : biz.id, count })
      });
    } catch (e) {}
  }
}

// ==========================================
// HUD UPDATES
// ==========================================
function updateTopHUD() {
  const balanceEl = document.getElementById('hud-balance');
  const cpsEl = document.getElementById('hud-cps');
  const goldEl = document.getElementById('hud-gold-count');
  const gemsEl = document.getElementById('hud-gems-count');

  if (balanceEl) balanceEl.textContent = formatCash(state.liveBalance);
  if (cpsEl) cpsEl.textContent = formatRate(state.currentCPS);
  if (goldEl) goldEl.textContent = state.goldBars;
  if (gemsEl) gemsEl.textContent = state.gems;

  // Update claimable angels in prestige tab
  const angelsEl = document.getElementById('claimable-angels');
  if (angelsEl) {
    angelsEl.textContent = `${state.claimablePrestige} 🧬`;
  }
  const btnPrestige = document.getElementById('btn-claim-prestige');
  if (btnPrestige) {
    btnPrestige.disabled = state.claimablePrestige <= 0;
  }
}

// ==========================================
// PET INTERACTION & DIORAMA PROPS
// ==========================================
function setupPetInteractions() {
  const bedEl = document.getElementById('pet-interactive-bed');
  const bowlEl = document.getElementById('prop-bowl');
  const ballEl = document.getElementById('prop-ball');

  // Pet in Bed Tap (Mimos / Purrs)
  if (bedEl) {
    bedEl.addEventListener('click', () => {
      if (petRenderer) petRenderer.wakeUp();

      state.pet.happy = Math.min(100, state.pet.happy + 5);
      const clickIncome = Math.max(10, Math.round(state.currentCPS * 0.05));
      state.liveBalance += clickIncome;

      playPetChime();
      spawnHeart();
      updateVitalsUI();
      updateTopHUD();

      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });
  }

  // Food Bowl Tap (Alimentar)
  if (bowlEl) {
    bowlEl.addEventListener('click', () => {
      state.pet.food = Math.min(100, state.pet.food + 15);
      state.tasks.feedFed = true;
      playCoinSound();
      updateVitalsUI();
      updateTasksUI();

      // Little toast
      const tycoonBubble = document.getElementById('tycoon-speech');
      if (tycoonBubble) {
        tycoonBubble.textContent = '¡Quino comió delicioso manjar! 🍖';
      }
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    });
  }

  // Toy Ball Tap (Jugar)
  if (ballEl) {
    ballEl.addEventListener('click', () => {
      state.pet.happy = Math.min(100, state.pet.happy + 10);
      state.pet.energy = Math.max(20, state.pet.energy - 3);
      playPetChime();
      updateVitalsUI();

      ballEl.style.transform = 'translateX(-15px) rotate(-45deg)';
      setTimeout(() => {
        ballEl.style.transform = 'none';
      }, 300);

      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    });
  }
}

function spawnHeart() {
  const container = document.getElementById('hearts-layer');
  if (!container) return;

  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = '💖';
  heart.style.left = `${Math.random() * 50 + 25}%`;
  heart.style.top = `${Math.random() * 30 + 10}%`;
  container.appendChild(heart);

  setTimeout(() => heart.remove(), 800);
}

function updateVitalsUI() {
  const foodBar = document.getElementById('vital-food-bar');
  const happyBar = document.getElementById('vital-happy-bar');
  const energyBar = document.getElementById('vital-energy-bar');

  if (foodBar) foodBar.style.width = `${state.pet.food}%`;
  if (happyBar) happyBar.style.width = `${state.pet.happy}%`;
  if (energyBar) energyBar.style.width = `${state.pet.energy}%`;
}

function updateTasksUI() {
  const taskCash = document.getElementById('task-cash');
  const taskCashIcon = document.getElementById('task-cash-icon');
  const progressLabel = document.getElementById('tasks-progress-label');

  const cashDone = state.liveBalance >= 500000;
  if (taskCash) taskCash.checked = cashDone;
  if (taskCashIcon) taskCashIcon.textContent = cashDone ? '✔' : '';

  let doneCount = (state.tasks.feedFed ? 1 : 0) + (state.tasks.upgradedCount >= 3 ? 1 : 0) + (cashDone ? 1 : 0);
  if (progressLabel) progressLabel.textContent = `${doneCount}/3`;

  const btnClaim = document.getElementById('btn-claim-tasks');
  if (btnClaim) {
    if (doneCount === 3 && !state.tasks.claimed) {
      btnClaim.textContent = 'RECLAMAR 💎 5';
      btnClaim.disabled = false;
    } else if (state.tasks.claimed) {
      btnClaim.textContent = 'RECLAMADO ✔';
      btnClaim.disabled = true;
    }
  }
}

// ==========================================
// TYCOON QUOTE ROTATION
// ==========================================
function startTycoonQuoteLoop() {
  let quoteIndex = 0;
  setInterval(() => {
    quoteIndex = (quoteIndex + 1) % TYCOON_QUOTES.length;
    const bubble = document.getElementById('tycoon-speech');
    if (bubble) {
      bubble.style.opacity = '0';
      setTimeout(() => {
        bubble.textContent = TYCOON_QUOTES[quoteIndex];
        bubble.style.opacity = '1';
      }, 200);
    }
  }, 12000);
}

// ==========================================
// BOTTOM NAVIGATION
// ==========================================
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      const activePanel = document.getElementById(`tab-${targetTab}`);
      if (activePanel) activePanel.classList.add('active');

      if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
    });
  });
}

// ==========================================
// THEME & SOUND CONTROLS
// ==========================================
function setupHeaderControls() {
  const btnTheme = document.getElementById('btn-toggle-theme');
  const btnSound = document.getElementById('btn-toggle-sound');
  const appEl = document.getElementById('app');

  // Apply initial theme
  if (appEl) appEl.dataset.theme = state.theme;

  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      state.theme = state.theme === 'color' ? '1bit' : 'color';
      if (appEl) appEl.dataset.theme = state.theme;
      localStorage.setItem('pet_tycoon_theme', state.theme);
      playCoinSound();
      renderBusinessesList();
    });
  }

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      btnSound.textContent = state.soundEnabled ? '🔊' : '🔇';
    });
  }

  // Multiplier Toggles
  const multButtons = document.querySelectorAll('.mult-btn');
  multButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      multButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const val = btn.dataset.mult;
      state.buyMultiplier = val === 'max' ? 'max' : parseInt(val, 10);
      playCoinSound();
      renderBusinessesList();
    });
  });

  // Claim Daily Tasks
  const btnClaim = document.getElementById('btn-claim-tasks');
  if (btnClaim) {
    btnClaim.addEventListener('click', () => {
      if (!state.tasks.claimed) {
        state.gems += 5;
        state.tasks.claimed = true;
        playCoinSound();
        updateTopHUD();
        updateTasksUI();
      }
    });
  }

  // Watch Adsgram Ad
  const btnAd = document.getElementById('btn-watch-ad');
  if (btnAd) {
    btnAd.addEventListener('click', async () => {
      state.activeBoost = 2.0;
      state.currentCPS = computeTotalCPS();
      playCoinSound();
      updateTopHUD();
      alert('🐾 ¡Boost x2 activado por 4 horas!');
    });
  }

  // Copy Referral
  const btnCopyRef = document.getElementById('btn-copy-ref');
  if (btnCopyRef) {
    btnCopyRef.addEventListener('click', () => {
      const input = document.getElementById('ref-link-input');
      if (input) {
        navigator.clipboard.writeText(input.value);
        alert('📜 Enlace de socio copiado.');
      }
    });
  }

  // Close Offline Modal
  const btnCloseOffline = document.getElementById('btn-close-offline');
  if (btnCloseOffline) {
    btnCloseOffline.addEventListener('click', () => {
      document.getElementById('offline-modal').classList.remove('active');
    });
  }
}

// ==========================================
// MAIN PROGRESSION TICK (EVERY 100MS)
// ==========================================
function startMainLoop() {
  setInterval(() => {
    // Advance progress bars of active businesses
    BUSINESS_DEFS.forEach((biz, idx) => {
      const fillEl = document.getElementById(`biz-fill-${idx}`);
      if (!fillEl) return;

      const increment = 0.1 / biz.cycleSec;
      state.cycles[idx] += increment;

      if (state.cycles[idx] >= 1.0) {
        state.cycles[idx] = 0;
        // Cash collected from cycle
        const asset = state.assets.find(a => a.asset_type === biz.id || (idx === 0 && a.asset_type === 'lemonade'));
        const level = asset ? asset.level : (idx < 4 ? 2 : 0);
        if (level > 0) {
          const earned = biz.baseCps * level * getMilestone(level) * getPetBlissMultiplier();
          state.liveBalance += earned;
        }
      }

      fillEl.style.width = `${Math.min(100, Math.round(state.cycles[idx] * 100))}%`;
    });

    // Continuous small flow
    state.currentCPS = computeTotalCPS();
    updateTopHUD();
    updateTasksUI();
  }, 100);
}

// ==========================================
// BOOTSTRAP SEQUENCE
// ==========================================
async function initApp() {
  updateWindowSkyline();
  setupNavigation();
  setupHeaderControls();
  setupPetInteractions();
  startTycoonQuoteLoop();

  // Canvas Pet Animation
  const canvas = document.getElementById('pet-diorama-canvas');
  if (canvas) {
    petRenderer = new PixelPetRenderer(canvas);
    petRenderer.setSpecies(state.activeSpeciesId);

    function animate() {
      petRenderer.render();
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  renderBusinessesList();
  updateVitalsUI();
  updateTopHUD();
  updateTasksUI();
  startMainLoop();

  // Sync with backend
  try {
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId: 123456789, username: 'quino_boss', firstName: 'Guardián' })
    });
    if (res.ok) {
      const data = await res.json();
      state.user = data.user;
      if (data.assets && data.assets.length > 0) {
        state.assets = data.assets;
      }
      if (data.user && data.user.balance > 0) {
        state.liveBalance = data.user.balance;
      }
      state.currentCPS = computeTotalCPS();
      renderBusinessesList();
      updateTopHUD();

      // Set referral link
      const refInput = document.getElementById('ref-link-input');
      if (refInput) {
        refInput.value = `https://t.me/IdleCapitalistBot?start=ref_${data.user.telegram_id}`;
      }
    }
  } catch (e) {
    console.warn('Backend sync fallback');
  }
}

initApp();
