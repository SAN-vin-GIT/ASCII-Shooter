// Creates an ASCII screen buffer (e.g., 120 columns x 60 rows)
export function createScreen(cols, rows) {
  return {
    cols,
    rows,
    charBuffer: new Uint8Array(cols * rows),
    colorBuffer: new Uint8Array(cols * rows)
  };
}

// Clears the entire buffer to a default character and color
export function clearScreen(screen, charIdx = 0, colorIdx = 0) {
  screen.charBuffer.fill(charIdx);
  screen.colorBuffer.fill(colorIdx);
}

// Writes a single character & color index to cell (cx, cy)
export function setCell(screen, cx, cy, charIdx, colorIdx) {
  if (cx < 0 || cx >= screen.cols || cy < 0 || cy >= screen.rows) {
    return; // Out of bounds safety
  }
  const idx = cy * screen.cols + cx;
  screen.charBuffer[idx] = charIdx;
  screen.colorBuffer[idx] = colorIdx;
}

// Blits the ASCII buffer to the HTML5 canvas using the Glyph Atlas
export function drawScreen(ctx, screen, atlas) {
  const { cols, rows, charBuffer, colorBuffer } = screen;
  const { canvas: atlasCanvas, cellW, cellH } = atlas;

  // Clear canvas background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const idx = cy * cols + cx;
      const charIdx = charBuffer[idx];
      const colorIdx = colorBuffer[idx];

      // Skip blank spaces (character index 0)
      if (charIdx === 0) continue;

      // Source rectangle in the atlas sprite-sheet
      const sx = charIdx * cellW;
      const sy = colorIdx * cellH;

      // Destination rectangle on the main canvas
      const dx = cx * cellW;
      const dy = cy * cellH;

      // Blit glyph image
      ctx.drawImage(
        atlasCanvas,
        sx, sy, cellW, cellH,  // Source crop from atlas
        dx, dy, cellW, cellH   // Destination placement on screen
      );
    }
  }
}
