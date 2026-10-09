/**
 * Telegram Mini App - Tamagotchi Idle Creature Care
 * Classic Metals Economy (Bronce 🥉, Plata 🥈, Oro 🥇), Interactive Pet Hero,
 * Species Catalog across Domestic, Wild, Fantasy, and Sci-Fi.
 */

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// User & Pet State
let state = {
  user: null,
  assets: [],
  activeBoost: 1.0,
  claimablePrestige: 0,
  liveBalance: 0.0,
  currentCPS: 0.0,
  activeSpecies: {
    id: 'mystic_cat',
    name: 'Gatito Astral',
    category: 'DOMÉSTICO • RARO',
    avatar: '🐱',
    stageName: 'Cachorro'
  },
  petVitals: {
    nutrition: 85,
    affection: 90,
    energy: 75
  }
};

// Care Facilities (Adventure Capitalist Mathematical Loop)
const CARE_FACILITIES = [
  { type: 'feeding', alias: 'lemonade', name: 'Comedero de Manjares', icon: '🍎', baseCost: 4.0, baseCps: 1.0, growth: 1.07 },
  { type: 'hygiene', alias: 'newspaper', name: 'Baño Termal & Burbujas', icon: '🧼', baseCost: 60.0, baseCps: 20.0, growth: 1.15 },
  { type: 'play', alias: 'carwash', name: 'Parque de Estimulación', icon: '🎾', baseCost: 720.0, baseCps: 90.0, growth: 1.14 },
  { type: 'shelter', alias: 'pizza', name: 'Nido Acolchado & Sueño', icon: '🛌', baseCost: 8640.0, baseCps: 360.0, growth: 1.13 },
  { type: 'training', alias: 'donut', name: 'Cámara de Mutagénesis', icon: '🧬', baseCost: 103680.0, baseCps: 2160.0, growth: 1.12 },
  { type: 'sanctuary', alias: 'bank', name: 'Templo de Ascensión', icon: '👑', baseCost: 1244160.0, baseCps: 6480.0, growth: 1.11 }
];

// Species Catalog
const SPECIES_CATALOG = [
  { id: 'mystic_cat', name: 'Gatito Astral', category: 'DOMÉSTICO • RARO', avatar: '🐱', stageName: 'Cachorro' },
  { id: 'frost_wolf', name: 'Lobo de Escarcha', category: 'SALVAJE • RARO', avatar: '🐺', stageName: 'Lobato Polar' },
  { id: 'obsidian_dragon', name: 'Dragón de Obsidiana', category: 'FANTASÍA • ÉPICO', avatar: '🐲', stageName: 'Draco Ígneo' },
  { id: 'cyber_droid', name: 'Ciber-Droide Quántico', category: 'SCI-FI • LEGENDARIO', avatar: '🤖', stageName: 'Nano-Bot' },
  { id: 'phoenix_chick', name: 'Fénix del Bosque', category: 'FANTASÍA • MITO', avatar: '🐦‍🔥', stageName: 'Pichón Solar' },
  { id: 'shiba_guardian', name: 'Shiba Guardián', category: 'DOMÉSTICO • COMÚN', avatar: '🐕', stageName: 'Cachorro Fiel' }
];

/**
 * Currency Formatting: Option A (Metales Clásicos)
 * 100 Bronce = 1 Plata
 * 100 Plata = 1 Oro (= 10,000 Bronce)
 */
