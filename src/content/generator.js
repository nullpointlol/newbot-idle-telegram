import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..', '..');
const CATALOG_PATH = path.join(ROOT_DIR, 'content', 'species', 'species_catalog.json');

const VOCABULARY = {
  domestic: {
    archetypes: [
      { name: 'Cachorro Shiba', icon: '🐕' },
      { name: 'Gatito Sphynx', icon: '🐈' },
      { name: 'Hurón de Seda', icon: '🦡' },
      { name: 'Conejo Lunar', icon: '🐇' },
      { name: 'Hámster Mecánico', icon: '🐹' }
    ],
    prefixes: ['Noble', 'Regal', 'Curioso', 'Dormilón', 'Ágil', 'Cariñoso'],
    suffixes: ['del Hogar', 'de Seda', 'del Jardín', 'de los Techos', 'del Salón Imperial']
  },
  wild: {
    archetypes: [
      { name: 'Lince de la Tundra', icon: '🐆' },
      { name: 'Oso de Obsidiana', icon: '🐻' },
      { name: 'Águila de Viento', icon: '🦅' },
      { name: 'Zorro de Fuego', icon: '🦊' },
      { name: 'Búho de Medianoche', icon: '🦉' }
    ],
    prefixes: ['Salvajemente', 'Alfa', 'Ferocísimo', 'Sigiloso', 'Primordial', 'Acechador'],
    suffixes: ['de la Taiga', 'de las Cumbres', 'de los Bosques', 'de las Dunas', 'del Cañón']
  },
  fantasy: {
    archetypes: [
      { name: 'Cría de Fénix', icon: '🐦‍🔥' },
      { name: 'Basilisco Esmeralda', icon: '🦎' },
      { name: 'Pegaso de Niebla', icon: '🦄' },
      { name: 'Grifo de Rubí', icon: '🦅' },
      { name: 'Golem de Cuarzo', icon: '🗿' }
    ],
    prefixes: ['Arcano', 'Celestial', 'Místico', 'Radiante', 'Etéreo', 'Eterno'],
    suffixes: ['del Olimpo', 'de las Profundidades', 'del Crepúsculo', 'del Vacío', 'de Avalon']
  },
  scifi: {
    archetypes: [
      { name: 'Droide Centinela', icon: '🤖' },
      { name: 'Quimera Cuántica', icon: '🧬' },
      { name: 'Enjambre Nano-Robótico', icon: '🛸' },
      { name: 'Simbionte de Neón', icon: '👾' },
      { name: 'Sonda Biomecánica', icon: '🛰️' }
    ],
    prefixes: ['Cibernético', 'Anti-Materia', 'Hiper-Espacial', 'Singularidad', 'Cripto', 'Sintético'],
    suffixes: ['v3.0', 'del Sector Cero', 'de la Matriz', 'de Alfa Centauri', 'Subatómico']
  }
};

const RARITIES = ['common', 'rare', 'epic', 'legendary', 'celestial'];
const CARE_ACTIVITIES = ['feeding', 'hygiene', 'play', 'shelter', 'training', 'sanctuary'];

/**
 * Procedural Generative Content Loop for Pet Creatures
 * Enforces schema compliance, determinism, and gamedev-init HALT guardrail.
 */
export class CreatureGenerativeLoop {
  static checkHalt() {
    const haltPath = path.join(ROOT_DIR, 'HALT');
    if (fs.existsSync(haltPath)) {
      throw new Error('⛔ EMERGENCY HALT: Generation aborted due to presence of HALT file in workspace.');
    }
  }

  static generateCreature(category = null, rarity = null) {
    this.checkHalt();

    const catKeys = ['domestic', 'wild', 'fantasy', 'scifi'];
    const chosenCategory = category && catKeys.includes(category)
      ? category
      : catKeys[Math.floor(Math.random() * catKeys.length)];

    const chosenRarity = rarity && RARITIES.includes(rarity)
      ? rarity
      : RARITIES[Math.floor(Math.random() * RARITIES.length)];

    const vocab = VOCABULARY[chosenCategory];
    const archetype = vocab.archetypes[Math.floor(Math.random() * vocab.archetypes.length)];
    const prefix = vocab.prefixes[Math.floor(Math.random() * vocab.prefixes.length)];
    const suffix = vocab.suffixes[Math.floor(Math.random() * vocab.suffixes.length)];

    const name = `${prefix} ${archetype.name} ${suffix}`;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    const favoriteActivity = CARE_ACTIVITIES[Math.floor(Math.random() * CARE_ACTIVITIES.length)];
    const rarityMultipliers = {
      common: 1.1,
      rare: 1.25,
      epic: 1.45,
      legendary: 1.75,
      celestial: 2.2
    };

    const stages = [
      { levelRequired: 1, stageName: `Cría ${prefix}`, icon: archetype.icon, growthMultiplier: 1.0 },
      { levelRequired: 25, stageName: `${archetype.name} Joven`, icon: `${archetype.icon}✨`, growthMultiplier: 2.0 },
      { levelRequired: 50, stageName: `${prefix} Adulto`, icon: `🔥${archetype.icon}`, growthMultiplier: 4.5 },
      { levelRequired: 100, stageName: `Titán ${archetype.name}`, icon: `👑${archetype.icon}`, growthMultiplier: 10.0 }
    ];

    return {
      id,
      name,
      category: chosenCategory,
      rarity: chosenRarity,
      avatar: archetype.icon,
      description: `Especie generada proceduralmente del reino ${chosenCategory}. Posee una afinidad ancestral con la actividad de ${favoriteActivity}.`,
      carePreferences: {
        favoriteActivity,
        bonusMultiplier: rarityMultipliers[chosenRarity]
      },
      stages
    };
  }

  static generateBatch(count = 3, category = null) {
    this.checkHalt();
    const batch = [];
    for (let i = 0; i < count; i++) {
      batch.push(this.generateCreature(category));
    }
    return batch;
  }

  static appendToCatalog(creatures) {
    this.checkHalt();
    let current = [];
    if (fs.existsSync(CATALOG_PATH)) {
      try {
        current = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
      } catch (err) {
        current = [];
      }
    }

    for (const c of creatures) {
      if (!current.some(x => x.id === c.id)) {
        current.push(c);
      }
    }

    fs.writeFileSync(CATALOG_PATH, JSON.stringify(current, null, 2), 'utf8');
    return current.length;
  }
}

// Allow CLI execution if called directly
if (process.argv[1] && process.argv[1].endsWith('generator.js')) {
  const count = parseInt(process.argv.slice(2).find(arg => arg.startsWith('--count='))?.split('=')[1] || '2', 10);
  const category = process.argv.slice(2).find(arg => arg.startsWith('--category='))?.split('=')[1] || null;

  console.log(`✨ Ejecutando bucle creativo generativo (Generando ${count} especies)...`);
  const batch = CreatureGenerativeLoop.generateBatch(count, category);
  console.log('Resultados generados:', JSON.stringify(batch, null, 2));
  const total = CreatureGenerativeLoop.appendToCatalog(batch);
  console.log(`✅ Catálogo actualizado con éxito. Total de especies disponibles: ${total}`);
}
