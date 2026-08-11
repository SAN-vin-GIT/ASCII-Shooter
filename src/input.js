const keys = new Set();

export function initInput() {
  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
    
    // Prevent the webpage from scrolling when pressing Arrow keys
    if (e.code.startsWith('Arrow')) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });
}

export function isDown(code) {
  return keys.has(code);
}
