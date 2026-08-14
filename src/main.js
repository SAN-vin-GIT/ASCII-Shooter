import { initInput, isPaused } from './input.js';
import { updatePlayer, player } from './player.js';
import { updateWeapon } from './weapon.js';
import { startLoop } from './loop.js';
import { renderTopDown, renderMinimap } from './render2d.js';
import { buildGlyphAtlas } from './glyphAtlas.js';
import { createScreen, drawScreen } from './asciiScreen.js';
import { renderAsciiView, ASCII_RAMP, COLOR_PALETTE } from './renderAscii.js';

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

initInput(canvas);

// High-resolution ASCII character font size
const fontSize = 8;
const atlas = buildGlyphAtlas(ASCII_RAMP, COLOR_PALETTE, fontSize, 'monospace');

let cols = Math.floor(canvas.width / atlas.cellW);
let rows = Math.floor(canvas.height / atlas.cellH);
let asciiScreen = createScreen(cols, rows);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  cols = Math.floor(canvas.width / atlas.cellW);
  rows = Math.floor(canvas.height / atlas.cellH);
  asciiScreen = createScreen(cols, rows);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Toggle 2D vs 3D view with the 'M' key
let show3D = true;
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') {
    show3D = !show3D;
  }
});

function drawPauseOverlay(ctx, canvas) {
  // Translucent dark background overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pause Card Box
  const boxW = 420;
  const boxH = 130;
  const boxX = (canvas.width - boxW) / 2;
  const boxY = (canvas.height - boxH) / 2;

  ctx.fillStyle = 'rgba(18, 18, 18, 0.92)';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME PAUSED', canvas.width / 2, boxY + 45);

  // Instructions
  ctx.fillStyle = '#cccccc';
  ctx.font = '15px monospace';
  ctx.fillText('Click screen to resume', canvas.width / 2, boxY + 85);
  ctx.fillStyle = '#888888';
  ctx.font = '13px monospace';
  ctx.fillText('(Press ESC anytime to pause / release mouse)', canvas.width / 2, boxY + 108);
}

startLoop(
  (dt) => {
    if (!isPaused) {
      updatePlayer(dt);
      updateWeapon(dt);
    }
  },
  () => {
    if (show3D) {
      renderAsciiView(asciiScreen, player);
      drawScreen(ctx, asciiScreen, atlas);
      renderMinimap(ctx, canvas);

      if (isPaused) {
        drawPauseOverlay(ctx, canvas);
      }
    } else {
      renderTopDown(ctx, canvas);
      if (isPaused) {
        drawPauseOverlay(ctx, canvas);
      }
    }
  }
);