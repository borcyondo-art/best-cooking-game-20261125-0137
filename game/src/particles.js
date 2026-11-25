// particles.js — floating score texts, steam puffs and sparkles. Pure decoration.

export function createEffects() {
  return { floats: [], puffs: [], sparkles: [] };
}

export function spawnFloat(fx, x, y, text, color) {
  fx.floats.push({ x, y, text, color: color || '#ffe082', age: 0, life: 1.1 });
}

export function spawnPuff(fx, x, y, color) {
  for (let i = 0; i < 6; i += 1) {
    fx.puffs.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 24,
      vy: -28 - Math.random() * 22,
      age: 0,
      life: 0.7 + Math.random() * 0.4,
      size: 5 + Math.random() * 7,
      color: color || '#ffffff',
    });
  }
}

export function spawnSparkle(fx, x, y) {
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    fx.sparkles.push({ x, y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, age: 0, life: 0.5 });
  }
}

export function updateEffects(fx, dt) {
  fx.floats.forEach((f) => { f.age += dt; f.y -= 42 * dt; });
  fx.floats = fx.floats.filter((f) => f.age < f.life);
  fx.puffs.forEach((p) => { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; });
  fx.puffs = fx.puffs.filter((p) => p.age < p.life);
  fx.sparkles.forEach((s) => { s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt; });
  fx.sparkles = fx.sparkles.filter((s) => s.age < s.life);
}

export function drawEffects(ctx, fx) {
  fx.puffs.forEach((p) => {
    const t = 1 - p.age / p.life;
    ctx.globalAlpha = 0.55 * t;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (1 + (1 - t) * 0.6), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  fx.sparkles.forEach((s) => {
    const t = 1 - s.age / s.life;
    ctx.globalAlpha = t;
    ctx.fillStyle = '#fff176';
    ctx.fillRect(s.x - 3, s.y - 1, 6, 2);
    ctx.fillRect(s.x - 1, s.y - 3, 2, 6);
  });
  ctx.globalAlpha = 1;
  fx.floats.forEach((f) => {
    const t = 1 - f.age / f.life;
    ctx.globalAlpha = Math.min(1, t * 2);
    ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(40,16,0,0.85)';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  });
  ctx.globalAlpha = 1;
}
