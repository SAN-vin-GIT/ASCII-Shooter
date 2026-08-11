import { initInput } from './input.js';
import { updatePlayer } from './player.js';
import { startLoop } from './loop.js';
import { renderTopDown } from './render2d.js';

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

// Initialize keyboard event listeners
initInput();

// Start the game loop
startLoop(
  (dt) => updatePlayer(dt),
  () => renderTopDown(ctx, canvas)
);
