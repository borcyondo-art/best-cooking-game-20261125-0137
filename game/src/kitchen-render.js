// kitchen-render.js — draws the kitchen itself: floor, wall, lamps, counters,
// stations, and every food icon, all in code. No images are loaded.

import { ingredientById, prepLabel } from './recipes.js';
import { drawCook } from './cook.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawFoodIcon(ctx, id, x, y, s, done) {
  const u = s / 48;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = 2 * u;
  ctx.strokeStyle = 'rgba(60,30,0,0.55)';
  if (id === 'nasi') {
    ctx.fillStyle = '#3f51b5';
    ctx.beginPath();
    ctx.moveTo(-20 * u, -2 * u);
    ctx.quadraticCurveTo(0, 22 * u, 20 * u, -2 * u);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fffbe8';
    ctx.beginPath();
    ctx.ellipse(0, -4 * u, 17 * u, 9 * u, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#f5ecd0';
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.arc((-12 + i * 5) * u, (-8 - (i % 2) * 3) * u, 2.6 * u, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'ayam') {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-16 * u, 12 * u, 5 * u, 10 * u);
    ctx.fillRect(11 * u, 12 * u, 5 * u, 10 * u);
    ctx.beginPath();
    ctx.arc(-13.5 * u, 11 * u, 4.5 * u, 0, Math.PI * 2);
    ctx.arc(13.5 * u, 11 * u, 4.5 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = done ? '#c97a1f' : '#e8a34c';
    ctx.beginPath();
    ctx.ellipse(0, -2 * u, 17 * u, 13 * u, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = done ? '#8d4e12' : '#b96f1e';
    ctx.beginPath();
    ctx.arc(8 * u, -6 * u, 4 * u, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'mie') {
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.moveTo(-20 * u, -2 * u);
    ctx.quadraticCurveTo(0, 22 * u, 20 * u, -2 * u);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f7c948';
    ctx.lineWidth = 3.4 * u;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-14 * u, (-6 + i * 5) * u);
      ctx.bezierCurveTo(-6 * u, (-11 + i * 5) * u, 6 * u, (-1 + i * 5) * u, 14 * u, (-6 + i * 5) * u);
      ctx.stroke();
    }
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(-4 * u, -14 * u, 8 * u, 4 * u);
  } else if (id === 'telur') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 2 * u, 19 * u, 13 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = done ? '#f2b705' : '#ffd54f';
    ctx.beginPath();
    ctx.arc(0, 1 * u, 8 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(-2.5 * u, -1.5 * u, 2.6 * u, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3 * u;
    ctx.beginPath();
    ctx.moveTo(0, 18 * u);
    ctx.lineTo(0, -6 * u);
    ctx.stroke();
    ctx.fillStyle = done ? '#66bb6a' : '#4caf50';
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i - 2) * 0.5;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 13 * u, -6 * u + Math.sin(a) * 10 * u, 8 * u, 5 * u, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#81c784';
    ctx.beginPath();
    ctx.arc(0, -12 * u, 5 * u, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sambal') {
    ctx.fillStyle = '#eceff1';
    ctx.beginPath();
    ctx.moveTo(-18 * u, -2 * u);
    ctx.quadraticCurveTo(0, 20 * u, 18 * u, -2 * u);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.ellipse(0, -3 * u, 14 * u, 6 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff7043';
    ctx.beginPath();
    ctx.moveTo(0, -16 * u);
    ctx.quadraticCurveTo(7 * u, -6 * u, 2 * u, 0);
    ctx.quadraticCurveTo(-4 * u, -8 * u, 0, -16 * u);
    ctx.fill();
    ctx.fillStyle = '#33691e';
    ctx.fillRect(-2 * u, -19 * u, 4 * u, 4 * u);
  } else if (id === 'sate') {
    ctx.strokeStyle = '#bcaaa4';
    ctx.lineWidth = 2.4 * u;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 11 * u, -20 * u);
      ctx.lineTo(i * 11 * u, 18 * u);
      ctx.stroke();
    }
    ctx.fillStyle = done ? '#7a3f16' : '#a5673f';
    for (let row = 0; row < 3; row += 1) {
      for (let i = -1; i <= 1; i += 1) {
        roundRect(ctx, i * 11 * u - 6 * u, (-12 + row * 9) * u, 12 * u, 8 * u, 2 * u);
        ctx.fill();
      }
    }
  } else if (id === 'lontong') {
    ctx.fillStyle = '#2e7d32';
    roundRect(ctx, -20 * u, -8 * u, 40 * u, 20 * u, 4 * u);
    ctx.fill();
    ctx.fillStyle = '#f3ead2';
    ctx.fillRect(-16 * u, -4 * u, 10 * u, 12 * u);
    ctx.fillRect(-3 * u, -4 * u, 10 * u, 12 * u);
    ctx.fillRect(10 * u, -4 * u, 6 * u, 12 * u);
    ctx.strokeStyle = 'rgba(60,30,0,0.4)';
    ctx.strokeRect(-16 * u, -4 * u, 10 * u, 12 * u);
    ctx.strokeRect(-3 * u, -4 * u, 10 * u, 12 * u);
  } else if (id === 'kecap') {
    ctx.fillStyle = '#3b2314';
    roundRect(ctx, -9 * u, -10 * u, 18 * u, 28 * u, 5 * u);
    ctx.fill();
    ctx.fillStyle = '#120a05';
    ctx.fillRect(-5 * u, -19 * u, 10 * u, 9 * u);
    ctx.fillStyle = '#ffca28';
    ctx.fillRect(-9 * u, 0, 18 * u, 7 * u);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-6 * u, -7 * u, 3 * u, 22 * u);
  }
  ctx.restore();
}

