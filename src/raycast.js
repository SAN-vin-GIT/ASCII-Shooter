import { tileAt, TILE_WALL } from './map.js';

// Casts a single ray using DDA (Digital Differential Analyzer)
export function castRay(px, py, rayAngle) {
  const rayDirX = Math.cos(rayAngle);
  const rayDirY = Math.sin(rayAngle);

  let mapX = Math.floor(px);
  let mapY = Math.floor(py);

  // Distance ray travels to cross 1 full grid line in X or Y
  const deltaDistX = Math.abs(1 / (rayDirX || 1e-30));
  const deltaDistY = Math.abs(1 / (rayDirY || 1e-30));

  let stepX, stepY;
  let sideDistX, sideDistY;

  if (rayDirX < 0) {
    stepX = -1;
    sideDistX = (px - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1.0 - px) * deltaDistX;
  }

  if (rayDirY < 0) {
    stepY = -1;
    sideDistY = (py - mapY) * deltaDistY;
  } else {
    stepY = 1;
    sideDistY = (mapY + 1.0 - py) * deltaDistY;
  }

  let hit = false;
  let side = 0; // 0 for vertical wall (X), 1 for horizontal wall (Y)

  while (!hit) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }

    if (tileAt(mapX, mapY) === TILE_WALL) {
      hit = true;
    }
  }

  let perpWallDist;
  if (side === 0) {
    perpWallDist = (mapX - px + (1 - stepX) / 2) / (rayDirX || 1e-30);
  } else {
    perpWallDist = (mapY - py + (1 - stepY) / 2) / (rayDirY || 1e-30);
  }

  let wallX;
  if (side === 0) {
    wallX = py + perpWallDist * rayDirY;
  } else {
    wallX = px + perpWallDist * rayDirX;
  }
  wallX -= Math.floor(wallX);

  return {
    dist: Math.max(0.0001, perpWallDist),
    side,
    tileX: mapX,
    tileY: mapY,
    wallX
  };
}

// Casts rays across a true Flat Camera Projection Plane
export function castRays(px, py, playerAngle, fov, columns) {
  const rays = [];

  // Facing direction vector
  const dirX = Math.cos(playerAngle);
  const dirY = Math.sin(playerAngle);

  // Camera projection plane vector (perpendicular to direction vector)
  const fovScale = Math.tan(fov / 2);
  const planeX = -dirY * fovScale;
  const planeY = dirX * fovScale;

  for (let i = 0; i < columns; i++) {
    // Map screen column linearly from -1 (left edge) to +1 (right edge)
    const cameraX = (2 * i / columns) - 1;

    // Ray direction vector in 2D world space
    const rayDirX = dirX + planeX * cameraX;
    const rayDirY = dirY + planeY * cameraX;

    const rayAngle = Math.atan2(rayDirY, rayDirX);

    const ray = castRay(px, py, rayAngle);

    // Fisheye correction using camera plane dot product
    const correctedDist = ray.dist * Math.cos(rayAngle - playerAngle);

    rays.push({
      ...ray,
      dist: Math.max(0.0001, correctedDist),
      angle: rayAngle
    });
  }

  return rays;
}
