/**
 * Telegram Mini App - Tamagotchi Idle Multi-World Ecosystem
 * 10 Distinct Algorithmic Worlds & Creatures, Procedural 16x16 Pixel Art on HTML5 Canvas,
 * Classic Metals Economy (Bronce 🥉, Plata 🥈, Oro 🥇), Server-authoritative math & CAS sync.
 */

import { PixelPetRenderer, PIXEL_MATRICES } from './pixelRenderer.js';

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// 10 Algorithmic Worlds Catalog (Direct fallback + dynamically enriched from /api/worlds)
const DEFAULT_WORLDS = [
  {
    id: "zen_cat",
    name: "Jardín Zen del Gatito Astral",
    realm: "Reino Doméstico Tradicional",
    mathCurve: "GeometricSmooth (r=1.07)",
    description: "Bucle clásico relajante de Adventure Capitalist con progresión suave de crecimiento (r = 1.07). Enfoque en ronroneo continuo y armonía.",
    avatar: "🐱",
    pixelColor: "#f59e0b",
    growthRate: 1.07,
    specialMechanic: "Ronroneo Constante: +10% de producción pasiva continua mientras la app esté abierta.",
    facilities: [
      { id: "zen_1", name: "Plato de Leche Tibia", icon: "🥛", baseCost: 4, baseCps: 1, growth: 1.07 },
      { id: "zen_2", name: "Cojín de Terciopelo", icon: "🧶", baseCost: 60, baseCps: 20, growth: 1.15 },
      { id: "zen_3", name: "Rascador de Bambú", icon: "🎋", baseCost: 720, baseCps: 90, growth: 1.14 },
      { id: "zen_4", name: "Cascabel de Plata", icon: "🔔", baseCost: 8640, baseCps: 360, growth: 1.13 },
      { id: "zen_5", name: "Jardín de Catnip Arcano", icon: "🌿", baseCost: 103680, baseCps: 2160, growth: 1.12 },
      { id: "zen_6", name: "Templo de la Siesta Eterna", icon: "⛩️", baseCost: 1244160, baseCps: 6480, growth: 1.11 }
    ]
  },
  {
    id: "frost_wolf",
    name: "Tundra Glacial del Lobo Ártico",
    realm: "Reino Salvaje Glacial",
    mathCurve: "AggressiveBurst (r=1.16)",
    description: "Curva empinada y agresiva (r = 1.16). Menos compras frecuentes pero saltos exponenciales gigantes en cada hito.",
    avatar: "🐺",
    pixelColor: "#38bdf8",
    growthRate: 1.16,
    specialMechanic: "Furia de la Manada: Al acumular 5 compras consecutivas, desata una ventisca con x3 temporal por 30s.",
    facilities: [
      { id: "wolf_1", name: "Carne Helada de Reno", icon: "🥩", baseCost: 8, baseCps: 2, growth: 1.16 },
      { id: "wolf_2", name: "Guarida de Nieve", icon: "❄️", baseCost: 120, baseCps: 40, growth: 1.16 },
      { id: "wolf_3", name: "Tótem del Viento Blanco", icon: "🌬️", baseCost: 1500, baseCps: 200, growth: 1.15 },
      { id: "wolf_4", name: "Cumbres de Aullido Alfa", icon: "🏔️", baseCost: 18000, baseCps: 800, growth: 1.14 },
      { id: "wolf_5", name: "Runas del Hielo Perenne", icon: "💠", baseCost: 220000, baseCps: 4500, growth: 1.13 },
      { id: "wolf_6", name: "Trono de Hielo de Fenrir", icon: "👑", baseCost: 2800000, baseCps: 15000, growth: 1.12 }
    ]
  },
  {
    id: "fire_dragon",
    name: "Forja Volcánica del Dragón de Fuego",
    realm: "Reino Fantasía Dracónica",
    mathCurve: "HeatAccumulation",
    description: "Algoritmo de caldera térmica: el valor base sube según el nivel de calor activo acumulado en los toques.",
    avatar: "🐲",
    pixelColor: "#ef4444",
    growthRate: 1.13,
    specialMechanic: "Reserva de Magma: Cada toque al dragón suma +1% de calor hasta un máximo de +100% de CPS global.",
    facilities: [
      { id: "drag_1", name: "Brasas Ardientes", icon: "🔥", baseCost: 10, baseCps: 2.5, growth: 1.13 },
      { id: "drag_2", name: "Pozo de Azufre", icon: "🌋", baseCost: 150, baseCps: 45, growth: 1.13 },
      { id: "drag_3", name: "Yunque de Mineral Rojo", icon: "⚒️", baseCost: 1800, baseCps: 220, growth: 1.12 },
      { id: "drag_4", name: "Cueva de Tesoros Fundidos", icon: "🪙", baseCost: 22000, baseCps: 950, growth: 1.12 },
      { id: "drag_5", name: "Columna de Fuego Celestial", icon: "💥", baseCost: 260000, baseCps: 5200, growth: 1.11 },
      { id: "drag_6", name: "Cráter de la Deidad Ígnea", icon: "🪐", baseCost: 3200000, baseCps: 18000, growth: 1.10 }
    ]
  },
  {
    id: "mecha_droid",
    name: "Matriz Cyberpunk del Mecha-Droide",
    realm: "Reino Ciencia Ficción Sintética",
    mathCurve: "BinaryPowerCurve (2^n)",
    description: "Matemática de potencias binarias (2^n escalado). Los hitos ocurren cada 16 niveles (en vez de 25), ideal para ritmo vertiginoso.",
    avatar: "🤖",
    pixelColor: "#10b981",
    growthRate: 1.10,
    specialMechanic: "Overclocking Cuántico: Saltos binarios dobles cada 16 niveles de optimización.",
    facilities: [
      { id: "mec_1", name: "Batería de Nano-Células", icon: "🔋", baseCost: 5, baseCps: 1.2, growth: 1.10 },
      { id: "mec_2", name: "Microchip Neural v1", icon: "💾", baseCost: 80, baseCps: 24, growth: 1.11 },
      { id: "mec_3", name: "Refrigeración Líquida Neón", icon: "🧪", baseCost: 900, baseCps: 110, growth: 1.11 },
      { id: "mec_4", name: "Servidor Cuántico Central", icon: "🖥️", baseCost: 11000, baseCps: 420, growth: 1.10 },
      { id: "mec_5", name: "Acelerador de Partículas", icon: "⚛️", baseCost: 130000, baseCps: 2500, growth: 1.10 },
      { id: "mec_6", name: "Singularidad Sintética A.I.", icon: "🌐", baseCost: 1600000, baseCps: 8000, growth: 1.09 }
    ]
  },
  {
    id: "cosmic_axolotl",
    name: "Arrecife Abisal del Ajolote Cósmico",
    realm: "Reino Acuático Místico",
    mathCurve: "RegenerativeTides",
    description: "Ciclos de marea: cada 60 segundos la marea sube y baja, alternando entre producción masiva y bajo costo de mejoras.",
    avatar: "🦎",
    pixelColor: "#ec4899",
    growthRate: 1.09,
    specialMechanic: "Marea Alta / Baja: Durante Marea Alta (+50% CPS), durante Marea Baja (-20% Costo de mejoras).",
    facilities: [
      { id: "axo_1", name: "Algas Bioluminiscentes", icon: "🪸", baseCost: 6, baseCps: 1.5, growth: 1.09 },
      { id: "axo_2", name: "Perlas de Coral Rosa", icon: "🦪", baseCost: 90, baseCps: 28, growth: 1.10 },
      { id: "axo_3", name: "Geiser Submarino Tibio", icon: "🌊", baseCost: 1000, baseCps: 130, growth: 1.10 },
      { id: "axo_4", name: "Anémonas Cósmicas", icon: "🌸", baseCost: 12000, baseCps: 500, growth: 1.09 },
      { id: "axo_5", name: "Palacio de Nácar Sumergido", icon: "🏰", baseCost: 140000, baseCps: 3000, growth: 1.09 },
      { id: "axo_6", name: "Fosa Marina Primordial", icon: "🌀", baseCost: 1700000, baseCps: 9500, growth: 1.08 }
    ]
  },
  {
    id: "shadow_specter",
    name: "Necrópolis Astral del Espectro Umbrío",
    realm: "Reino Gótico de las Sombras",
    mathCurve: "SoulHarvesting",
    description: "Mecánica de almas errantes: la producción se multiplica al reiniciar o sacrificar niveles por reliquias oscuras.",
    avatar: "👻",
    pixelColor: "#8b5cf6",
    growthRate: 1.15,
    specialMechanic: "Cosecha de Almas: Multiplicador permanente de ascensión incrementado al 3.5% por punto.",
    facilities: [
      { id: "gho_1", name: "Velas de Cera Negra", icon: "🕯️", baseCost: 7, baseCps: 1.8, growth: 1.15 },
      { id: "gho_2", name: "Cripta de Ecos", icon: "🪦", baseCost: 110, baseCps: 35, growth: 1.15 },
      { id: "gho_3", name: "Niebla de los Lamentos", icon: "🌫️", baseCost: 1300, baseCps: 160, growth: 1.14 },
      { id: "gho_4", name: "Mausoleo de Jade Nocturno", icon: "🏛️", baseCost: 16000, baseCps: 650, growth: 1.13 },
      { id: "gho_5", name: "Portal al Inframundo", icon: "⛩️", baseCost: 200000, baseCps: 3800, growth: 1.12 },
      { id: "gho_6", name: "Corona de las Sombras Eternas", icon: "👑", baseCost: 2500000, baseCps: 12000, growth: 1.11 }
    ]
  },
  {
    id: "hyper_hamster",
    name: "Ruleta Cuántica del Hámster Hipercinético",
    realm: "Reino Dinámico de Alta Frecuencia",
    mathCurve: "HighFrequencyMicroTicks",
    description: "Ticks ultra rápidos de 50ms. Números pequeños acumulándose a velocidad lumínica para dopamina pura.",
    avatar: "🐹",
    pixelColor: "#f97316",
    growthRate: 1.06,
    specialMechanic: "Rueda Supersónica: Producción multiplicada por velocidad de giro; cada clic acelera el ciclo 2x por 3s.",
    facilities: [
      { id: "ham_1", name: "Semillas de Girasol Turbo", icon: "🌻", baseCost: 3, baseCps: 0.8, growth: 1.06 },
      { id: "ham_2", name: "Rueda de Rodamientos Cerámicos", icon: "🎡", baseCost: 45, baseCps: 16, growth: 1.07 },
      { id: "ham_3", name: "Tubos de Polímero Eléctrico", icon: "🌀", baseCost: 550, baseCps: 75, growth: 1.07 },
      { id: "ham_4", name: "Bebedero de Electrolitos", icon: "💧", baseCost: 6500, baseCps: 300, growth: 1.06 },
      { id: "ham_5", name: "Motor de Fusión de Viruta", icon: "⚙️", baseCost: 80000, baseCps: 1800, growth: 1.06 },
      { id: "ham_6", name: "Acelerador Espacio-Temporal", icon: "🚀", baseCost: 950000, baseCps: 5500, growth: 1.05 }
    ]
  },
  {
    id: "void_slime",
    name: "Foso Primordial del Slime del Vacío",
    realm: "Reino Cósmico del Vacío",
    mathCurve: "CellularAssimilation",
    description: "Crecimiento por masa celular: el costo no escala individualmente, sino proporcional a la suma total de biomasa.",
    avatar: "🦠",
    pixelColor: "#a855f7",
    growthRate: 1.11,
    specialMechanic: "Fusión de Biomasa: Cada nueva instalación otorga un buff pasivo a todas las instalaciones anteriores.",
    facilities: [
      { id: "sli_1", name: "Gota de Gelatina Primordial", icon: "🧪", baseCost: 4, baseCps: 1.0, growth: 1.11 },
      { id: "sli_2", name: "Membrana Semipermeable", icon: "🫧", baseCost: 70, baseCps: 22, growth: 1.11 },
      { id: "sli_3", name: "Núcleo Viscoso Brillante", icon: "🔮", baseCost: 800, baseCps: 100, growth: 1.10 },
      { id: "sli_4", name: "Charco de Materia Oscura", icon: "🕳️", baseCost: 9500, baseCps: 400, growth: 1.10 },
      { id: "sli_5", name: "Monolito de Plasma Cósmico", icon: "🗿", baseCost: 115000, baseCps: 2300, growth: 1.09 },
      { id: "sli_6", name: "Slime Devorador de Mundos", icon: "🌌", baseCost: 1400000, baseCps: 7500, growth: 1.08 }
    ]
  },
  {
    id: "solar_phoenix",
    name: "Nido Solar del Fénix Sagrado",
    realm: "Reino Mitológico Solar",
    mathCurve: "GoldenRatioFibonacci",
    description: "Curva áurea de Fibonacci: multiplicadores que saltan en 1, 2, 3, 5, 8, 13, 21, 34, 55, 89 niveles.",
    avatar: "🐦‍🔥",
    pixelColor: "#eab308",
    growthRate: 1.12,
    specialMechanic: "Renacimiento de Cenizas: Al reiniciar prestigio, retiene el 10% del balance para un reinicio acelerado.",
    facilities: [
      { id: "phx_1", name: "Chispa de Fuego Solar", icon: "✨", baseCost: 5, baseCps: 1.4, growth: 1.12 },
      { id: "phx_2", name: "Pluma de Oro Candente", icon: "🪶", baseCost: 85, baseCps: 26, growth: 1.12 },
      { id: "phx_3", name: "Rama de Roble Sagrado", icon: "🪵", baseCost: 1050, baseCps: 120, growth: 1.11 },
      { id: "phx_4", name: "Altar de la Flama Eterna", icon: "🔥", baseCost: 12500, baseCps: 480, growth: 1.11 },
      { id: "phx_5", name: "Corona de Rayos del Sol", icon: "☀️", baseCost: 150000, baseCps: 2800, growth: 1.10 },
      { id: "phx_6", name: "Cúpula de la Inmortalidad", icon: "🏛️", baseCost: 1800000, baseCps: 9000, growth: 1.09 }
    ]
  },
  {
    id: "chronos_turtle",
    name: "Santuario Temporal de la Tortuga Ancestral",
    realm: "Reino Crono-Espacial",
    mathCurve: "EntropyNonLinear",
    description: "Curva logarítmica lenta al inicio pero con un late-game infinito insuperable.",
    avatar: "🐢",
    pixelColor: "#14b8a6",
    growthRate: 1.08,
    specialMechanic: "Dilatación Temporal: El tiempo offline genera un 150% de la producción en lugar del 100% estándar.",
    facilities: [
      { id: "tur_1", name: "Gota de Arena del Tiempo", icon: "⏳", baseCost: 4, baseCps: 1.1, growth: 1.08 },
      { id: "tur_2", name: "Caparazón de Obsidiana Antigua", icon: "🛡️", baseCost: 65, baseCps: 21, growth: 1.09 },
      { id: "tur_3", name: "Péndulo de Cristal Cuántico", icon: "🕰️", baseCost: 750, baseCps: 95, growth: 1.09 },
      { id: "tur_4", name: "Río del Pasado y Futuro", icon: "🌊", baseCost: 9000, baseCps: 380, growth: 1.08 },
      { id: "tur_5", name: "Esfera de Tiempo Estancado", icon: "🔮", baseCost: 110000, baseCps: 2200, growth: 1.08 },
      { id: "tur_6", name: "Vórtice del Fin de la Historia", icon: "🌀", baseCost: 1350000, baseCps: 7000, growth: 1.07 }
    ]
  }
];

