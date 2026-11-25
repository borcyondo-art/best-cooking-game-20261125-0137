// main.js — Warung Senja: boot, game loop, screens and the full shift loop.
// Written from the prose spec: one kitchen screen, an order board, counters,
// prep stations, plating, serving, a shift timer and a results screen.

import { createInput, axisFromKeys } from './input.js';
import { buildStations, stationAt, nearestStation, useStation, updatePrep, serveTicket } from './kitchen.js';
import { drawKitchen } from './kitchen-render.js';
import { drawHud, drawTitleScreen, drawPauseScreen, drawResultsScreen, ticketRects } from './hud.js';
import { createCook, updateCook } from './cook.js';
import { createEffects, updateEffects, drawEffects, spawnFloat } from './particles.js';
import { makeOrder, spawnInterval, resetOrderIds } from './orders.js';
import { recipeById } from './recipes.js';
import { ensureAudio, sfx, toggleMute } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const SHIFT_TOTAL = 150;

function freshState() {
  resetOrderIds();
  return {
    screen: 'title',
    time: 0,
    elapsed: 0,
    shiftTotal: SHIFT_TOTAL,
    shiftLeft: SHIFT_TOTAL,
    coins: 0,
    served: 0,
    failed: 0,
    combo: 0,
    bestCombo: 0,
    hearts: 3,
    cook: createCook(),
    orders: [],
    plate: [],
    readyDish: null,
    readyFor: null,
    prep: null,
    stations: buildStations(),
    hoverStation: null,
    banner: null,
    shake: 0,
    ticketShake: null,
    spawnTimer: 6,
    rushAnnounced: false,
    fx: createEffects(),
  };
}

let state = freshState();

function pressed(key) {
  return input.pressed.has(key);
}

function startShift() {
  const keepStations = state.stations;
  state = freshState();
  state.stations = keepStations;
  state.screen = 'play';
  state.orders.push(makeOrder(Math.random, 0, false));
  state.orders.push(makeOrder(Math.random, 0, false));
  state.spawnTimer = spawnInterval(0, false);
  sfx.start();
}

function endShift() {
  state.screen = 'results';
  state.prep = null;
}

function failOrder(order) {
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.failed += 1;
  state.combo = 0;
  state.hearts -= 1;
  if (state.readyFor === order.id) {
    state.readyDish = null;
    state.readyFor = null;
  }
  sfx.fail();
  state.banner = { text: order.customer.toUpperCase() + ' PERGI KECEWA…', age: 0, life: 1.6 };
  spawnFloat(state.fx, 160, 100, '-1 ♥', '#ff8a80');
  if (state.hearts <= 0) endShift();
}

