// Pre-renders every (character, color) pair onto an offscreen canvas
export function buildGlyphAtlas(chars, colors, fontSize = 14, fontFamily = 'monospace') {
  const atlasCanvas = document.createElement('canvas');
  const ctx = atlasCanvas.getContext('2d');

  // Measure monospace font character dimensions
  ctx.font = `${fontSize}px ${fontFamily}`;
  const cellW = Math.ceil(ctx.measureText('M').width);
  const cellH = Math.ceil(fontSize * 1.2);

  // Set atlas size: characters across (columns), colors down (rows)
  atlasCanvas.width = chars.length * cellW;
  atlasCanvas.height = colors.length * cellH;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  // Draw every char x color combination onto the offscreen canvas
  for (let colorIdx = 0; colorIdx < colors.length; colorIdx++) {
    ctx.fillStyle = colors[colorIdx];

    for (let charIdx = 0; charIdx < chars.length; charIdx++) {
      const char = chars[charIdx];
      const x = charIdx * cellW;
      const y = colorIdx * cellH;

      ctx.fillText(char, x, y);
    }
  }

  return {
    canvas: atlasCanvas,
    cellW,
    cellH,
    chars,
    colors,
    // Helper to get source rectangle (sx, sy) for ctx.drawImage
    getGlyphRect(charIndex, colorIndex) {
      return {
        sx: charIndex * cellW,
        sy: colorIndex * cellH
      };
    }
  };
}
