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
    perpWallDist = (mapX - px + (1 - stepX) / 2) / rayDirX;
  } else {
    perpWallDist = (mapY - py + (1 - stepY) / 2) / rayDirY;
  }

  let wallX;
  if (side === 0) {
    wallX = py + perpWallDist * rayDirY;
  } else {
    wallX = px + perpWallDist * rayDirX;
  }
  wallX -= Math.floor(wallX);

  return {
    dist: perpWallDist,
    side,
    tileX: mapX,
    tileY: mapY,
    wallX
  };
}

// Casts one ray per screen column across the Field of View
export function castRays(px, py, playerAngle, fov, columns) {
  const rays = [];
  const halfFov = fov / 2;
  const startAngle = playerAngle - halfFov;

  for (let i = 0; i < columns; i++) {
    const rayAngle = startAngle + (i / columns) * fov;
    const ray = castRay(px, py, rayAngle);
    
    // Correct fisheye distortion
    const correctedDist = ray.dist * Math.cos(rayAngle - playerAngle);

    rays.push({
      ...ray,
      dist: correctedDist,
      angle: rayAngle
    });
  }

  return rays;
}