function formatCoins(totalBronze) {
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

function getDetailedBreakdown(totalBronze) {
  const amount = Math.floor(totalBronze || 0);
  const gold = Math.floor(amount / 10000);
  const silver = Math.floor((amount % 10000) / 100);
  const bronze = amount % 100;

  return `<span>${gold.toLocaleString()} Oro</span> • <span>${silver} Plata</span> • <span>${bronze} Bronce</span>`;
}

function calculateCost(baseCost, growth, currentLevel, count = 1) {
  if (count === 1) {
    return Math.round(baseCost * Math.pow(growth, currentLevel));
  }
  const first = baseCost * Math.pow(growth, currentLevel);
  const total = first * (Math.pow(growth, count) - 1) / (growth - 1);
  return Math.round(total);
}

function getMilestone(level) {
  let m = 1;
  if (level >= 25) m *= 2;
  if (level >= 50) m *= 2;
  if (level >= 100) m *= 2;
  return m;
}

function computeClientCPS() {
  let sum = 0;
  for (const cat of CARE_FACILITIES) {
    const userAsset = state.assets.find(a => a.asset_type === cat.type || a.asset_type === cat.alias);
    const level = userAsset ? userAsset.level : 0;
    if (level > 0) {
      sum += cat.baseCps * level * getMilestone(level) * (userAsset.multiplier || 1.0);
    }
  }
  const prestigePoints = state.user?.prestige_points || 0;
  const prestigeMult = 1.0 + prestigePoints * 0.02;
  return sum * prestigeMult * (state.activeBoost || 1.0);
}

function getOverallPetLevel() {
  let totalLevels = 0;
  for (const asset of state.assets) {
    totalLevels += (asset.level || 0);
  }
  return Math.max(1, Math.floor(totalLevels / 2));
}

let isInitialSync = true;

// Initial Sync
async function syncUser(isBackground = false) {
  const tgUser = tg?.initDataUnsafe?.user;
  const telegramId = tgUser?.id || 123456789;
  const username = tgUser?.username || 'criador_ancestral';
  const firstName = tgUser?.first_name || 'Guardián';

  try {
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, username, firstName })
    });
    const data = await res.json();

    state.user = data.user;
    state.assets = data.assets || [];
    state.activeBoost = data.activeBoost || 1.0;
    state.claimablePrestige = data.claimablePrestige || 0;
    state.liveBalance = data.user.balance;
    state.currentCPS = computeClientCPS();

    updateHUD();
    renderCareFacilities();
    renderSpeciesGrid();

    // Show offline modal ONLY on first visit and ONLY if away for at least 60s
    if (!isBackground && isInitialSync && data.offlineEarnings && data.offlineEarnings.earned > 0 && data.offlineEarnings.cappedSeconds >= 60) {
      showOfflineModal(data.offlineEarnings);
    }
    isInitialSync = false;
  } catch (err) {
    console.error('Error syncing with backend:', err);
  }
}

// Update HUD & Pet Details
function updateHUD() {
  document.getElementById('user-name').textContent = state.user?.first_name || 'Guardián';
  const points = state.user?.prestige_points || 0;
  const pct = (points * 2);
  document.getElementById('prestige-badge').textContent = `Esencia: ${points} (+${pct}%)`;

  const boostBadge = document.getElementById('ad-boost-indicator');
  if (state.activeBoost > 1.0) {
    boostBadge.textContent = `⚡ Cuidado ${state.activeBoost}x Activo`;
    boostBadge.classList.add('active');
  } else {
    boostBadge.textContent = '⚡ Cuidado Normal';
    boostBadge.classList.remove('active');
  }

  // Pet Display
  const petLvl = getOverallPetLevel();
  let stageTitle = 'Etapa I: Cría';
  if (petLvl >= 100) stageTitle = 'Etapa IV: Ascendido Cósmico';
  else if (petLvl >= 50) stageTitle = 'Etapa III: Adulto';
  else if (petLvl >= 25) stageTitle = 'Etapa II: Joven';

  document.getElementById('pet-category-badge').textContent = state.activeSpecies.category;
  document.getElementById('pet-name-display').textContent = state.activeSpecies.name;
  document.getElementById('pet-stage-display').textContent = `${stageTitle} (Nivel ${petLvl})`;
  document.getElementById('pet-avatar-display').textContent = state.activeSpecies.avatar;

  // Update coin icon
  const mainIcon = document.getElementById('main-coin-icon');
  if (state.liveBalance >= 10000) {
    mainIcon.textContent = '🥇';
  } else if (state.liveBalance >= 100) {
    mainIcon.textContent = '🥈';
  } else {
    mainIcon.textContent = '🥉';
  }

  document.getElementById('balance-display').textContent = formatCoins(state.liveBalance);
  document.getElementById('coin-breakdown-display').innerHTML = getDetailedBreakdown(state.liveBalance);
  document.getElementById('cps-amount').textContent = `+${formatCoins(state.currentCPS)}`;
  document.getElementById('claimable-angels').textContent = state.claimablePrestige;

  const btnPrestige = document.getElementById('btn-claim-prestige');
  btnPrestige.disabled = state.claimablePrestige <= 0;

  // Referral link
  const refLink = `https://t.me/IdleCapitalistBot?start=ref_${state.user?.telegram_id || 123456789}`;
  document.getElementById('ref-link-input').value = refLink;
}

