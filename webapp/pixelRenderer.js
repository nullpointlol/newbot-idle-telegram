/**
 * Procedural Retro Pixel Art Animator Engine
 * Renders 16x16 crisp pixel art matrices for all 10 Tamagotchi creatures on HTML5 Canvas.
 * Zero external asset dependencies, zero network requests, 60fps retro animation loops.
 */

// 16x16 Pixel Matrices (0: Transp, 1: Outline, 2: Body, 3: Light, 4: Eyes/Feature, 5: Accent)
export const PIXEL_MATRICES = {
  // 1. Gatito Zen
  zen_cat: {
    palette: {
      1: '#1e1b18', // Outline
      2: '#f59e0b', // Gold fur
      3: '#fde68a', // Cream belly/face
      4: '#10b981', // Emerald eyes
      5: '#f43f5e'  // Pink ears & nose
    },
    grid: [
      "0000000000000000",
      "0011000000001100",
      "0152100000012510",
      "0152211111122510",
      "0012222222222100",
      "0012422222242100",
      "0012422552242100",
      "0013222552223100",
      "0001332222331000",
      "0001222222221000",
      "0012223333222100",
      "0012233333322100",
      "0012223333222100",
      "0001211001121000",
      "0001100000011001",
      "0000000000000011"
    ]
  },

  // 2. Lobo Ártico
  frost_wolf: {
    palette: {
      1: '#0f172a',
      2: '#38bdf8', // Ice blue
      3: '#e0f2fe', // White fur
      4: '#3b82f6', // Sapphire eyes
      5: '#0284c7'  // Deep frost
    },
    grid: [
      "0000000000000000",
      "0110000000000110",
      "1521000000001251",
      "1522100000012251",
      "0122211111122210",
      "0124222222224210",
      "0124322112234210",
      "0013332112333100",
      "0001332222331000",
      "0012222222222100",
      "0122223333222210",
      "0122233333322210",
      "0012233333322100",
      "0012110000112100",
      "0011000000001100",
      "0000000000000000"
    ]
  },

  // 3. Dragón de Fuego
  fire_dragon: {
    palette: {
      1: '#450a0a',
      2: '#ef4444', // Crimson red
      3: '#fbbf24', // Gold belly / fire
      4: '#f97316', // Orange eyes
      5: '#7f1d1d'  // Horns
    },
    grid: [
      "0000000000000000",
      "0015000000005100",
      "0152100000012510",
      "0122211111122210",
      "1224222222224221",
      "1224222332224221",
      "0122223333222210",
      "0012222112222100",
      "0001222222221000",
      "0112223333222110",
      "1222233333322221",
      "1222223333222221",
      "0112222222221100",
      "0001211001121000",
      "0001100000011000",
      "0000000000000000"
    ]
  },

  // 4. Mecha-Droide Cyberpunk
  mecha_droid: {
    palette: {
      1: '#022c22',
      2: '#10b981', // Cyber green
      3: '#6ee7b7', // Bright circuits
      4: '#06b6d4', // Cyan visor
      5: '#f43f5e'  // Sensor led
    },
    grid: [
      "0000000110000000",
      "0000001551000000",
      "0011111111111100",
      "0122222222222210",
      "0124444444444210",
      "0124444444444210",
      "0122222222222210",
      "0011122222211100",
      "0000122222210000",
      "0111223333221110",
      "1222223333222221",
      "1222222222222221",
      "0111222222221110",
      "0001111001111000",
      "0001221001221000",
      "0001111001111000"
    ]
  },

  // 5. Ajolote Cósmico
  cosmic_axolotl: {
    palette: {
      1: '#500724',
      2: '#ec4899', // Pink skin
      3: '#fbcfe8', // Light pink
      4: '#38bdf8', // Blue stars
      5: '#be185d'  // Gills
    },
    grid: [
      "0150000000000510",
      "1551000000001551",
      "1522111111112251",
      "0122222222222210",
      "0124222222224210",
      "1524222332224251",
      "1522222222222251",
      "0113333333333110",
      "0001222222221000",
      "0012223333222100",
      "0122233333322210",
      "0122223333222210",
      "0012222222222100",
      "0001211001121000",
      "0001100000011000",
      "0000000000000000"
    ]
  },

  // 6. Espectro Umbrío
  shadow_specter: {
    palette: {
      1: '#1e1b4b',
      2: '#8b5cf6', // Violet ghost
      3: '#c4b5fd', // Soft haze
      4: '#facc15', // Gold glow eyes
      5: '#4c1d95'  // Deep dark
    },
    grid: [
      "0000011110000000",
      "0001122221100000",
      "0012222222210000",
      "0122422224221000",
      "0122422224221000",
      "0122222222221000",
      "0012223322210000",
      "0012223322210000",
      "0122222222221000",
      "0122222222221000",
      "0122222222222100",
      "0012222222222100",
      "0001222222221000",
      "0112121121211000",
      "1221012210122100",
      "0110001100011000"
    ]
  },

  // 7. Colibrí Fada
  fairy_hummingbird: {
    palette: {
      1: '#042f2e',
      2: '#14b8a6', // Teal plumage
      3: '#99f6e4', // Bright feathers
      4: '#fbbf24', // Amber eye
      5: '#f43f5e'  // Ruby throat
    },
    grid: [
      "0000000000000000",
      "0000011100000000",
      "0000122210000000",
      "1111224210000000",
      "0000152210000000",
      "0001252211100000",
      "0012222133311000",
      "0122221333333100",
      "0122213333333310",
      "0012213333333100",
      "0012221133311000",
      "0001222211100000",
      "0000122210000000",
      "0000012210000000",
      "0000001100000000",
      "0000000000000000"
    ]
  },

  // 8. Simbionte Alienígena
  alien_symbiote: {
    palette: {
      1: '#14532d',
      2: '#84cc16', // Bio lime
      3: '#d9f99d', // Acid glow
      4: '#a855f7', // Purple sensory
      5: '#4d7c0f'  // Tendrils
    },
    grid: [
      "0001100000011000",
      "0012210000122100",
      "0122221111222210",
      "0124222222224210",
      "1224222222224221",
      "1222224444222221",
      "1522224444222251",
      "0122222222222210",
      "0012233333322100",
      "0122233333322210",
      "1222222222222221",
      "1212121212121221",
      "0101010101010110",
      "0000000000000000",
      "0000000000000000",
      "0000000000000000"
    ]
  },

  // 9. Escarabajo Solar de Ra
  solar_scarab: {
    palette: {
      1: '#713f12',
      2: '#eab308', // Radiant gold
      3: '#fef08a', // Sun core
      4: '#0284c7', // Lapis lazuli
      5: '#ca8a04'  // Bronze shell
    },
    grid: [
      "0000001111000000",
      "0000112442110000",
      "0001222222221000",
      "0012223333222100",
      "1122233333322211",
      "1222333333332221",
      "1222555115552221",
      "0125555115555210",
      "0125555115555210",
      "1225555115555221",
      "1222555115552221",
      "0122255115522210",
      "0012222112222100",
      "0001122002211000",
      "0000011001100000",
      "0000000000000000"
    ]
  },

  // 10. Singularidad Cuántica
  quantum_singularity: {
    palette: {
      1: '#312e81',
      2: '#6366f1', // Indigo event horizon
      3: '#a5b4fc', // Core light
      4: '#38bdf8', // Photon ring
      5: '#4338ca'  // Warp gravity
    },
    grid: [
      "0000001111000000",
      "0000112222110000",
      "0001223333221000",
      "0012334444332100",
      "0123441111443210",
      "1234411111144321",
      "1234111111114321",
      "1234111111114321",
      "1234411111144321",
      "0123441111443210",
      "0012334444332100",
      "0001223333221000",
      "0000112222110000",
      "0000001111000000",
      "0000000000000000",
      "0000000000000000"
    ]
  }
};

