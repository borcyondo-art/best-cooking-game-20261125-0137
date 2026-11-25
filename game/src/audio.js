// audio.js — tiny WebAudio bleeps, generated in code. No audio files, no network.

let ctx = null;
let muted = false;

export function ensureAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  } catch (_err) {
    ctx = null;
  }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freq, dur, type, vol, slideTo) {
  if (!ctx || muted) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    gain.gain.setValueAtTime(vol || 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  } catch (_err) { /* sound is decoration; never break the game */ }
}

function noiseBurst(dur, vol) {
  if (!ctx || muted) return;
  try {
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = vol || 0.08;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3200;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
  } catch (_err) { /* ignore */ }
}

export const sfx = {
  click() { tone(660, 0.07, 'triangle', 0.1); },
  pickup() { tone(520, 0.09, 'sine', 0.13, 880); },
  chop() { noiseBurst(0.07, 0.14); tone(190, 0.07, 'square', 0.06); },
  sizzle() { noiseBurst(0.22, 0.07); },
  plating() { tone(740, 0.1, 'triangle', 0.13); tone(980, 0.12, 'triangle', 0.1); },
  ready() { tone(660, 0.1, 'triangle', 0.13); setTimeout(() => tone(880, 0.14, 'triangle', 0.13), 90); setTimeout(() => tone(1180, 0.18, 'triangle', 0.12), 180); },
  serve() { tone(880, 0.1, 'sine', 0.14); setTimeout(() => tone(1108, 0.16, 'sine', 0.13), 90); },
  fail() { tone(220, 0.22, 'sawtooth', 0.09, 130); },
  reject() { tone(180, 0.12, 'square', 0.08); },
  start() { tone(523, 0.1, 'triangle', 0.12); setTimeout(() => tone(659, 0.1, 'triangle', 0.12), 100); setTimeout(() => tone(784, 0.16, 'triangle', 0.12), 200); },
  rush() { tone(392, 0.12, 'triangle', 0.12); setTimeout(() => tone(523, 0.16, 'triangle', 0.12), 120); },
};
