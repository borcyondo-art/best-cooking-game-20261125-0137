// cook.js — the cook: walking, click-to-move, bobbing, and the drawn chef.

export const FLOOR = { x0: 332, y0: 196, x1: 1248, y1: 748 };

export function createCook() {
  return { x: 790, y: 560, tx: 790, ty: 560, moving: false, dir: 1, bob: 0, walkPhase: 0, targetStation: null, carry: [] };
}

export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function updateCook(cook, dx, dy, dt, onArrive) {
  let moved = false;
  if (dx !== 0 || dy !== 0) {
    cook.tx = cook.x;
    cook.ty = cook.y;
    cook.targetStation = null;
    cook.x += dx * 360 * dt;
    cook.y += dy * 360 * dt;
    moved = true;
    if (dx !== 0) cook.dir = dx > 0 ? 1 : -1;
  } else if (cook.moving) {
    const vx = cook.tx - cook.x;
    const vy = cook.ty - cook.y;
    const dist = Math.hypot(vx, vy);
    if (dist < 12) {
      cook.x = cook.tx;
      cook.y = cook.ty;
      cook.moving = false;
      const st = cook.targetStation;
      cook.targetStation = null;
      if (st && onArrive) onArrive(st);
    } else {
      const step = 360 * dt;
      cook.x += (vx / dist) * step;
      cook.y += (vy / dist) * step;
      moved = true;
      if (vx !== 0) cook.dir = vx > 0 ? 1 : -1;
    }
  }
  cook.x = Math.max(FLOOR.x0, Math.min(FLOOR.x1, cook.x));
  cook.y = Math.max(FLOOR.y0, Math.min(FLOOR.y1, cook.y));
  if (moved) cook.walkPhase += dt * 11;
  cook.bob = moved ? Math.sin(cook.walkPhase) * 3 : 0;
  return moved;
}

export function drawCook(ctx, cook, carrying, prepping) {
  const x = cook.x;
  const y = cook.y + cook.bob * 0.4;
  ctx.save();
  ctx.translate(x, y);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 34, 30, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // legs
  ctx.fillStyle = '#37474f';
  ctx.fillRect(-18, 16, 14, 20);
  ctx.fillRect(4, 16, 14, 20);
  // body / apron
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.moveTo(-24, -8);
  ctx.quadraticCurveTo(0, -18, 24, -8);
  ctx.lineTo(20, 20);
  ctx.lineTo(-20, 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(-15, -4, 30, 24);
  ctx.strokeStyle = '#d84315';
  ctx.lineWidth = 2;
  ctx.strokeRect(-15, -4, 30, 24);
  // arms
  ctx.fillStyle = '#e53935';
  const armSwing = prepping ? 0 : Math.sin(cook.walkPhase) * 7;
  ctx.beginPath();
  ctx.arc(-27, 2 + armSwing, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(27, 2 - armSwing, 8, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.fillStyle = '#ffcc9e';
  ctx.beginPath();
  ctx.arc(0, -30, 17, 0, Math.PI * 2);
  ctx.fill();
  // chef hat
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-11, -43, 9, 0, Math.PI * 2);
  ctx.arc(0, -47, 10, 0, Math.PI * 2);
  ctx.arc(11, -43, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-13, -44, 26, 8);
  ctx.strokeStyle = '#cfd8dc';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-13, -44, 26, 8);
  // face
  ctx.fillStyle = '#263238';
  ctx.beginPath();
  ctx.arc(-6 + cook.dir * 2, -31, 2.2, 0, Math.PI * 2);
  ctx.arc(6 + cook.dir * 2, -31, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#263238';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cook.dir * 2, -26, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // carried tray above head
  if (carrying.length > 0) {
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(-30, -72, 60, 6);
    carrying.forEach((item, i) => {
      ctx.fillStyle = item.color || '#fff';
      ctx.beginPath();
      ctx.arc(-20 + i * 20, -78, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
  ctx.restore();
}
