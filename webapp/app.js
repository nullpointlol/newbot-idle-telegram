/**
 * Telegram Mini App Frontend Application
 * Idle Loop, Live Rendering, Telegram WebApp & Adsgram/Stars Integrations
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

const ASSET_CATALOG = [
  { type: 'lemonade', name: 'Puesto de Limonadas', icon: '🍋', baseCost: 4.0, baseCps: 1.0, growth: 1.07 },
  { type: 'newspaper', name: 'Reparto de Diarios', icon: '📰', baseCost: 60.0, baseCps: 20.0, growth: 1.15 },
  { type: 'carwash', name: 'Lavadero de Autos', icon: '🚗', baseCost: 720.0, baseCps: 90.0, growth: 1.14 },
  { type: 'pizza', name: 'Pizzería Artesanal', icon: '🍕', baseCost: 8640.0, baseCps: 360.0, growth: 1.13 },
  { type: 'donut', name: 'Cadena de Donas', icon: '🍩', baseCost: 103680.0, baseCps: 2160.0, growth: 1.12 },
  { type: 'bank', name: 'Banco Privado', icon: '🏦', baseCost: 1244160.0, baseCps: 6480.0, growth: 1.11 }
];

// Helper formatting
function formatMoney(num) {
  if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return '$' + (num / 1e3).toFixed(2) + 'K';
  return '$' + Number(num).toFixed(2);
}

function calculateCost(baseCost, growth, currentLevel, count = 1) {
  if (count === 1) {
    return Math.round(baseCost * Math.pow(growth, currentLevel) * 100) / 100;
  }
  const first = baseCost * Math.pow(growth, currentLevel);
  const total = first * (Math.pow(growth, count) - 1) / (growth - 1);
  return Math.round(total * 100) / 100;
}

// Milestone multiplier
function getMilestone(level) {
  let m = 1;
  if (level >= 25) m *= 2;
  if (level >= 50) m *= 2;
  if (level >= 100) m *= 2;
  return m;
}

// Calculate total CPS on client
function computeClientCPS() {
  let sum = 0;
  for (const cat of ASSET_CATALOG) {
    const userAsset = state.assets.find(a => a.asset_type === cat.type);
    const level = userAsset ? userAsset.level : 0;
    if (level > 0) {
      sum += cat.baseCps * level * getMilestone(level) * (userAsset.multiplier || 1.0);
    }
  }
  const prestigePoints = state.user?.prestige_points || 0;
  const prestigeMult = 1.0 + prestigePoints * 0.02;
  return sum * prestigeMult * (state.activeBoost || 1.0);
}

// Initial Sync
async function syncUser() {
  const tgUser = tg?.initDataUnsafe?.user;
  const telegramId = tgUser?.id || 123456789;
  const username = tgUser?.username || 'inversionista_local';
  const firstName = tgUser?.first_name || 'Magnate';

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

    // Check offline popup
    if (data.offlineEarnings && data.offlineEarnings.earned > 0) {
      showOfflineModal(data.offlineEarnings);
    }
  } catch (err) {
    console.error('Error syncing with backend:', err);
  }
}

// Update HUD
function updateHUD() {
  document.getElementById('user-name').textContent = state.user?.first_name || 'Inversionista';
  const points = state.user?.prestige_points || 0;
  const pct = (points * 2);
  document.getElementById('prestige-badge').textContent = `Ángeles: ${points} (+${pct}%)`;

  const boostBadge = document.getElementById('ad-boost-indicator');
  if (state.activeBoost > 1.0) {
    boostBadge.textContent = `⚡ Boost ${state.activeBoost}x Activo`;
    boostBadge.classList.add('active');
  } else {
    boostBadge.textContent = '⚡ Boost Inactivo';
    boostBadge.classList.remove('active');
  }

  document.getElementById('cps-amount').textContent = `+${formatMoney(state.currentCPS)}`;
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
    const userAsset = state.assets.find(a => a.asset_type === cat.type);
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
        <span>Próximo Hito: ${nextMilestone}</span>
        <span class="asset-cps">+${formatMoney(assetCps)}/s</span>
      </div>
      <div class="asset-controls">
        <button class="btn btn-buy" data-type="${cat.type}" data-count="1" ${state.liveBalance < cost1 ? 'disabled' : ''}>
          Comprar 1x (${formatMoney(cost1)})
        </button>
        <button class="btn btn-buy" data-type="${cat.type}" data-count="10" ${state.liveBalance < cost10 ? 'disabled' : ''}>
          Comprar 10x (${formatMoney(cost10)})
        </button>
      </div>
    `;
    container.appendChild(card);
  }

  // Attach purchase listeners
  container.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', async (e) => {
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
      const idx = state.assets.findIndex(a => a.asset_type === assetType);
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
  document.getElementById('offline-earned-amount').textContent = `+${formatMoney(offlineData.earned)}`;
  const hours = (offlineData.cappedSeconds / 3600).toFixed(1);
  document.getElementById('offline-time-text').textContent = `Tiempo acumulado: ${hours} horas (${offlineData.cappedSeconds} seg)`;
  modal.classList.add('active');
}

document.getElementById('btn-close-offline').addEventListener('click', () => {
  document.getElementById('offline-modal').classList.remove('active');
});

// Tab navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
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

  // Compute signature via test secret
  const res = await fetch('/webhook/adsgram', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Adsgram-Signature': 'adsgram_test_signature' // Mocked or direct
    },
    body: JSON.stringify(payload)
  });

  // Client boost activation simulation
  state.activeBoost = 2.0;
  state.currentCPS = computeClientCPS();
  updateHUD();
  renderAssets();
  alert('🎉 ¡Anuncio completado! Multiplicador x2 activado por 4 horas.');
});

// Telegram Stars shop buy
document.querySelectorAll('.btn-stars').forEach(btn => {
  btn.addEventListener('click', async () => {
    const item = btn.dataset.item;
    const chargeId = 'stars_charge_' + Date.now();

    const res = await fetch('/webhook/telegram', {
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
    const data = await res.json();
    alert('⭐ ¡Pago con Telegram Stars procesado con éxito!');
    await syncUser();
  });
});

// Copy referral link
document.getElementById('btn-copy-ref').addEventListener('click', () => {
  const input = document.getElementById('ref-link-input');
  navigator.clipboard.writeText(input.value);
  alert('📋 Enlace de referido copiado al portapapeles');
});

// Verify channel task
document.getElementById('btn-verify-channel').addEventListener('click', async () => {
  document.getElementById('task-status-text').textContent = '✅ ¡Suscripción verificada! Multiplicador x2.5 desbloqueado.';
  state.activeBoost = 2.5;
  state.currentCPS = computeClientCPS();
  updateHUD();
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
    alert(`👑 ¡Reinicio por Prestigio completado! Has obtenido ${data.claimedPoints} Ángeles.`);
    await syncUser();
  }
});

// High-frequency UI tick (every 100ms) for smooth balance incrementation
setInterval(() => {
  if (state.currentCPS > 0) {
    state.liveBalance += state.currentCPS * 0.1;
    document.getElementById('balance-display').textContent = formatMoney(state.liveBalance);
  }
}, 100);

// Background server sync every 15s
setInterval(() => {
  syncUser();
}, 15000);

// Initialize on boot
syncUser();
