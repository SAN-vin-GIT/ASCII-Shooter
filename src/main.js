import { initInput } from './input.js';
import { updatePlayer } from './player.js';
import { startLoop } from './loop.js';
import { renderFirstPerson } from './render3d.js';
import { renderTopDown } from './render2d.js';

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

initInput();

// Toggle 2D vs 3D view with the 'M' key
let show3D = false;
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') {
    show3D = !show3D;
  }
});

startLoop(
  (dt) => updatePlayer(dt),
  () => {
    if (show3D) {
      renderFirstPerson(ctx, canvas);
    } else {
      renderTopDown(ctx, canvas);
    }
  }
);