/**
 * Procedural Pixel Art Canvas Renderer
 */
export class PixelPetRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.pixelSize = 5;
    this.animationTick = 0;
    this.currentSpeciesId = 'zen_cat';
    this.isBlinking = false;
    this.isSleeping = false;
    this.wakeTicks = 0;
  }

  setSpecies(speciesId) {
    if (PIXEL_MATRICES[speciesId]) {
      this.currentSpeciesId = speciesId;
    } else {
      this.currentSpeciesId = 'zen_cat';
    }
  }

  wakeUp() {
    this.isSleeping = false;
    this.wakeTicks = 180; // stays excited for 3 seconds
  }

  render() {
    this.animationTick++;
    if (this.wakeTicks > 0) this.wakeTicks--;
    else if (this.animationTick % 600 === 0) {
      this.isSleeping = true;
    }

    const appEl = document.getElementById('app');
    const is1Bit = appEl && appEl.dataset.theme === '1bit';

    const spec = PIXEL_MATRICES[this.currentSpeciesId] || PIXEL_MATRICES.zen_cat;
    const { palette, grid } = spec;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const centerX = Math.floor(this.canvas.width / 2);
    const centerY = Math.floor(this.canvas.height / 2);

    // 1. Draw Cozy Donut Bed
    const bedRadiusX = 52;
    const bedRadiusY = 28;
    const bedY = centerY + 16;

    this.ctx.beginPath();
    this.ctx.ellipse(centerX, bedY, bedRadiusX, bedRadiusY, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = is1Bit ? '#222222' : '#2b4f8c';
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = is1Bit ? '#ffffff' : '#1a325a';
    this.ctx.stroke();

    // Inner cushion
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, bedY + 4, bedRadiusX - 10, bedRadiusY - 8, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = is1Bit ? '#111111' : '#88aee8';
    this.ctx.fill();

    // 2. Draw Pet with breathing / bobbing
    const bounceOffset = Math.sin(this.animationTick * 0.08) * 2.5;
    const isBlinkFrame = (this.animationTick % 120 >= 115) || this.isSleeping;

    const startX = Math.floor((this.canvas.width - 16 * this.pixelSize) / 2);
    const startY = Math.floor((this.canvas.height - 16 * this.pixelSize) / 2) + Math.round(bounceOffset) - 6;

    for (let r = 0; r < 16; r++) {
      const row = grid[r];
      for (let c = 0; c < 16; c++) {
        let val = row[c];
        if (val === '0') continue;

        // If blinking or sleeping, close eyes
        if (isBlinkFrame && val === '4') {
          val = '1';
        }

        let color = palette[val];
        if (is1Bit) {
          if (val === '1') color = '#000000';
          else color = '#ffffff';
        }

        if (color) {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(
            startX + c * this.pixelSize,
            startY + r * this.pixelSize,
            this.pixelSize,
            this.pixelSize
          );
        }
      }
    }

    // 3. Sleeping 'z' particles
    if (this.isSleeping && this.animationTick % 40 < 25) {
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillStyle = is1Bit ? '#ffffff' : '#3b82f6';
      this.ctx.fillText('zZ', centerX + 26, centerY - 14 + (this.animationTick % 30) * -0.5);
    }
  }
}