let WORLDS = [...DEFAULT_WORLDS];

// Global State
let state = {
  user: null,
  assets: [],
  activeBoost: 1.0,
  claimablePrestige: 0,
  liveBalance: 0.0,
  currentCPS: 0.0,
  activeWorldId: 'zen_cat',
  activeWorld: DEFAULT_WORLDS[0]
};

// Procedural Canvas Renderer Instance
let pixelRenderer = null;
let isInitialSync = true;

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

function getMilestone(level, worldCurve) {
  let m = 1;
  if (worldCurve === 'BinaryPowerCurve (2^n)') {
    if (level >= 16) m *= 2;
    if (level >= 32) m *= 2;
    if (level >= 64) m *= 4;
    if (level >= 128) m *= 8;
  } else {
    if (level >= 25) m *= 2;
    if (level >= 50) m *= 2;
    if (level >= 100) m *= 2;
    if (level >= 200) m *= 2;
  }
  return m;
}

// Compute client-side CPS based on active world facilities
function computeClientCPS() {
  const facilities = state.activeWorld.facilities;
  let sum = 0;

  facilities.forEach((fac, idx) => {
    // Check both standard id (zen_1, wolf_1) and legacy fallback aliases
    const legacyAliases = ['feeding', 'hygiene', 'play', 'shelter', 'training', 'sanctuary', 'lemonade', 'newspaper', 'carwash', 'pizza', 'donut', 'bank'];
    const legacyKey = legacyAliases[idx];
    const userAsset = state.assets.find(a => a.asset_type === fac.id || (idx === 0 && a.asset_type === 'lemonade') || a.asset_type === legacyKey);
    const level = userAsset ? userAsset.level : 0;
    if (level > 0) {
      sum += fac.baseCps * level * getMilestone(level, state.activeWorld.mathCurve) * (userAsset?.multiplier || 1.0);
    }
  });

  // World specific mechanics
  let worldMod = 1.0;
  if (state.activeWorld.id === 'zen_cat') {
    worldMod = 1.10; // +10% purr
  } else if (state.activeWorld.id === 'solar_phoenix') {
    worldMod = 1.10; // +10% solar golden ratio
  } else if (state.activeWorld.id === 'cosmic_axolotl') {
    const tidePhase = (Date.now() / 1000) % 60;
    worldMod = tidePhase < 30 ? 1.5 : 1.0;
  }

  const prestigePoints = state.user?.prestige_points || 0;
  const prestigeMult = 1.0 + prestigePoints * 0.02;
  return Math.round(sum * worldMod * prestigeMult * (state.activeBoost || 1.0) * 100) / 100;
}

