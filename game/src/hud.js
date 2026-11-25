// hud.js — top bar, order board, tray bar, banners and the title / pause /
// results screens. Everything the player reads at a glance lives here.

import { ingredientById } from './recipes.js';
import { drawFoodIcon } from './kitchen-render.js';

export const ORDER_BOARD = { x: 14, y: 84, w: 288, h: 676 };
export const TICKET_H = 196;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  return m + ':' + String(s % 60).padStart(2, '0');
}

export function drawCustomerFace(ctx, x, y, mood, seed) {
  // mood: 0 happy, 1 worried, 2 angry. Simple drawn face, no emoji.
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#ffcc9e';
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // hair / hat by seed
  ctx.fillStyle = seed % 3 === 0 ? '#4e342e' : seed % 3 === 1 ? '#1565c0' : '#6a1b9a';
  ctx.beginPath();
  ctx.arc(0, -8, 26, Math.PI, 0);
  ctx.fill();
  if (seed % 3 === 1) {
    ctx.fillRect(-26, -14, 52, 8);
  }
  ctx.fillStyle = '#263238';
  const worried = mood >= 1;
  ctx.beginPath();
  ctx.arc(-9, -2, 3, 0, Math.PI * 2);
  ctx.arc(9, -2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#263238';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (mood === 0) {
    ctx.arc(0, 8, 9, 0.1 * Math.PI, 0.9 * Math.PI);
  } else if (mood === 1) {
    ctx.moveTo(-8, 14);
    ctx.quadraticCurveTo(0, 8, 8, 14);
  } else {
    ctx.moveTo(-8, 15);
    ctx.lineTo(8, 9);
    ctx.moveTo(8, 15);
    ctx.lineTo(-8, 9);
  }
  ctx.stroke();
  if (worried) {
    ctx.beginPath();
    ctx.moveTo(-13, -12);
    ctx.lineTo(-5, -9);
    ctx.moveTo(13, -12);
    ctx.lineTo(5, -9);
    ctx.stroke();
  }
  ctx.restore();
}

export function ticketRects(state) {
  return state.orders.map((o, i) => ({
    order: o,
    x: ORDER_BOARD.x + 8,
    y: ORDER_BOARD.y + 44 + i * (TICKET_H + 10),
    w: ORDER_BOARD.w - 16,
    h: TICKET_H,
  }));
}

export function drawHud(ctx, state, time) {
  // Top bar
  ctx.fillStyle = '#241226';
  ctx.fillRect(0, 0, 1280, 76);
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(0, 74, 1280, 3);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffca28';
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('WARUNG SENJA', 18, 34);
  ctx.fillStyle = '#ffd9a0';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Dapur pasar malam', 18, 58);

  // Shift timer — big and central
  const rush = state.shiftLeft <= 30 && state.shiftLeft > 0;
  const timerBg = rush ? '#b71c1c' : '#3e2723';
  ctx.fillStyle = timerBg;
  roundRect(ctx, 470, 10, 340, 56, 10);
  ctx.fill();
  ctx.strokeStyle = rush && Math.sin(time * 6) > 0 ? '#ffeb3b' : '#ffb347';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText((rush ? 'JAM RAMAI  ' : 'SHIFT  ') + fmtTime(state.shiftLeft), 640, 48);
  // shift progress under timer
  ctx.fillStyle = '#4e342e';
  ctx.fillRect(486, 60, 308, 5);
  ctx.fillStyle = '#ffb347';
  ctx.fillRect(486, 60, 308 * (1 - state.shiftLeft / state.shiftTotal), 5);

  // Coins / served / hearts / combo — right side
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('◉ ' + state.coins, 1000, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Tersaji: ' + state.served, 1000, 63);
  ctx.textAlign = 'left';
  ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < state.hearts ? '#ef5350' : '#4e342e';
    ctx.fillText('♥', 1030 + i * 30, 42);
  }
  ctx.fillStyle = state.combo >= 2 ? '#ffab91' : '#bcaaa4';
  ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(state.combo >= 2 ? 'KOMBO x' + state.combo : 'Kombo —', 1030, 66);
  ctx.fillStyle = '#bcaaa4';
  ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('P / Esc: jeda', 1264, 66);

  drawOrderBoard(ctx, state, time);
  drawTrayBar(ctx, state);

  // Banner
  if (state.banner && state.banner.age < state.banner.life) {
    const t = state.banner.age / state.banner.life;
    ctx.globalAlpha = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
    ctx.fillStyle = 'rgba(27,94,32,0.94)';
    roundRect(ctx, 400, 200, 780, 52, 12);
    ctx.fill();
    ctx.strokeStyle = '#a5d6a7';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.banner.text, 790, 235);
    ctx.globalAlpha = 1;
  }
  // Rush flash
  if (rush && state.screen === 'play') {
    ctx.fillStyle = 'rgba(183,28,28,' + (0.05 + 0.03 * Math.sin(time * 4)) + ')';
    ctx.fillRect(316, 76, 948, 694);
  }
}