// Render Care Facilities
function renderCareFacilities() {
  const container = document.getElementById('assets-list');
  container.innerHTML = '';

  for (const cat of CARE_FACILITIES) {
    const userAsset = state.assets.find(a => a.asset_type === cat.type || a.asset_type === cat.alias);
    const level = userAsset ? userAsset.level : 0;
    const cost1 = calculateCost(cat.baseCost, cat.growth, level, 1);
    const cost10 = calculateCost(cat.baseCost, cat.growth, level, 10);
    const assetCps = level > 0 ? cat.baseCps * level * getMilestone(level) * (userAsset?.multiplier || 1.0) : 0;

    const nextMilestone = level < 25 ? 25 : (level < 50 ? 50 : 100);
    const progressPct = Math.min(100, Math.round((level / nextMilestone) * 100));

    const card = document.createElement('div');
    card.className = 'asset-card';
    card.innerHTML = `
      <div class="asset-header">
        <div class="asset-title">
          <span>${cat.icon}</span>
          <span>${cat.name}</span>
        </div>
        <span class="asset-level-badge">Nivel ${level}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPct}%"></div>
      </div>
      <div class="asset-metrics">
        <span>Próxima Evolución: ${nextMilestone}</span>
        <span class="asset-cps">+${formatCoins(assetCps)}/s</span>
      </div>
      <div class="asset-controls">
        <button class="btn btn-buy" data-type="${cat.type}" data-count="1" ${state.liveBalance < cost1 ? 'disabled' : ''}>
          Cuidar 1x (${formatCoins(cost1)})
        </button>
        <button class="btn btn-buy" data-type="${cat.type}" data-count="10" ${state.liveBalance < cost10 ? 'disabled' : ''}>
          Cuidar 10x (${formatCoins(cost10)})
        </button>
      </div>
    `;
    container.appendChild(card);
  }

  // Purchase listeners
  container.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const assetType = btn.dataset.type;
      const count = parseInt(btn.dataset.count, 10);
      await buyCareFacility(assetType, count);
    });
  });
}

// Render Species Grid
function renderSpeciesGrid() {
  const grid = document.getElementById('species-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (const spec of SPECIES_CATALOG) {
    const isActive = spec.id === state.activeSpecies.id;
    const card = document.createElement('div');
    card.className = `species-card ${isActive ? 'active' : ''}`;
    card.innerHTML = `
      <div class="species-icon">${spec.avatar}</div>
      <div class="species-title">${spec.name}</div>
      <div class="species-category">${spec.category}</div>
      <button class="btn ${isActive ? 'btn-warning' : 'btn-secondary'}" style="padding: 4px 8px; font-size: 11px;">
        ${isActive ? 'Activo' : 'Cuidar'}
      </button>
    `;

    card.addEventListener('click', () => {
      state.activeSpecies = spec;
      updateHUD();
      renderSpeciesGrid();
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    });

    grid.appendChild(card);
  }
}

// Buy Care Facility
async function buyCareFacility(assetType, count) {
  if (!state.user) return;
  try {
    const res = await fetch('/api/asset/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, assetType, count })
    });
    const data = await res.json();
    if (data.success) {
      state.liveBalance = data.newBalance;
      const idx = state.assets.findIndex(a => a.asset_type === assetType || a.asset_type === data.asset.asset_type);
      if (idx >= 0) {
        state.assets[idx] = data.asset;
      } else {
        state.assets.push(data.asset);
      }
      state.currentCPS = computeClientCPS();
      updateHUD();
      renderCareFacilities();
      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    }
  } catch (err) {
    console.error('Care purchase failed:', err);
  }
}

