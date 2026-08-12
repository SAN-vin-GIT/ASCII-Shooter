import { MAP_W, MAP_H, TILE_WALL, tileAt } from './map.js';
import { player } from './player.js';

const TILE_SIZE = 24;

export function renderTopDown(ctx, canvas) {
  // Clear screen
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Camera offset: Centers the player in the middle of the screen!
  const offsetX = canvas.width / 2 - player.x * TILE_SIZE;
  const offsetY = canvas.height / 2 - player.y * TILE_SIZE;

  // Draw tiles relative to camera offset
  for (let cy = 0; cy < MAP_H; cy++) {
    for (let cx = 0; cx < MAP_W; cx++) {
      const tile = tileAt(cx, cy);
      const screenX = cx * TILE_SIZE + offsetX;
      const screenY = cy * TILE_SIZE + offsetY;

      // Only draw tiles visible inside the screen view
      if (
        screenX + TILE_SIZE >= 0 &&
        screenX < canvas.width &&
        screenY + TILE_SIZE >= 0 &&
        screenY < canvas.height
      ) {
        ctx.fillStyle = tile === TILE_WALL ? '#555555' : '#222222';
        ctx.fillRect(screenX, screenY, TILE_SIZE - 1, TILE_SIZE - 1);
      }
    }
  }

  // Draw player dot dead center on screen
  const px = canvas.width / 2;
  const py = canvas.height / 2;

  ctx.fillStyle = '#ff3366';
  ctx.beginPath();
  ctx.arc(px, py, 6, 0, Math.PI * 2);
  ctx.fill();

  // Draw direction line
  const dirLen = 18;
  const endX = px + Math.cos(player.angle) * dirLen;
  const endY = py + Math.sin(player.angle) * dirLen;

  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

// Pure Monochromatic Circular Radar Minimap (Top-Right Corner)
export function renderMinimap(ctx, canvas) {
  const radius = 60;
  const radarX = canvas.width - radius - 20;
  const radarY = radius + 20;
  const scale = 8; // Minimap grid scale

  ctx.save();

  // 1. Circular Clip Window
  ctx.beginPath();
  ctx.arc(radarX, radarY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#080808';
  ctx.fill();
  ctx.clip();

  // 2. Render Monochrome Map Grid relative to Player
  const offsetX = radarX - player.x * scale;
  const offsetY = radarY - player.y * scale;

  for (let cy = 0; cy < MAP_H; cy++) {
    for (let cx = 0; cx < MAP_W; cx++) {
      const tile = tileAt(cx, cy);
      if (tile !== TILE_WALL) continue;

      const sx = cx * scale + offsetX;
      const sy = cy * scale + offsetY;

      // Draw Wall blocks in sleek Silver/Gray
      ctx.fillStyle = '#888888';
      ctx.fillRect(sx, sy, scale - 0.5, scale - 0.5);
    }
  }

  // 3. Player Radar Dot & Vision Direction Pointer
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(radarX, radarY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  const dirLen = 12;
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(radarX, radarY);
  ctx.lineTo(radarX + Math.cos(player.angle) * dirLen, radarY + Math.sin(player.angle) * dirLen);
  ctx.stroke();

  ctx.restore();

  // 4. Sleek Silver Outer Ring
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(radarX, radarY, radius, 0, Math.PI * 2);
  ctx.stroke();
}
