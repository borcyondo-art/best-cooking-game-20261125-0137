// input.js — one small job: remember keyboard and mouse state for the game.

export function createInput(canvas) {
  const keys = new Set();
  const input = {
    keys,
    pressed: new Set(),
    mouse: { x: 0, y: 0, clicked: null, down: false },
    consumeClick() {
      const c = input.mouse.clicked;
      input.mouse.clicked = null;
      return c;
    },
    endFrame() {
      input.pressed.clear();
    },
  };

  window.addEventListener('keydown', (ev) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(ev.key)) ev.preventDefault();
    keys.add(ev.key.toLowerCase());
    if (!ev.repeat) input.pressed.add(ev.key.toLowerCase());
  });
  window.addEventListener('keyup', (ev) => keys.delete(ev.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  function canvasPoint(ev) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((ev.clientX - rect.left) / rect.width) * 1280,
      y: ((ev.clientY - rect.top) / rect.height) * 800,
    };
  }

  canvas.addEventListener('mousemove', (ev) => {
    const p = canvasPoint(ev);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
  });
  canvas.addEventListener('mousedown', (ev) => {
    const p = canvasPoint(ev);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
    input.mouse.down = true;
  });
  window.addEventListener('mouseup', (ev) => {
    const p = canvasPoint(ev);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
    if (input.mouse.down) input.mouse.clicked = { x: p.x, y: p.y };
    input.mouse.down = false;
  });
  return input;
}

export function axisFromKeys(keys) {
  let dx = 0;
  let dy = 0;
  if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;
  if (keys.has('w') || keys.has('arrowup')) dy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) dy += 1;
  if (dx !== 0 && dy !== 0) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }
  return { dx, dy };
}
