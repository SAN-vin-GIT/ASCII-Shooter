export const TILE_EMPTY = 0;
export const TILE_WALL  = 1;

// Define map dimensions (e.g., 16 x 16)
export const MAP_W = 16;
export const MAP_H = 16;

const MAP_STRINGS = [
  "1111111111111111",
  "1000000000000001",
  "1011001001110001",
  "1010001000010001",
  "1010111110010001",
  "1000100010000001",
  "1000100010011101",
  "1000000000010001",
  "1000000000010001",
  "1011111000000001",
  "1000001000000001",
  "1000001001110001",
  "1000000001000001",
  "1000000001000001",
  "1000000000000001",
  "1111111111111111"
];

export const map = MAP_STRINGS.join("").split("").map(Number);


export function tileAt(x, y) {
  const cx = Math.floor(x);
  const cy = Math.floor(y);

  if (cx < 0 || cx >= MAP_W || cy < 0 || cy >= MAP_H) {
    return TILE_WALL;
  }

  return map[cy * MAP_W + cx];
}
  
export function isSolid(x, y) {
  return tileAt(x, y) === TILE_WALL;
}