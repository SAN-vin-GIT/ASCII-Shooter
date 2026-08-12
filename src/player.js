import { isDown } from './input.js';
import { isSolid } from './map.js';

export const player = {
  x: 3.5,
  y: 3.5,
  angle: 0,       // radians (0 = facing +x)
  moveSpeed: 4.0, // world units per second
  turnSpeed: 2.5, // radians per second
};

export function updatePlayer(dt) {
  // 1. Camera Turning (Q / E or Left / Right Arrows)
  if (isDown('KeyQ') || isDown('ArrowLeft')) {
    player.angle -= player.turnSpeed * dt;
  }
  if (isDown('KeyE') || isDown('ArrowRight')) {
    player.angle += player.turnSpeed * dt;
  }

  // 2. Compute Direction Vectors
  const cos = Math.cos(player.angle);
  const sin = Math.sin(player.angle);

  let dx = 0;
  let dy = 0;

  // Move Forward / Backward (W / S or Up / Down Arrows)
  if (isDown('KeyW') || isDown('ArrowUp')) {
    dx += cos;
    dy += sin;
  }
  if (isDown('KeyS') || isDown('ArrowDown')) {
    dx -= cos;
    dy -= sin;
  }

  // Strafe Left / Right (A / D) - Sidestepping
  if (isDown('KeyA')) {
    dx += sin;  // Strafe Left
    dy -= cos;
  }
  if (isDown('KeyD')) {
    dx -= sin;  // Strafe Right
    dy += cos;
  }

  // Normalize movement vector if walking diagonally
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
  }

  // 3. Scale by speed and delta time
  dx *= player.moveSpeed * dt;
  dy *= player.moveSpeed * dt;

  // 4. Axis-Separated Bumper Collisions (Wall-Sliding)
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
