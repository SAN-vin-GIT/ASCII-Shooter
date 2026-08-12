import { initInput } from './input.js';
import { updatePlayer, player } from './player.js';
import { updateWeapon } from './weapon.js'; // 1. Import updateWeapon!
import { startLoop } from './loop.js';
import { renderTopDown, renderMinimap } from './render2d.js';
import { buildGlyphAtlas } from './glyphAtlas.js';
import { createScreen, drawScreen } from './asciiScreen.js';
import { renderAsciiView, ASCII_RAMP, COLOR_PALETTE } from './renderAscii.js';

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

initInput();

// High-resolution ASCII character font size
const fontSize = 8;
const atlas = buildGlyphAtlas(ASCII_RAMP, COLOR_PALETTE, fontSize, 'monospace');

const cols = Math.floor(canvas.width / atlas.cellW);
const rows = Math.floor(canvas.height / atlas.cellH);
const asciiScreen = createScreen(cols, rows);

// Toggle 2D vs 3D view with the 'M' key
let show3D = true;
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') {
    show3D = !show3D;
  }
});

startLoop(
  (dt) => {
    updatePlayer(dt);
    updateWeapon(dt); // 2. Update weapon state & recoil animation!
  },
  () => {
    if (show3D) {
      renderAsciiView(asciiScreen, player);
      drawScreen(ctx, asciiScreen, atlas);
      renderMinimap(ctx, canvas);
    } else {
      renderTopDown(ctx, canvas);
    }
  }
);