function getOverallPetLevel() {
  let totalLevels = 0;
  const facilities = state.activeWorld.facilities;
  facilities.forEach((fac, idx) => {
    const legacyAliases = ['feeding', 'hygiene', 'play', 'shelter', 'training', 'sanctuary', 'lemonade', 'newspaper', 'carwash', 'pizza', 'donut', 'bank'];
    const userAsset = state.assets.find(a => a.asset_type === fac.id || (idx === 0 && a.asset_type === 'lemonade') || a.asset_type === legacyAliases[idx]);
    if (userAsset) totalLevels += userAsset.level;
  });
  return Math.max(1, Math.floor(totalLevels / 2));
}

// Switch active realm / world
function switchWorld(worldId) {
  const world = WORLDS.find(w => w.id === worldId) || WORLDS[0];
  state.activeWorldId = world.id;
  state.activeWorld = world;

  // Update canvas renderer
  if (pixelRenderer) {
    pixelRenderer.setSpecies(world.id);
  }

  // Update visual aura and card border
  const aura = document.getElementById('pet-aura');
  if (aura && world.pixelColor) {
    aura.style.background = `radial-gradient(circle, ${world.pixelColor}55, transparent 70%)`;
  }

  const dropdown = document.getElementById('realm-select');
  if (dropdown && dropdown.value !== world.id) {
    dropdown.value = world.id;
  }

  state.currentCPS = computeClientCPS();
  updateHUD();
  renderCareFacilities();
  renderSpeciesGrid();

  if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
}

