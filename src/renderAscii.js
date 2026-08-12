import { castRays } from './raycast.js';
import { clearScreen, setCell } from './asciiScreen.js';

// ASCII Ramp with Slope Anti-aliasing Glyphs ('/', '\', '-')
export const ASCII_RAMP = " #%-|=+*@W.O/\\0$_~^";

// 12-shade high-contrast depth palette
export const COLOR_PALETTE = [
  '#000000', // 0: Black Background
  '#ffffff', // 1: Ultra White
  '#f4f4f4', // 2: Bright White
  '#e0e0e0', // 3: Off White
  '#cccccc', // 4: Light Gray
  '#b0b0b0', // 5: Mid Light Gray
  '#949494', // 6: Medium Gray
  '#787878', // 7: Slate Gray
  '#5c5c5c', // 8: Deep Slate
  '#404040', // 9: Dark Gray
  '#282828', // 10: Charcoal
  '#181818'  // 11: Far Horizon
];

// ULTRA-HD 32x32 BRICK TEXTURE (X-Walls)
const TEX_BRICK_32 = [
  "################################",
  "#==============================#",
  "#---|---|---|---|---|---|---|---#",
  "#---|---|---|---|---|---|---|---#",
  "#==============================#",
  "#--|---|---|---|---|---|---|---|",
  "#--|---|---|---|---|---|---|---|",
  "#==============================#",
  "#---|---|---|---|---|---|---|---#",
  "#---|---|---|---|---|---|---|---#",
  "#==============================#",
  "#--|---|---|---|---|---|---|---|",
  "#--|---|---|---|---|---|---|---|",
  "#==============================#",
  "#---|---|---|---|---|---|---|---#",
  "#---|---|---|---|---|---|---|---#",
  "#==============================#",
  "#--|---|---|---|---|---|---|---|",
  "#--|---|---|---|---|---|---|---|",
  "#==============================#",
  "#---|---|---|---|---|---|---|---#",
  "#---|---|---|---|---|---|---|---#",
  "#==============================#",
  "#--|---|---|---|---|---|---|---|",
  "#--|---|---|---|---|---|---|---|",
  "#==============================#",
  "#---|---|---|---|---|---|---|---#",
  "#---|---|---|---|---|---|---|---#",
  "#==============================#",
  "#==============================#",
  "################################",
  "################################"
];

// ULTRA-HD 32x32 STONE FORTRESS TEXTURE (Y-Walls)
const TEX_STONE_32 = [
  "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
  "%------------------------------%",
  "%--O---+---+---+---+---+---+--O%",
  "%------------------------------%",
  "%---+---+---+---+---+---+---+--%",
  "%------------------------------%",
  "%--O---+---+---+---+---+---+--O%",
  "%------------------------------%",
  "%---+---+---+---+---+---+---+--%",
  "%------------------------------%",
  "%--O---+---+---+---+---+---+--O%",
  "%------------------------------%",
  "%---+---+---+---+---+---+---+--%",
  "%------------------------------%",
  "%--O---+---+---+---+---+---+--O%",
  "%------------------------------%",
  "%---+---+---+---+---+---+---+--%",
  "%------------------------------%",
  "%--O---+---+---+---+---+---+--O%",
  "%------------------------------%",
  "%---+---+---+---+---+---+---+--%",
  "%------------------------------%",
  "%--O---+---+---+---+---+---+--O%",
  "%------------------------------%",
  "%---+---+---+---+---+---+---+--%",
  "%------------------------------%",
  "%--O---+---+---+---+---+---+--O%",
  "%------------------------------%",
  "%------------------------------%",
  "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
  "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
  "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
];

export function renderAsciiView(screen, player) {
  clearScreen(screen, 0, 0);

  const fov = Math.PI / 3;
  const rays = castRays(player.x, player.y, player.angle, fov, screen.cols);

  const PROJECTION_SCALE = 3.2;

  // 1. Pre-calculate precise unclipped wall heights & edges
  const unclippedStarts = new Float32Array(screen.cols);
  const lineHeights = new Float32Array(screen.cols);

  for (let cx = 0; cx < screen.cols; cx++) {
    const dist = rays[cx].dist || 0.0001;
    const lh = Math.max(6, (screen.rows * PROJECTION_SCALE) / dist);
    lineHeights[cx] = lh;
    unclippedStarts[cx] = (screen.rows - lh) / 2;
  }

  for (let cx = 0; cx < screen.cols; cx++) {
    const ray = rays[cx];
    const dist = ray.dist || 0.0001;

    const uStart = unclippedStarts[cx];
    const lineHeight = lineHeights[cx];

    const drawStart = Math.max(0, Math.floor(uStart));
    const drawEnd = Math.min(screen.rows, Math.ceil(uStart + lineHeight));

    // 2. Slope Trend Detection for Edge Anti-Aliasing
    const prevStart = unclippedStarts[Math.max(0, cx - 1)];
    const nextStart = unclippedStarts[Math.min(screen.cols - 1, cx + 1)];
    const slope = nextStart - prevStart; // Negative = Slanting Up, Positive = Slanting Down

    // Lighting
    const smoothDistRatio = 1 / (1 + dist * 0.04);
    let colorIdx = Math.max(1, Math.min(10, Math.floor((1 - smoothDistRatio) * 10) + 1));
    if (ray.side === 1 && colorIdx < 10) {
      colorIdx += 1;
    }

    const texture = ray.side === 0 ? TEX_BRICK_32 : TEX_STONE_32;
    const texW = 32;
    const texH = 32;

    const rayDirX = Math.cos(ray.angle);
    const rayDirY = Math.sin(ray.angle);

    let wallX = ray.wallX || 0;
    if (ray.side === 0 && rayDirX > 0) wallX = 1.0 - wallX;
    if (ray.side === 1 && rayDirY < 0) wallX = 1.0 - wallX;

    let tx = Math.floor(wallX * texW);
    if (tx < 0) tx = 0;
    if (tx >= texW) tx = texW - 1;

    for (let cy = 0; cy < screen.rows; cy++) {
      if (cy < drawStart) {
        setCell(screen, cx, cy, 0, 0);
      } else if (cy >= drawStart && cy < drawEnd) {
        let char;

        // 3. Slope Anti-Aliasing at Top and Bottom Edge Boundaries!
        if (cy === drawStart && uStart > 0 && Math.abs(slope) > 0.08) {
          char = slope < 0 ? '/' : '\\';
        } else if (cy === drawEnd - 1 && (uStart + lineHeight) < screen.rows && Math.abs(slope) > 0.08) {
          char = slope < 0 ? '\\' : '/';
        } else {
          // Standard texture sampling
          const yRatio = (cy - uStart) / lineHeight;
          let ty = Math.floor(yRatio * texH);
          if (ty < 0) ty = 0;
          if (ty >= texH) ty = texH - 1;

          char = texture[ty][tx];
        }

        const charIdx = ASCII_RAMP.indexOf(char);
        setCell(screen, cx, cy, charIdx !== -1 ? charIdx : 1, colorIdx);
      } else {
        const floorRatio = (cy - screen.rows / 2) / (screen.rows / 2);
        const floorColorIdx = Math.min(11, Math.floor((1 - floorRatio) * 5) + 7);
        setCell(screen, cx, cy, ASCII_RAMP.indexOf('.'), floorColorIdx);
      }
    }
  }
}
