/**
 * Telegram Mini App - Imperio Antiguo (Metales Clásicos: Bronce, Plata, Oro)
 * Adventure Capitalist Mathematical Loop, Zero Dollar Signs, Clean ancient economy
 */

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// User state
let state = {
  user: null,
  assets: [],
  activeBoost: 1.0,
  claimablePrestige: 0,
  liveBalance: 0.0,
  currentCPS: 0.0
};

// Ancient Workshop Definitions
const ASSET_CATALOG = [
  { type: 'grain', alias: 'lemonade', name: 'Cultivo de Grano', icon: '🌾', baseCost: 4.0, baseCps: 1.0, growth: 1.07 },
  { type: 'pottery', alias: 'newspaper', name: 'Taller de Ánforas', icon: '🏺', baseCost: 60.0, baseCps: 20.0, growth: 1.15 },
  { type: 'smithy', alias: 'carwash', name: 'Herrería Imperial', icon: '⚒️', baseCost: 720.0, baseCps: 90.0, growth: 1.14 },
  { type: 'vineyard', alias: 'pizza', name: 'Prensa de Viñedos', icon: '🍇', baseCost: 8640.0, baseCps: 360.0, growth: 1.13 },
  { type: 'fleet', alias: 'donut', name: 'Flota Mercante', icon: '⛵', baseCost: 103680.0, baseCps: 2160.0, growth: 1.12 },
  { type: 'mint', alias: 'bank', name: 'Casa de la Moneda', icon: '🏛️', baseCost: 1244160.0, baseCps: 6480.0, growth: 1.11 }
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
  for (const cat of ASSET_CATALOG) {
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

let isInitialSync = true;

// Initial Sync
async function syncUser(isBackground = false) {
  const tgUser = tg?.initDataUnsafe?.user;
  const telegramId = tgUser?.id || 123456789;
  const username = tgUser?.username || 'patricio_romano';
  const firstName = tgUser?.first_name || 'Gobernador';

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
    renderAssets();

    // Show offline modal ONLY on first visit and ONLY if away for at least 60s
    if (!isBackground && isInitialSync && data.offlineEarnings && data.offlineEarnings.earned > 0 && data.offlineEarnings.cappedSeconds >= 60) {
      showOfflineModal(data.offlineEarnings);
    }
    isInitialSync = false;
  } catch (err) {
    console.error('Error syncing with backend:', err);
  }
}

// Update HUD
function updateHUD() {
  document.getElementById('user-name').textContent = state.user?.first_name || 'Gobernador';
  const points = state.user?.prestige_points || 0;
  const pct = (points * 2);
  document.getElementById('prestige-badge').textContent = `Favor Divino: ${points} (+${pct}%)`;

  const boostBadge = document.getElementById('ad-boost-indicator');
  if (state.activeBoost > 1.0) {
    boostBadge.textContent = `⚡ Bendición ${state.activeBoost}x Activa`;
    boostBadge.classList.add('active');
  } else {
    boostBadge.textContent = '⚡ Sin Bendición Activa';
    boostBadge.classList.remove('active');
  }

  // Update coin icon according to wealth tier
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

// Render Asset Cards
function renderAssets() {
  const container = document.getElementById('assets-list');
  container.innerHTML = '';

  for (const cat of ASSET_CATALOG) {
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
        <span>Próxima Gracia: ${nextMilestone}</span>
        <span class="asset-cps">+${formatCoins(assetCps)}/s</span>
      </div>
      <div class="asset-controls">
        <button class="btn btn-buy" data-type="${cat.type}" data-count="1" ${state.liveBalance < cost1 ? 'disabled' : ''}>
          Forjar 1x (${formatCoins(cost1)})
        </button>
        <button class="btn btn-buy" data-type="${cat.type}" data-count="10" ${state.liveBalance < cost10 ? 'disabled' : ''}>
          Forjar 10x (${formatCoins(cost10)})
        </button>
      </div>
    `;
    container.appendChild(card);
  }

  // Attach purchase listeners
  container.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const assetType = btn.dataset.type;
      const count = parseInt(btn.dataset.count, 10);
      await buyAsset(assetType, count);
    });
  });
}

// Buy asset API call
async function buyAsset(assetType, count) {
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
      renderAssets();
      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    }
  } catch (err) {
    console.error('Purchase failed:', err);
  }
}

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
  renderAssets();
  alert('🏛️ ¡Ofrenda completada! Los dioses otorgan Producción x2 durante 4 horas.');
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
  alert('📜 Edicto de reclutamiento copiado al portapapeles');
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
});

// Verify channel task
document.getElementById('btn-verify-channel').addEventListener('click', async () => {
  document.getElementById('task-status-text').textContent = '✅ ¡Alianza confirmada con el senado! Multiplicador x2.5 activo.';
  state.activeBoost = 2.5;
  state.currentCPS = computeClientCPS();
  updateHUD();
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
});

// Claim Prestige
document.getElementById('btn-claim-prestige').addEventListener('click', async () => {
  if (!state.user || state.claimablePrestige <= 0) return;
  const res = await fetch('/api/prestige/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: state.user.id })
  });
  const data = await res.json();
  if (data.success) {
    alert(`⚡ ¡Ascenso divino consumado! Has obtenido ${data.claimedPoints} Gratias Celestiales.`);
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
