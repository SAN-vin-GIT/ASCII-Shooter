import { isDown } from './input.js';
import { isSolid } from './map.js';

export const player = {
  x: 3.5,
  y: 3.5,
  angle: 0,       // radians (0 = facing +x)
  moveSpeed: 3.0, // world units per second
};

export function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  // 1. Direct screen directions
  if (isDown('KeyW') || isDown('ArrowUp'))    dy -= 1; // Up (-y in canvas)
  if (isDown('KeyS') || isDown('ArrowDown'))  dy += 1; // Down (+y in canvas)
  if (isDown('KeyA') || isDown('ArrowLeft'))  dx -= 1; // Left (-x)
  if (isDown('KeyD') || isDown('ArrowRight')) dx += 1; // Right (+x)

  // 2. If moving, calculate facing angle using Math.atan2(dy, dx)
  if (dx !== 0 || dy !== 0) {
    player.angle = Math.atan2(dy, dx);

    // Normalize diagonal movement speed (so moving diagonally isn't faster)
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
  }

  // 3. Scale by speed and delta time
  dx *= player.moveSpeed * dt;
  dy *= player.moveSpeed * dt;

  // 4. Collision Detection (Axis-separated)
  const radius = 0.2;

  // Try X movement
  const newX = player.x + dx;
  const signX = Math.sign(dx);
  if (!isSolid(newX + signX * radius, player.y)) {
    player.x = newX;
  }

  // Try Y movement
  const newY = player.y + dy;
  const signY = Math.sign(dy);
  if (!isSolid(player.x, newY + signY * radius)) {
    player.y = newY;
  }
}
