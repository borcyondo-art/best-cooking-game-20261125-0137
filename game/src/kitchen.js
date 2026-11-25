// kitchen.js — where everything sits, and what happens when the cook uses it.
// Stations: ingredient bins along the top, two prep stations, the plating
// counter, the serving window and the trash bin.

import { INGREDIENTS, ingredientById, sameSet } from './recipes.js';
import { findMatchingOrder, orderReward } from './orders.js';
import { spawnFloat, spawnPuff, spawnSparkle } from './particles.js';
import { sfx } from './audio.js';

export const BINS_Y = 92;

export function buildStations() {
  const stations = [];
  const binW = 94;
  const gap = 6;
  const startX = 332;
  INGREDIENTS.forEach((ing, i) => {
    stations.push({
      kind: 'bin',
      id: ing.id,
      label: ing.name.toUpperCase(),
      x: startX + i * (binW + gap),
      y: BINS_Y,
      w: binW,
      h: 96,
      approach: { x: startX + i * (binW + gap) + binW / 2, y: 214 },
    });
  });
  stations.push({
    kind: 'prep', id: 'talenan', prep: 'potong', label: 'TALENAN',
    sub: 'POTONG SAYUR', x: 336, y: 300, w: 252, h: 138,
    approach: { x: 462, y: 462 },
  });
  stations.push({
    kind: 'plate', id: 'meja-racik', label: 'MEJA RACIK',
    sub: 'RACIK DI PIRING', x: 636, y: 300, w: 252, h: 138,
    approach: { x: 762, y: 462 },
  });
  stations.push({
    kind: 'prep', id: 'wajan', prep: 'goreng', label: 'WAJAN',
    sub: 'GORENG DI WAJAN', x: 936, y: 300, w: 252, h: 138,
    approach: { x: 1062, y: 462 },
  });
  stations.push({
    kind: 'trash', id: 'sampah', label: 'SAMPAH',
    sub: 'BUANG BAWAAN', x: 336, y: 560, w: 150, h: 128,
    approach: { x: 411, y: 540 },
  });
  stations.push({
    kind: 'serve', id: 'jendela-saji', label: 'JENDELA SAJI',
    sub: 'ANTAR PESANAN', x: 936, y: 560, w: 252, h: 128,
    approach: { x: 1062, y: 540 },
  });
  return stations;
}

