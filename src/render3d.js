import { castRays } from './raycast.js';
import { player } from './player.js';

export function renderFirstPerson(ctx, canvas) {
  const width = canvas.width;
  const height = canvas.height;

  // 1. Draw Ceiling (top half) & Floor (bottom half)
  ctx.fillStyle = '#333333'; // Ceiling dark gray
  ctx.fillRect(0, 0, width, height / 2);

  ctx.fillStyle = '#111111'; // Floor black/dark gray
  ctx.fillRect(0, height / 2, width, height / 2);

  // 2. Cast rays for every column on screen
  const fov = Math.PI / 3; // 60 degrees Field of View
  const numRays = width;   // 1 ray per pixel column
  const rays = castRays(player.x, player.y, player.angle, fov, numRays);

  const columnWidth = width / numRays;

  // 3. Draw vertical wall strips
  for (let i = 0; i < rays.length; i++) {
    const ray = rays[i];

    // Wall height is inversely proportional to distance!
    const lineHeight = Math.min(height, (height / (ray.dist || 0.0001)));
    const drawStart = (height - lineHeight) / 2;

    // Shade Y-hit walls slightly darker than X-hit walls for 3D depth perception
    ctx.fillStyle = ray.side === 1 ? '#888888' : '#aaaaaa';

    ctx.fillRect(
      i * columnWidth,
      drawStart,
      columnWidth + 0.5, // 0.5 overlap eliminates thin gap artifacts
      lineHeight
    );
  }
}
