export const TILE_EMPTY = 0;
export const TILE_WALL  = 1;

export const MAP_W = 80;
export const MAP_H = 64;

// Generates a complete 64x64 grid
function createCustomMap(w, h) {
  const grid = new Array(w * h).fill(TILE_EMPTY);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Outer border walls
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
        grid[idx] = TILE_WALL;
      }
      // Internal room dividers
      else if ((x === 16 || x === 32 || x === 48) && (y % 8 !== 3 && y % 8 !== 4)) {
        grid[idx] = TILE_WALL;
      }
      else if ((y === 16 || y === 32 || y === 48) && (x % 8 !== 3 && x % 8 !== 4)) {
        grid[idx] = TILE_WALL;
      }
    }
  }
  return grid;
}

export const map = createCustomMap(MAP_W, MAP_H);

export function tileAt(x, y) {
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  if (cx < 0 || cx >= MAP_W || cy < 0 || cy >= MAP_H) return TILE_WALL;
  return map[cy * MAP_W + cx];
}

export function isSolid(x, y) {
  return tileAt(x, y) === TILE_WALL;
}