export function drawKitchen(ctx, state, time) {
  const { stations } = state;
  // Wall
  const wall = ctx.createLinearGradient(0, 76, 0, 210);
  wall.addColorStop(0, '#4a2b52');
  wall.addColorStop(1, '#5d3a5e');
  ctx.fillStyle = wall;
  ctx.fillRect(316, 76, 948, 130);
  // Wall tiles + warm glow strip (bins sit against this wall).
  ctx.fillStyle = 'rgba(255,183,77,0.16)';
  ctx.fillRect(560, 80, 360, 60);
  // Hanging lamps
  [470, 790, 1110].forEach((lx) => {
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 76);
    ctx.lineTo(lx, 96);
    ctx.stroke();
    ctx.fillStyle = '#ffca28';
    ctx.beginPath();
    ctx.moveTo(lx - 16, 96);
    ctx.lineTo(lx + 16, 96);
    ctx.lineTo(lx + 8, 116);
    ctx.lineTo(lx - 8, 116);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,202,40,0.18)';
    ctx.beginPath();
    ctx.moveTo(lx - 30, 116);
    ctx.lineTo(lx + 30, 116);
    ctx.lineTo(lx + 55, 200);
    ctx.lineTo(lx - 55, 200);
    ctx.closePath();
    ctx.fill();
  });
  // Floor tiles
  for (let ty = 0; ty < 6; ty += 1) {
    for (let tx = 0; tx < 10; tx += 1) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? '#7a4a3a' : '#6d4133';
      ctx.fillRect(316 + tx * 95, 206 + ty * 94, 95, 94);
      ctx.strokeStyle = 'rgba(0,0,0,0.14)';
      ctx.strokeRect(316 + tx * 95, 206 + ty * 94, 95, 94);
    }
  }
  // Warm rug under the middle stations
  ctx.fillStyle = '#8e2432';
  roundRect(ctx, 560, 480, 460, 120, 14);
  ctx.fill();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Stations
  stations.forEach((st) => {
    const hover = state.hoverStation === st;
    if (st.kind === 'bin') {
      const ing = ingredientById(st.id);
      ctx.fillStyle = hover ? '#a1887f' : '#8d6e63';
      roundRect(ctx, st.x, st.y, st.w, st.h, 10);
      ctx.fill();
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(st.x, st.y + st.h - 12, st.w, 12);
      ctx.fillStyle = '#fff8e1';
      roundRect(ctx, st.x + 6, st.y + 6, st.w - 12, 42, 8);
      ctx.fill();
      drawFoodIcon(ctx, st.id, st.x + st.w / 2, st.y + 27, 40, true);
      ctx.fillStyle = '#fff7e8';
      ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.label, st.x + st.w / 2, st.y + st.h - 26);
      if (ing.prep) {
        ctx.fillStyle = '#ffcc80';
        ctx.font = 'bold 11px "Trebuchet MS", Verdana, sans-serif';
        ctx.fillText(prepLabel(ing.prep), st.x + st.w / 2, st.y + st.h - 9);
      }
    } else if (st.kind === 'prep') {
      const active = state.prep && state.prep.stationId === st.id;
      ctx.fillStyle = hover || active ? '#b0bec5' : '#90a4ae';
      roundRect(ctx, st.x, st.y, st.w, st.h, 12);
      ctx.fill();
      ctx.fillStyle = '#eceff1';
      ctx.fillRect(st.x + 10, st.y + 10, st.w - 20, st.h - 34);
      if (st.prep === 'potong') {
        ctx.fillStyle = '#a1887f';
        roundRect(ctx, st.x + 56, st.y + 34, 140, 52, 6);
        ctx.fill();
        ctx.fillStyle = '#4caf50';
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.arc(st.x + 82 + i * 30, st.y + 60, 11, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.save();
        ctx.translate(st.x + 176, st.y + 34);
        ctx.rotate(active ? Math.sin(time * 18) * 0.35 : -0.5);
        ctx.fillStyle = '#cfd8dc';
        ctx.fillRect(0, 0, 52, 9);
        ctx.fillStyle = '#455a64';
        ctx.fillRect(48, 1, 16, 7);
        ctx.restore();
      } else {
        ctx.fillStyle = '#37474f';
        ctx.beginPath();
        ctx.ellipse(st.x + st.w / 2, st.y + 62, 78, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff7043';
        ctx.beginPath();
        ctx.ellipse(st.x + st.w / 2, st.y + 60, 60, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffab40';
        ctx.beginPath();
        ctx.ellipse(st.x + st.w / 2, st.y + 58, 40, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        if (active) {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          for (let i = 0; i < 3; i += 1) {
            const yy = st.y + 34 - ((time * 40 + i * 14) % 26);
            ctx.beginPath();
            ctx.arc(st.x + st.w / 2 - 24 + i * 24, yy, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      if (active) {
        const p = state.prep.t / state.prep.dur;
        ctx.fillStyle = '#263238';
        ctx.fillRect(st.x + 24, st.y + st.h - 30, st.w - 48, 10);
        ctx.fillStyle = p > 0.66 ? '#66bb6a' : '#ffca28';
        ctx.fillRect(st.x + 24, st.y + st.h - 30, (st.w - 48) * Math.min(1, p), 10);
      }
      ctx.fillStyle = '#263238';
      ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.label + '  •  ' + st.sub, st.x + st.w / 2, st.y + st.h - 8);
    } else if (st.kind === 'plate') {
      const ready = state.plate.length > 0;
      ctx.fillStyle = hover ? '#ffe0b2' : '#ffcc80';
      roundRect(ctx, st.x, st.y, st.w, st.h, 12);
      ctx.fill();
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 3;
      ctx.stroke();
      // The plate
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(st.x + st.w / 2, st.y + 62, 82, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b0bec5';
      ctx.stroke();
      ctx.fillStyle = '#eceff1';
      ctx.beginPath();
      ctx.ellipse(st.x + st.w / 2, st.y + 60, 58, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      state.plate.forEach((id, i) => {
        const n = state.plate.length;
        drawFoodIcon(ctx, id, st.x + st.w / 2 + (i - (n - 1) / 2) * 58, st.y + 58, 40, true);
      });
      if (state.plate.length === 0) {
        ctx.fillStyle = '#90a4ae';
        ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Piring kosong — klik bahan olahan', st.x + st.w / 2, st.y + 64);
      } else {
        ctx.fillStyle = '#2e7d32';
        ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RACIKAN: ' + state.plate.length + ' bahan', st.x + st.w / 2, st.y + 34);
      }
      ctx.fillStyle = '#4e342e';
      ctx.font = 'bold 19px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.label, st.x + st.w / 2, st.y + st.h - 8);
      if (ready) {
        ctx.fillStyle = '#2e7d32';
        ctx.font = '13px "Trebuchet MS", Verdana, sans-serif';
        ctx.fillText('Lengkapi sesuai pesanan di papan!', st.x + st.w / 2, st.y + 20);
      }
    } else if (st.kind === 'serve') {
      const hasDish = !!state.readyDish;
      const glow = hasDish ? 0.5 + Math.sin(time * 5) * 0.3 : 0;
      ctx.fillStyle = hasDish ? '#c8e6c9' : '#bcaaa4';
      roundRect(ctx, st.x, st.y, st.w, st.h, 12);
      ctx.fill();
      if (hasDish) {
        ctx.strokeStyle = 'rgba(255,235,59,' + glow + ')';
        ctx.lineWidth = 6;
        ctx.stroke();
      }
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(st.x + 10, st.y + 10, st.w - 20, 34);
      ctx.fillStyle = '#fff7e8';
      ctx.font = 'bold 17px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JENDELA SAJI', st.x + st.w / 2, st.y + 33);
      if (hasDish) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(st.x + st.w / 2, st.y + 82, 66, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b0bec5';
        ctx.stroke();
        const n = state.readyDish.items.length;
        const dishCx = st.x + st.w / 2;
        state.readyDish.items.forEach((id, i) => {
          drawFoodIcon(ctx, id, dishCx + (i - (n - 1) / 2) * 52, st.y + 80, 36, true);
        });
        ctx.fillStyle = '#1b5e20';
        ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
        ctx.fillText('SIAP! Klik untuk antar', st.x + st.w / 2, st.y + st.h - 10);
      } else {
        ctx.fillStyle = '#5d4037';
        ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
        ctx.fillText('Hidangan siap muncul di sini.', st.x + st.w / 2, st.y + 80);
        ctx.fillText('Klik tiket pesanan untuk mengantar.', st.x + st.w / 2, st.y + 102);
      }
    } else if (st.kind === 'trash') {
      ctx.fillStyle = hover ? '#ef9a9a' : '#bdbdbd';
      roundRect(ctx, st.x, st.y, st.w, st.h, 12);
      ctx.fill();
      ctx.fillStyle = '#616161';
      ctx.beginPath();
      ctx.moveTo(st.x + 45, st.y + 30);
      ctx.lineTo(st.x + 105, st.y + 30);
      ctx.lineTo(st.x + 98, st.y + 92);
      ctx.lineTo(st.x + 52, st.y + 92);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#455a64';
      ctx.fillRect(st.x + 42, st.y + 22, 66, 9);
      ctx.fillStyle = '#4e342e';
      ctx.font = 'bold 17px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.label, st.x + st.w / 2, st.y + st.h - 8);
    }
  });

  // Carry bar under the cook's feet area is drawn by HUD; draw the cook last.
  drawCook(ctx, state.cook, state.cook.carry, !!state.prep);
}