function drawOrderBoard(ctx, state, time) {
  ctx.fillStyle = '#2d1b2e';
  roundRect(ctx, ORDER_BOARD.x, ORDER_BOARD.y, ORDER_BOARD.w, ORDER_BOARD.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#ffca28';
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAPAN PESANAN', ORDER_BOARD.x + ORDER_BOARD.w / 2, ORDER_BOARD.y + 30);

  if (state.orders.length === 0) {
    ctx.fillStyle = '#d7ccc8';
    ctx.font = '17px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('Belum ada pesanan…', ORDER_BOARD.x + ORDER_BOARD.w / 2, ORDER_BOARD.y + 120);
    ctx.fillText('Tamu segera datang!', ORDER_BOARD.x + ORDER_BOARD.w / 2, ORDER_BOARD.y + 146);
    return;
  }
  ticketRects(state).forEach(({ order, x, y, w, h }) => {
    const frac = order.patience / order.maxPatience;
    const mood = frac > 0.5 ? 0 : frac > 0.25 ? 1 : 2;
    const shakeX = state.ticketShake === order.id && state.shake > 0 ? Math.sin(time * 40) * 5 : 0;
    const isTarget = state.readyDish && state.readyFor === order.id;
    ctx.save();
    ctx.translate(shakeX, 0);
    ctx.fillStyle = isTarget ? '#fff8e1' : '#fffdf5';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = isTarget ? '#2e7d32' : '#bcaaa4';
    ctx.lineWidth = isTarget ? 4 : 2;
    ctx.stroke();
    drawCustomerFace(ctx, x + 40, y + 38, mood, order.id);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 19px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(order.customer, x + 74, y + 30);
    ctx.fillStyle = '#6d4c41';
    ctx.font = 'bold 17px "Trebuchet MS", Verdana, sans-serif';
    const wrapped = wrapName(order.recipe.name);
    ctx.fillText(wrapped[0], x + 74, y + 54);
    if (wrapped[1]) ctx.fillText(wrapped[1], x + 74, y + 74);
    // patience bar
    ctx.fillStyle = '#e0e0e0';
    roundRect(ctx, x + 14, y + 88, w - 28, 14, 7);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#66bb6a' : frac > 0.25 ? '#ffca28' : '#e53935';
    if (frac > 0) {
      roundRect(ctx, x + 14, y + 88, (w - 28) * frac, 14, 7);
      ctx.fill();
    }
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmtTime(order.patience), x + w - 14, y + 100);
    ctx.textAlign = 'left';
    ctx.fillText('SABAR', x + 14, y + 100);
    // recipe icons row
    ctx.fillStyle = '#4e342e';
    ctx.font = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('RESEP:', x + 14, y + 122);
    order.recipe.items.forEach((id, i) => {
      const ix = x + 24 + i * 58;
      const iy = y + 150;
      const ing = ingredientById(id);
      ctx.fillStyle = '#fff3e0';
      ctx.beginPath();
      ctx.arc(ix + 18, iy, 23, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#bcaaa4';
      ctx.stroke();
      drawFoodIcon(ctx, id, ix + 18, iy, 36, true);
      const onPlate = state.plate.includes(id);
      if (onPlate) {
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ix + 4, iy + 2);
        ctx.lineTo(ix + 14, iy + 12);
        ctx.lineTo(ix + 34, iy - 10);
        ctx.stroke();
      }
      ctx.fillStyle = '#263238';
      ctx.font = '12px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ing.name, ix + 18, iy + 38);
    });
    if (isTarget) {
      ctx.fillStyle = '#2e7d32';
      roundRect(ctx, x + w - 78, y + 10, 66, 24, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ SIAP!', x + w - 45, y + 27);
    }
    ctx.restore();
  });
  ctx.textAlign = 'left';
}

function wrapName(name) {
  if (name.length <= 17) return [name];
  const cut = name.lastIndexOf(' ', 17);
  if (cut < 0) return [name];
  return [name.slice(0, cut), name.slice(cut + 1)];
}

function drawTrayBar(ctx, state) {
  const x = 336;
  const y = 716;
  const w = 420;
  const h = 48;
  ctx.fillStyle = 'rgba(20,12,24,0.88)';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('BAWAAN:', x + 12, y + 30);
  if (state.cook.carry.length === 0) {
    ctx.fillStyle = '#bcaaa4';
    ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('kosong — ambil bahan di meja atas', x + 104, y + 30);
  }
  state.cook.carry.forEach((item, i) => {
    const ix = x + 118 + i * 96;
    ctx.fillStyle = item.done ? '#c8e6c9' : '#ffecb3';
    roundRect(ctx, ix, y + 7, 88, 34, 8);
    ctx.fill();
    drawFoodIcon(ctx, item.id, ix + 20, y + 24, 30, item.done);
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(item.name + (item.done ? ' ✓' : ' …'), ix + 38, y + 29);
  });
  // Controls reminder, right of tray
  ctx.fillStyle = '#d7ccc8';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Klik stasiun untuk jalan & pakai • E: pakai stasiun terdekat • M: bisu', 780, y + 30);
}

export function drawTitleScreen(ctx, time) {
  ctx.fillStyle = '#2b1a33';
  ctx.fillRect(0, 0, 1280, 800);
  // sunset stripes
  const grad = ctx.createLinearGradient(0, 0, 0, 420);
  grad.addColorStop(0, '#ff8a3d');
  grad.addColorStop(0.6, '#e5396b');
  grad.addColorStop(1, '#5d3a5e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1280, 420);
  ctx.fillStyle = '#fff176';
  ctx.beginPath();
  ctx.arc(640, 250, 74, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1a33';
  ctx.fillRect(0, 420, 1280, 380);
  // string lights
  for (let i = 0; i < 14; i += 1) {
    const lx = 60 + i * 86;
    const ly = 120 + Math.sin(i * 1.3) * 18;
    ctx.fillStyle = i % 2 ? '#ffca28' : '#ff7043';
    ctx.beginPath();
    ctx.arc(lx, ly, 8 + Math.sin(time * 3 + i) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 84px "Trebuchet MS", Verdana, sans-serif';
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(43,26,51,0.8)';
  ctx.strokeText('WARUNG SENJA', 640, 190);
  ctx.fillText('WARUNG SENJA', 640, 190);
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#ffe082';
  ctx.fillText('Masak pesanan pasar malam sebelum tamu kehabisan sabar!', 640, 250);
  // sample dishes row
  ['nasi', 'ayam', 'sambal', 'mie', 'telur', 'sate', 'lontong', 'kecap'].forEach((id, i) => {
    const dx = 300 + i * 97;
    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.arc(dx, 340, 38, 0, Math.PI * 2);
    ctx.fill();
    drawFoodIcon(ctx, id, dx, 340, 56, true);
  });
  // Start button
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, 490, 470, 300, 68, 14);
  ctx.fill();
  ctx.strokeStyle = '#a5d6a7';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('MULAI MASAK', 640, 514);
  ctx.font = '20px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#ffd9a0';
  ctx.fillText('WASD / panah untuk jalan • klik stasiun atau tekan E untuk memakai • P jeda', 640, 580);
  ctx.fillText('Ambil bahan → potong / goreng bila perlu → racik di piring → antar di jendela saji.', 640, 612);
  ctx.fillText('Selesaikan shift 2½ menit. Tiga tamu kecewa = dapur tutup lebih awal!', 640, 644);
  ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#bcaaa4';
  ctx.fillText('Tekan Enter atau klik MULAI MASAK', 640, 700);
}

export function drawPauseScreen(ctx) {
  ctx.fillStyle = 'rgba(15,8,20,0.72)';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('JEDA', 640, 330);
  ctx.font = '24px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#ffe082';
  ctx.fillText('Tekan P / Esc atau klik untuk lanjut memasak.', 640, 390);
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, 540, 430, 200, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('LANJUT', 640, 467);
}

export function drawResultsScreen(ctx, state) {
  ctx.fillStyle = 'rgba(27,16,34,0.94)';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffca28';
  ctx.font = 'bold 58px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('SHIFT SELESAI!', 640, 150);
  const stars = state.served >= 10 ? 3 : state.served >= 6 ? 2 : state.served >= 3 ? 1 : 0;
  ctx.font = '64px "Trebuchet MS", Verdana, sans-serif';
  let starLine = '';
  for (let i = 0; i < 3; i += 1) starLine += i < stars ? '★' : '☆';
  ctx.fillStyle = '#fff176';
  ctx.fillText(starLine, 640, 230);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Koin terkumpul: ◉ ' + state.coins, 640, 300);
  ctx.font = '24px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#ffe082';
  ctx.fillText('Pesanan tersaji: ' + state.served + '   •   Pesanan gagal: ' + state.failed + '   •   Kombo terbaik: x' + state.bestCombo, 640, 348);
  ctx.fillStyle = '#d7ccc8';
  ctx.font = '20px "Trebuchet MS", Verdana, sans-serif';
  const verdict = stars === 3 ? 'Koki bintang tiga! Warung Senja penuh sesak malam ini.'
    : stars === 2 ? 'Dapur yang rapi — tamu pulang kenyang dan senang.'
    : stars === 1 ? 'Shift yang lumayan. Besok lebih cepat lagi, ya!'
    : 'Shift yang berat. Coba lagi: racik sesuai resep di papan pesanan.';
  ctx.fillText(verdict, 640, 396);
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, 490, 450, 300, 68, 14);
  ctx.fill();
  ctx.strokeStyle = '#a5d6a7';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('MASAK LAGI', 640, 494);
  ctx.font = '18px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#bcaaa4';
  ctx.fillText('Tekan R atau klik MASAK LAGI untuk shift baru', 640, 560);
}
