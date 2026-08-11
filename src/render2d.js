import { MAP_W, MAP_H, TILE_WALL, tileAt } from './map.js';
import { player } from './player.js';

const TILE_SIZE = 24;

export function renderTopDown(ctx, canvas) {
  // Clear screen
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw tiles
  for (let cy = 0; cy < MAP_H; cy++) {
    for (let cx = 0; cx < MAP_W; cx++) {
      const tile = tileAt(cx, cy);
      ctx.fillStyle = tile === TILE_WALL ? '#555555' : '#222222';
      ctx.fillRect(cx * TILE_SIZE, cy * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1);
    }
  }

  // Draw player dot
  const px = player.x * TILE_SIZE;
  const py = player.y * TILE_SIZE;

  ctx.fillStyle = '#ff3366';
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fill();

  // Draw direction line
  const dirLen = 15;
  const endX = px + Math.cos(player.angle) * dirLen;
  const endY = py + Math.sin(player.angle) * dirLen;

  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}