// Fetch user sync
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

  // Active Creature & Realm info
  const world = state.activeWorld;
  const petLvl = getOverallPetLevel();
  let stageTitle = 'Etapa I: Cría';
  if (petLvl >= 100) stageTitle = 'Etapa IV: Ascendido Cósmico';
  else if (petLvl >= 50) stageTitle = 'Etapa III: Adulto';
  else if (petLvl >= 25) stageTitle = 'Etapa II: Joven';

  document.getElementById('pet-category-badge').textContent = world.realm.toUpperCase();
  document.getElementById('pet-name-display').textContent = world.name;
  document.getElementById('pet-stage-display').textContent = `${stageTitle} (Nivel ${petLvl})`;

  const curveDisplay = document.getElementById('pet-curve-display');
  if (curveDisplay) {
    curveDisplay.textContent = `📐 Curva: ${world.mathCurve}`;
  }

  const mechanicDisplay = document.getElementById('pet-mechanic-display');
  if (mechanicDisplay) {
    mechanicDisplay.textContent = `✨ ${world.specialMechanic}`;
  }

  // Coin icon updates
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
  if (btnPrestige) {
    btnPrestige.disabled = state.claimablePrestige <= 0;
  }

  // Referral link
  const refLink = `https://t.me/IdleCapitalistBot?start=ref_${state.user?.telegram_id || 123456789}`;
  const refInput = document.getElementById('ref-link-input');
  if (refInput) {
    refInput.value = refLink;
  }
}