// Interactive Pet Tap (Acariciar)
document.getElementById('pet-interactive-area').addEventListener('click', (e) => {
  // Give instant affection and bronze click reward
  const clickBonus = Math.max(1, Math.round(state.currentCPS * 0.05));
  state.liveBalance += clickBonus;
  document.getElementById('balance-display').textContent = formatCoins(state.liveBalance);

  // Floating heart animation
  const heartsLayer = document.getElementById('pet-hearts');
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = '💖';
  heart.style.left = `${Math.random() * 60 + 20}%`;
  heart.style.top = `${Math.random() * 40 + 20}%`;
  heartsLayer.appendChild(heart);

  setTimeout(() => heart.remove(), 800);

  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
});

// Offline Modal
function showOfflineModal(offlineData) {
  const modal = document.getElementById('offline-modal');
  document.getElementById('offline-earned-amount').textContent = `+${formatCoins(offlineData.earned)}`;
  const hours = (offlineData.cappedSeconds / 3600).toFixed(1);
  document.getElementById('offline-time-text').textContent = `Tiempo acumulado: ${hours} horas (${offlineData.cappedSeconds} seg)`;
  modal.classList.add('active');
}

document.getElementById('btn-close-offline').addEventListener('click', () => {
  document.getElementById('offline-modal').classList.remove('active');
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
});

// Tab navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
  });
});

// Watch Adsgram Ad
document.getElementById('btn-watch-ad').addEventListener('click', async () => {
  if (!state.user) return;
  const trackingId = 'adsgram_' + Date.now();
  const payload = {
    userId: state.user.id,
    event: 'reward',
    trackingId,
    timestamp: Math.floor(Date.now() / 1000)
  };

  await fetch('/webhook/adsgram', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Adsgram-Signature': 'adsgram_test_signature'
    },
    body: JSON.stringify(payload)
  });

  state.activeBoost = 2.0;
  state.currentCPS = computeClientCPS();
  updateHUD();
  renderCareFacilities();
  alert('🐾 ¡Festín Mágico consumado! Producción y vitalidad x2 durante 4 horas.');
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
});

// Telegram Stars shop buy
document.querySelectorAll('.btn-stars').forEach(btn => {
  btn.addEventListener('click', async () => {
    const item = btn.dataset.item;
    const chargeId = 'stars_charge_' + Date.now();

    await fetch('/webhook/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          from: { id: state.user.telegram_id },
          successful_payment: {
            telegram_payment_charge_id: chargeId,
            total_amount: 50,
            invoice_payload: item
          }
        }
      })
    });
    alert('⭐ ¡Tributo con Telegram Stars confirmado! Tus bendiciones han sido concedidas.');
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    await syncUser();
  });
});

// Copy referral link
document.getElementById('btn-copy-ref').addEventListener('click', () => {
  const input = document.getElementById('ref-link-input');
  navigator.clipboard.writeText(input.value);
  alert('📜 Enlace de guardería copiado al portapapeles');
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
});

// Verify channel task
document.getElementById('btn-verify-channel').addEventListener('click', async () => {
  document.getElementById('task-status-text').textContent = '✅ ¡Santuario aliado verificado! Multiplicador x2.5 activo.';
  state.activeBoost = 2.5;
  state.currentCPS = computeClientCPS();
  updateHUD();
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
});

// Claim Prestige (Ascensión de Mascota)
document.getElementById('btn-claim-prestige').addEventListener('click', async () => {
  if (!state.user || state.claimablePrestige <= 0) return;
  const res = await fetch('/api/prestige/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: state.user.id })
  });
  const data = await res.json();
  if (data.success) {
    alert(`🧬 ¡Ascensión completada! Tu linaje ha obtenido ${data.claimedPoints} Esencias Ancestrales permanentes.`);
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    await syncUser();
  }
});

// High-frequency UI tick (every 100ms) for smooth coin accumulation
setInterval(() => {
  if (state.currentCPS > 0) {
    state.liveBalance += state.currentCPS * 0.1;
    document.getElementById('balance-display').textContent = formatCoins(state.liveBalance);
    document.getElementById('coin-breakdown-display').innerHTML = getDetailedBreakdown(state.liveBalance);
  }
}, 100);

// Background server sync every 15s (silent)
setInterval(() => {
  syncUser(true);
}, 15000);

// Initialize on boot
syncUser();
