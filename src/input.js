const keys = new Set();
let mouseDeltaX = 0;
let mouseDeltaY = 0;
export let isPaused = true; // Starts paused until user clicks canvas to lock pointer!

let gameCanvas = null;

export function initInput(canvas) {
  gameCanvas = canvas;

  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
    if (e.code.startsWith('Arrow')) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  // Lock pointer when clicking on canvas
  if (canvas) {
    canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    });
  }

  // Pointer lock change listener (ESC releases pointer & pauses game)
  document.addEventListener('pointerlockchange', () => {
    isPaused = (document.pointerLockElement !== gameCanvas);
  });

  // Accumulate mouse movement (both horizontal X and vertical Y)
  window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === gameCanvas) {
      mouseDeltaX += e.movementX;
      mouseDeltaY += e.movementY;
    }
  });
}

export function consumeMouseDeltas() {
  const dx = mouseDeltaX;
  const dy = mouseDeltaY;
  mouseDeltaX = 0;
  mouseDeltaY = 0;
  return { dx, dy };
}

export function consumeMouseDeltaX() {
  const dx = mouseDeltaX;
  mouseDeltaX = 0;
  return dx;
}

export function isDown(code) {
  return keys.has(code);
}