function updatePlay(dt) {
  state.elapsed += dt;
  state.shiftLeft = Math.max(0, state.shiftTotal - state.elapsed);
  const rush = state.shiftLeft <= 30;
  if (rush && !state.rushAnnounced) {
    state.rushAnnounced = true;
    state.banner = { text: 'JAM RAMAI! PESANAN DATANG LEBIH CEPAT', age: 0, life: 2.0 };
    sfx.rush();
  }
  if (state.shiftLeft <= 0) {
    endShift();
    return;
  }

  // Spawn orders.
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    if (state.orders.length < 3) {
      state.orders.push(makeOrder(Math.random, state.elapsed, rush));
    }
    state.spawnTimer = spawnInterval(state.elapsed, rush);
  }

  // Patience.
  const expired = state.orders.filter((o) => {
    o.patience -= dt;
    return o.patience <= 0;
  });
  expired.forEach((o) => failOrder(o));
  if (state.screen !== 'play') return;

  // Prep work locks the cook in place.
  updatePrep(state, dt, state.fx);

  // Movement.
  const { dx, dy } = axisFromKeys(input.keys);
  const moving = state.prep ? false : true;
  updateCook(state.cook, state.prep ? 0 : dx, state.prep ? 0 : dy, dt, (station) => {
    useStation(state, station, state.fx);
  });
  void moving;

  // Interaction key.
  if ((pressed('e') || pressed(' ')) && !state.prep) {
    ensureAudio();
    const st = nearestStation(state.stations, state.cook, 215);
    if (st) useStation(state, st, state.fx);
  }

  // Mouse clicks.
  const click = input.consumeClick();
  if (click) {
    ensureAudio();
    if (state.prep) {
      // Clicks wait while chopping / frying.
    } else {
      const tickets = ticketRects(state);
      const ticket = tickets.find((t) => click.x >= t.x && click.x <= t.x + t.w && click.y >= t.y && click.y <= t.y + t.h);
      if (ticket) {
        serveTicket(state, ticket.order.id, state.fx);
      } else {
        const st = stationAt(state.stations, click.x, click.y);
        if (st) {
          const dist = Math.hypot(state.cook.x - st.approach.x, state.cook.y - st.approach.y);
          if (dist < 46) {
            useStation(state, st, state.fx);
          } else {
            state.cook.tx = st.approach.x;
            state.cook.ty = st.approach.y;
            state.cook.moving = true;
            state.cook.targetStation = st;
          }
        } else if (click.x > 316) {
          state.cook.tx = click.x;
          state.cook.ty = click.y;
          state.cook.moving = true;
          state.cook.targetStation = null;
        }
      }
    }
  }

  // Hover highlight.
  state.hoverStation = stationAt(state.stations, input.mouse.x, input.mouse.y);

  // Timers.
  if (state.banner) state.banner.age += dt;
  if (state.shake > 0) {
    state.shake -= dt;
    if (state.shake <= 0) state.ticketShake = null;
  }
  updateEffects(state.fx, dt);
}

function handleScreenKeys() {
  if (pressed('enter') && state.screen === 'title') {
    ensureAudio();
    startShift();
  }
  if (pressed('r') && (state.screen === 'results' || state.screen === 'title')) {
    ensureAudio();
    startShift();
  }
  if ((pressed('p') || pressed('escape')) && (state.screen === 'play' || state.screen === 'pause')) {
    state.screen = state.screen === 'play' ? 'pause' : 'play';
    sfx.click();
  }
  if (pressed('m')) {
    const muted = toggleMute();
    state.banner = { text: muted ? 'SUARA MATI' : 'SUARA HIDUP', age: 0, life: 1.0 };
  }
}

function handleScreenClicks() {
  const click = input.consumeClick();
  if (!click) return;
  ensureAudio();
  if (state.screen === 'title') {
    if (click.x >= 490 && click.x <= 790 && click.y >= 470 && click.y <= 538) startShift();
  } else if (state.screen === 'pause') {
    state.screen = 'play';
  } else if (state.screen === 'results') {
    if (click.x >= 490 && click.x <= 790 && click.y >= 450 && click.y <= 518) startShift();
  }
}

