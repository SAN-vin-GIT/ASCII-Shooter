import { isDown, consumeMouseDeltas } from './input.js';
import { isSolid } from './map.js';

export const player = {
  x: 3.5,
  y: 3.5,
  angle: 0,       // radians (0 = facing +x)
  pitch: 0,       // vertical pitch in character rows
  moveSpeed: 4.0, // world units per second
  turnSpeed: 2.5, // radians per second
};

export function updatePlayer(dt) {
  // 1. Mouse Look (Horizontal Angle & Vertical Pitch)
  const { dx: mouseX, dy: mouseY } = consumeMouseDeltas();
  const mouseSensitivity = 0.0025;
  const pitchSensitivity = 0.18;

  player.angle += mouseX * mouseSensitivity;

  // Invert dy for natural FPS mouse pitch look & clamp range
  player.pitch = Math.max(-28, Math.min(28, player.pitch - mouseY * pitchSensitivity));

  // Keyboard Turning Backup (Q / E or Arrow Keys)
  if (isDown('KeyQ') || isDown('ArrowLeft')) {
    player.angle -= player.turnSpeed * dt;
  }
  if (isDown('KeyE') || isDown('ArrowRight')) {
    player.angle += player.turnSpeed * dt;
  }

  // 2. Direction Vectors
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

  // Strafe Left / Right (A / D)
  if (isDown('KeyA')) {
    dx += sin;
    dy -= cos;
  }
  if (isDown('KeyD')) {
    dx -= sin;
    dy += cos;
  }

  // Normalize diagonal speed
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
  }

  // 3. Scale by speed and delta time
  dx *= player.moveSpeed * dt;
  dy *= player.moveSpeed * dt;

  // 4. Axis-Separated Bumper Collisions
  const radius = 0.2;

  // Try X movement
  const newX = player.x + dx;
  const testX = dx > 0 ? newX + radius : newX - radius;
  if (!isSolid(testX, player.y - radius) && !isSolid(testX, player.y + radius)) {
    player.x = newX;
  }

  // Try Y movement
  const newY = player.y + dy;
  const testY = dy > 0 ? newY + radius : newY - radius;
  if (!isSolid(player.x - radius, testY) && !isSolid(player.x + radius, testY)) {
    player.y = newY;
  }
}