export function stationAt(stations, x, y) {
  return stations.find((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) || null;
}

export function nearestStation(stations, cook, maxDist) {
  let best = null;
  let bestD = maxDist;
  stations.forEach((s) => {
    const cx = s.x + s.w / 2;
    const cy = s.y + s.h / 2;
    const d = Math.hypot(cook.x - cx, cook.y - cy);
    if (d < bestD) { bestD = d; best = s; }
  });
  return best;
}

// Carry items are { id, done } — done means prepped (or needs no prep).
export function useStation(state, station, fx) {
  const { cook } = state;
  if (state.prep) return 'busy';
  if (!station) return 'none';

  if (station.kind === 'bin') {
    if (cook.carry.length >= 3) {
      sfx.reject();
      spawnFloat(fx, cook.x, cook.y - 90, 'Bawaan penuh!', '#ff8a80');
      return 'full';
    }
    const ing = ingredientById(station.id);
    cook.carry.push({ id: ing.id, done: ing.prep === null, color: ing.color, name: ing.name, prep: ing.prep });
    sfx.pickup();
    spawnPuff(fx, station.x + station.w / 2, station.y + 30, '#fff3c4');
    spawnFloat(fx, station.x + station.w / 2, station.y - 6, '+' + ing.name, '#ffe082');
    return 'picked';
  }

  if (station.kind === 'prep') {
    const idx = cook.carry.findIndex((c) => !c.done && c.prep === station.prep);
    if (idx < 0) {
      sfx.reject();
      spawnFloat(fx, cook.x, cook.y - 90, station.prep === 'potong' ? 'Butuh sayur mentah!' : 'Butuh bahan mentah!', '#ff8a80');
      return 'nothing';
    }
    const item = cook.carry[idx];
    state.prep = {
      stationId: station.id,
      prep: station.prep,
      carryIndex: idx,
      item,
      t: 0,
      dur: station.prep === 'potong' ? 1.1 : 1.45,
      chopTick: 0,
    };
    if (station.prep === 'goreng') sfx.sizzle();
    return 'prepping';
  }

  if (station.kind === 'plate') {
    if (cook.carry.length === 0) {
      // Empty hands on the plate clears the current assembly.
      if (state.plate.length > 0) {
        state.plate = [];
        sfx.click();
        spawnFloat(fx, station.x + station.w / 2, station.y - 6, 'Racikan dibuang', '#ffcc80');
        return 'cleared';
      }
      sfx.reject();
      return 'nothing';
    }
    const item = cook.carry[cook.carry.length - 1];
    if (!item.done) {
      sfx.reject();
      spawnFloat(fx, cook.x, cook.y - 90, 'Masih mentah! Olah dulu', '#ff8a80');
      return 'raw';
    }
    const wanted = state.orders.some((o) => o.recipe.items.includes(item.id));
    const dup = state.plate.includes(item.id);
    if (!wanted || dup) {
      sfx.reject();
      spawnFloat(fx, station.x + station.w / 2, station.y - 6, 'Tidak cocok!', '#ff8a80');
      state.shake = 0.25;
      return 'reject';
    }
    cook.carry.pop();
    state.plate.push(item.id);
    sfx.plating();
    spawnSparkle(fx, station.x + station.w / 2, station.y + 60);
    const match = findMatchingOrder(state.plate, state.orders);
    if (match) {
      state.plate = [];
      state.readyDish = match.recipe;
      state.readyFor = match.id;
      sfx.ready();
      spawnFloat(fx, 1062, 540, 'PESANAN SIAP!', '#a5d6a7');
      spawnPuff(fx, 1062, 600, '#ffffff');
      state.banner = { text: match.recipe.name.toUpperCase() + ' SIAP DIANTAR!', age: 0, life: 1.6 };
    }
    return 'plated';
  }

  if (station.kind === 'serve') {
    if (!state.readyDish) {
      sfx.reject();
      spawnFloat(fx, station.x + station.w / 2, station.y - 6, 'Belum ada hidangan siap!', '#ff8a80');
      return 'nothing';
    }
    return serveReadyDish(state, fx, station);
  }

  if (station.kind === 'trash') {
    if (cook.carry.length === 0) {
      sfx.reject();
      return 'nothing';
    }
    cook.carry = [];
    sfx.click();
    spawnFloat(fx, station.x + station.w / 2, station.y - 6, 'Dibuang', '#ffcc80');
    return 'trashed';
  }
  return 'none';
}

export function serveReadyDish(state, fx, station) {
  const order = state.orders.find((o) => o.id === state.readyFor);
  if (!order) {
    state.readyDish = null;
    state.readyFor = null;
    return 'gone';
  }
  const coins = orderReward(order, state.combo);
  state.coins += coins;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served += 1;
  const cx = station ? station.x + station.w / 2 : 1062;
  const cy = station ? station.y - 6 : 540;
  spawnFloat(fx, cx, cy, '+' + coins + ' koin', '#ffe082');
  if (state.combo >= 2) spawnFloat(fx, cx, cy - 30, 'KOMBO x' + state.combo + '!', '#ffab91');
  spawnSparkle(fx, cx, cy + 40);
  sfx.serve();
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.readyDish = null;
  state.readyFor = null;
  return 'served';
}

export function serveTicket(state, orderId, fx) {
  if (!state.readyDish) {
    sfx.reject();
    state.ticketShake = orderId;
    state.shake = 0.25;
    return 'nothing';
  }
  if (state.readyFor !== orderId) {
    sfx.reject();
    state.ticketShake = orderId;
    state.shake = 0.25;
    spawnFloat(fx, 160, 120, 'Hidangan itu bukan untuk tamu ini!', '#ff8a80');
    return 'mismatch';
  }
  const station = state.stations.find((s) => s.kind === 'serve');
  return serveReadyDish(state, fx, station);
}

export function updatePrep(state, dt, fx) {
  const prep = state.prep;
  if (!prep) return;
  prep.t += dt;
  prep.chopTick += dt;
  if (prep.chopTick > 0.28) {
    prep.chopTick = 0;
    if (prep.prep === 'potong') sfx.chop();
    else sfx.sizzle();
  }
  if (prep.t >= prep.dur) {
    const item = state.cook.carry[prep.carryIndex];
    if (item) item.done = true;
    const station = state.stations.find((s) => s.id === prep.stationId);
    if (station) spawnPuff(fx, station.x + station.w / 2, station.y + 50, '#ffe0b2');
    sfx.plating();
    state.prep = null;
  }
}

export function plateMatchesAnyOrder(state) {
  return state.orders.some((o) => sameSet(state.plate, o.recipe.items.slice(0, state.plate.length)) && state.plate.length > 0);
}