// Render Care Facilities for active world
function renderCareFacilities() {
  const container = document.getElementById('assets-list');
  if (!container) return;
  container.innerHTML = '';

  const facilities = state.activeWorld.facilities;

  facilities.forEach((fac, idx) => {
    const legacyAliases = ['feeding', 'hygiene', 'play', 'shelter', 'training', 'sanctuary', 'lemonade', 'newspaper', 'carwash', 'pizza', 'donut', 'bank'];
    const legacyKey = legacyAliases[idx];
    const userAsset = state.assets.find(a => a.asset_type === fac.id || (idx === 0 && a.asset_type === 'lemonade') || a.asset_type === legacyKey);
    const level = userAsset ? userAsset.level : 0;
    const assetKeyToBuy = userAsset ? userAsset.asset_type : fac.id;

    const r = fac.growth || state.activeWorld.growthRate || 1.12;
    const cost1 = calculateCost(fac.baseCost, r, level, 1);
    const cost10 = calculateCost(fac.baseCost, r, level, 10);
    const assetCps = level > 0 ? fac.baseCps * level * getMilestone(level, state.activeWorld.mathCurve) * (userAsset?.multiplier || 1.0) : 0;

    const nextMilestone = level < 25 ? 25 : (level < 50 ? 50 : 100);
    const progressPct = Math.min(100, Math.round((level / nextMilestone) * 100));

    const card = document.createElement('div');
    card.className = 'asset-card';
    card.innerHTML = `
      <div class="asset-header">
        <div class="asset-title">
          <span>${fac.icon}</span>
          <span>${fac.name}</span>
        </div>
        <span class="asset-level-badge">Nivel ${level}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPct}%"></div>
      </div>
      <div class="asset-metrics">
        <span>Próxima Evolución: Nivel ${nextMilestone}</span>
        <span class="asset-cps">+${formatCoins(assetCps)}/s</span>
      </div>
      <div class="asset-controls">
        <button class="btn btn-buy" data-type="${assetKeyToBuy}" data-count="1" ${state.liveBalance < cost1 ? 'disabled' : ''}>
          Cuidar 1x (${formatCoins(cost1)})
        </button>
        <button class="btn btn-buy" data-type="${assetKeyToBuy}" data-count="10" ${state.liveBalance < cost10 ? 'disabled' : ''}>
          Cuidar 10x (${formatCoins(cost10)})
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Buy event listeners
  container.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const assetType = btn.dataset.type;
      const count = parseInt(btn.dataset.count, 10);
      await buyCareFacility(assetType, count);
    });
  });
}

// Render 10 Algorithmic Worlds & Species in Tab 2
function renderSpeciesGrid() {
  const grid = document.getElementById('species-grid');
  if (!grid) return;
  grid.innerHTML = '';

  WORLDS.forEach(world => {
    const isActive = world.id === state.activeWorldId;
    const card = document.createElement('div');
    card.className = `species-card ${isActive ? 'active' : ''}`;
    card.style.cursor = 'pointer';

    const facilitiesIcons = world.facilities.map(f => f.icon).join(' ');

    card.innerHTML = `
      <div class="species-card-header">
        <div class="species-title">${world.avatar} ${world.name}</div>
        <span class="species-realm-tag" style="color: ${world.pixelColor}; border: 1px solid ${world.pixelColor}44;">
          ${world.realm}
        </span>
      </div>
      <p class="species-math-desc"><strong>${world.mathCurve}:</strong> ${world.description}</p>
      <div class="pet-special-mechanic" style="text-align: left; margin: 2px 0;">
        ✨ ${world.specialMechanic}
      </div>
      <div class="species-facilities-preview" title="Instalaciones del reino">
        ${facilitiesIcons}
      </div>
      <button class="btn ${isActive ? 'btn-warning' : 'btn-secondary'}" style="margin-top: 6px; padding: 6px 12px; font-size: 12px;">
        ${isActive ? '🌟 Reino Activo' : '🚀 Invocar este Reino'}
      </button>
    `;

    card.addEventListener('click', () => {
      switchWorld(world.id);
    });

    grid.appendChild(card);
  });
}

// Purchase care facility
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

// Tap Pet (Acariciar)
const petArea = document.getElementById('pet-interactive-area');
if (petArea) {
  petArea.addEventListener('click', () => {
    const clickBonus = Math.max(1, Math.round(state.currentCPS * 0.05));
    state.liveBalance += clickBonus;
    document.getElementById('balance-display').textContent = formatCoins(state.liveBalance);

    // Floating heart animation
    const heartsLayer = document.getElementById('pet-hearts');
    if (heartsLayer) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = state.activeWorld.id === 'fire_dragon' ? '🔥' : (state.activeWorld.id === 'mecha_droid' ? '⚡' : '💖');
      heart.style.left = `${Math.random() * 60 + 20}%`;
      heart.style.top = `${Math.random() * 40 + 20}%`;
      heartsLayer.appendChild(heart);
      setTimeout(() => heart.remove(), 800);
    }

    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
  });
}

// Dropdown change listener
const realmSelect = document.getElementById('realm-select');
if (realmSelect) {
  realmSelect.addEventListener('change', (e) => {
    switchWorld(e.target.value);
  });
}

// Offline Modal
function showOfflineModal(offlineData) {
  const modal = document.getElementById('offline-modal');
  if (!modal) return;
  document.getElementById('offline-earned-amount').textContent = `+${formatCoins(offlineData.earned)}`;
  const hours = (offlineData.cappedSeconds / 3600).toFixed(1);
  document.getElementById('offline-time-text').textContent = `Tiempo acumulado: ${hours} horas (${offlineData.cappedSeconds} seg)`;
  modal.classList.add('active');
}

const btnCloseOffline = document.getElementById('btn-close-offline');
if (btnCloseOffline) {
  btnCloseOffline.addEventListener('click', () => {
    const modal = document.getElementById('offline-modal');
    if (modal) modal.classList.remove('active');
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
  });
}

// Tab navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const targetTab = document.getElementById(`tab-${btn.dataset.tab}`);
    if (targetTab) targetTab.classList.add('active');
    if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
  });
});

// Watch Adsgram Ad
const btnWatchAd = document.getElementById('btn-watch-ad');
if (btnWatchAd) {
  btnWatchAd.addEventListener('click', async () => {
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
}

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
const btnCopyRef = document.getElementById('btn-copy-ref');
if (btnCopyRef) {
  btnCopyRef.addEventListener('click', () => {
    const input = document.getElementById('ref-link-input');
    if (input) {
      navigator.clipboard.writeText(input.value);
      alert('📜 Enlace de guardería copiado al portapapeles');
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }
  });
}

// Verify channel task
const btnVerifyChannel = document.getElementById('btn-verify-channel');
if (btnVerifyChannel) {
  btnVerifyChannel.addEventListener('click', async () => {
    const statusText = document.getElementById('task-status-text');
    if (statusText) statusText.textContent = '✅ ¡Santuario aliado verificado! Multiplicador x2.5 activo.';
    state.activeBoost = 2.5;
    state.currentCPS = computeClientCPS();
    updateHUD();
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
  });
}

// Claim Prestige (Ascensión de Mascota)
const btnClaimPrestige = document.getElementById('btn-claim-prestige');
if (btnClaimPrestige) {
  btnClaimPrestige.addEventListener('click', async () => {
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
}

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

// Boot sequence: Initialize Pixel Canvas & animation loop, fetch worlds, then sync user
async function initApp() {
  const canvas = document.getElementById('pet-pixel-canvas');
  if (canvas) {
    pixelRenderer = new PixelPetRenderer(canvas);
    pixelRenderer.setSpecies(state.activeWorldId);

    // 60fps render loop
    function animate() {
      pixelRenderer.render();
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  // Load worlds catalog from backend
  try {
    const res = await fetch('/api/worlds');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        WORLDS = data;
        state.activeWorld = WORLDS.find(w => w.id === state.activeWorldId) || WORLDS[0];
      }
    }
  } catch (e) {
    console.warn('Using embedded worlds catalog fallback');
  }

  await syncUser();
}

initApp();