// Deterministic staged scenes for screenshots: the same rendering code,
// with a fixed mid-game state, so the cover shows the whole game at once.
function applyShotStaging(mode) {
  if (!mode) return;
  startShift();
  const byId = (id) => state.stations.find((s) => s.id === id);
  void byId;
  if (mode === 'title') {
    state = freshState();
    return;
  }
  if (mode === 'results') {
    state.coins = 186;
    state.served = 8;
    state.failed = 1;
    state.bestCombo = 4;
    state.shiftLeft = 0;
    state.screen = 'results';
    return;
  }
  const mk = (recipeId, customer, patience, maxPatience) => {
    const o = makeOrder(() => 0.5, state.elapsed, false);
    o.recipe = recipeById(recipeId);
    o.customer = customer;
    o.patience = patience;
    o.maxPatience = maxPatience;
    return o;
  };
  if (mode === 'cover') {
    state.elapsed = 54;
    state.shiftLeft = 96;
    state.coins = 84;
    state.served = 5;
    state.combo = 3;
    state.bestCombo = 3;
    state.orders = [
      mk('nasi-ayam', 'Bu Ratna', 38, 48),
      mk('mie-telur', 'Mas Joko', 26, 48),
      mk('sate-lontong', 'Mbak Sari', 13, 48),
    ];
    state.plate = ['nasi', 'ayam'];
    state.readyDish = recipeById('sate-lontong');
    state.readyFor = state.orders[2].id;
    state.cook.x = 762;
    state.cook.y = 480;
    state.cook.tx = 762;
    state.cook.ty = 480;
    state.cook.carry = [{ id: 'sambal', done: true, color: '#d32f2f', name: 'Sambal', prep: null }];
    state.banner = { text: 'SATE LONTONG KECAP SIAP DIANTAR!', age: 0.3, life: 1.6 };
  } else if (mode === 'play') {
    state.elapsed = 30;
    state.shiftLeft = 120;
    state.coins = 42;
    state.served = 2;
    state.orders = [mk('mie-telur', 'Pak Dedi', 30, 48), mk('nasi-telur', 'Neng Rina', 40, 48)];
    state.plate = ['mie'];
    state.cook.x = 462;
    state.cook.y = 470;
    state.cook.tx = 462;
    state.cook.ty = 470;
    state.cook.carry = [{ id: 'sayur', done: false, color: '#4caf50', name: 'Sayur', prep: 'potong' }];
    state.prep = {
      stationId: 'talenan', prep: 'potong', carryIndex: 0,
      item: state.cook.carry[0], t: 0.1, dur: 1.1, chopTick: 0,
    };
  } else if (mode === 'serve') {
    state.elapsed = 78;
    state.shiftLeft = 72;
    state.coins = 118;
    state.served = 6;
    state.combo = 2;
    state.orders = [mk('mie-telur', 'Kak Dewi', 24, 48), mk('nasi-ayam', 'Bang Udin', 36, 48)];
    state.readyDish = recipeById('mie-telur');
    state.readyFor = state.orders[0].id;
    state.cook.x = 1062;
    state.cook.y = 540;
    state.cook.tx = 1062;
    state.cook.ty = 540;
    state.banner = { text: 'MIE TELUR SAYUR SIAP DIANTAR!', age: 0.3, life: 1.6 };
  } else if (mode === 'rush') {
    state.elapsed = 128;
    state.shiftLeft = 22;
    state.coins = 152;
    state.served = 9;
    state.combo = 4;
    state.rushAnnounced = true;
    state.orders = [
      mk('sate-ayam', 'Om Bambang', 9, 34),
      mk('mie-ayam', 'Bu Ratna', 14, 34),
      mk('nasi-telur', 'Mas Joko', 20, 34),
    ];
    state.plate = ['sate'];
    state.cook.x = 1062;
    state.cook.y = 470;
    state.cook.tx = 1062;
    state.cook.ty = 470;
    state.cook.carry = [{ id: 'ayam', done: true, color: '#e8a34c', name: 'Ayam', prep: 'goreng' }];
    state.banner = { text: 'JAM RAMAI! PESANAN DATANG LEBIH CEPAT', age: 0.4, life: 2.0 };
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - (frame.last || now)) / 1000);
  frame.last = now;
  state.time += dt;

  if (state.screen === 'play') {
    handleScreenKeys();
    updatePlay(dt);
  } else {
    handleScreenKeys();
    handleScreenClicks();
    if (state.banner) state.banner.age += dt;
    updateEffects(state.fx, dt);
  }

  ctx.clearRect(0, 0, 1280, 800);
  if (state.screen === 'title') {
    drawTitleScreen(ctx, state.time);
  } else if (state.screen === 'results') {
    drawKitchen(ctx, state, state.time);
    drawHud(ctx, state, state.time);
    drawEffects(ctx, state.fx);
    drawResultsScreen(ctx, state);
  } else {
    drawKitchen(ctx, state, state.time);
    drawHud(ctx, state, state.time);
    drawEffects(ctx, state.fx);
    if (state.screen === 'pause') drawPauseScreen(ctx);
  }

  input.endFrame();
  requestAnimationFrame(frame);
}

// Boot: apply screenshot staging (?shot=...) before the first frame, then run.
const shotMode = new URLSearchParams(window.location.search).get('shot');
applyShotStaging(shotMode);

// Debug handle for local play-testing only: read-only state inspection.
window.__warung = {
  get state() { return state; },
  get stations() { return state.stations; },
  startShift,
  version: 'warung-senja-1',
};
requestAnimationFrame(frame);
