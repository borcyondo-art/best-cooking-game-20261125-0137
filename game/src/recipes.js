// recipes.js — data for Warung Senja: every ingredient and every dish.
// No code from any other game lives here; names and dishes are original.

export const INGREDIENTS = [
  { id: 'nasi',   name: 'Nasi',    prep: null,     color: '#fff6dd', accent: '#e8d9a8' },
  { id: 'ayam',   name: 'Ayam',    prep: 'goreng', color: '#e8a34c', accent: '#b96f1e' },
  { id: 'mie',    name: 'Mie',     prep: null,     color: '#f7c948', accent: '#d99a1f' },
  { id: 'telur',  name: 'Telur',   prep: 'goreng', color: '#fdfdfd', accent: '#f2b705' },
  { id: 'sayur',  name: 'Sayur',   prep: 'potong', color: '#4caf50', accent: '#2e7d32' },
  { id: 'sambal', name: 'Sambal',  prep: null,     color: '#d32f2f', accent: '#8e1414' },
  { id: 'sate',   name: 'Sate',    prep: 'goreng', color: '#a5673f', accent: '#6d3b1d' },
  { id: 'lontong',name: 'Lontong', prep: null,     color: '#f3ead2', accent: '#cbb98f' },
  { id: 'kecap',  name: 'Kecap',   prep: null,     color: '#3b2314', accent: '#120a05' },
];

export const RECIPES = [
  { id: 'nasi-ayam',  name: 'Nasi Ayam Sambal',  items: ['nasi', 'ayam', 'sambal'],            price: 30 },
  { id: 'mie-telur',  name: 'Mie Telur Sayur',   items: ['mie', 'telur', 'sayur'],             price: 32 },
  { id: 'sate-lontong', name: 'Sate Lontong Kecap', items: ['sate', 'lontong', 'kecap'],       price: 34 },
  { id: 'nasi-telur', name: 'Nasi Telur Sambal', items: ['nasi', 'telur', 'sambal'],           price: 28 },
  { id: 'mie-ayam',   name: 'Mie Ayam Sayur',    items: ['mie', 'ayam', 'sayur'],              price: 32 },
  { id: 'sate-ayam',  name: 'Sate Ayam Kecap',   items: ['sate', 'ayam', 'kecap', 'sayur'],    price: 40 },
];

export const CUSTOMERS = ['Bu Ratna', 'Pak Dedi', 'Mbak Sari', 'Mas Joko', 'Neng Rina', 'Bang Udin', 'Kak Dewi', 'Om Bambang'];

export function ingredientById(id) {
  return INGREDIENTS.find((g) => g.id === id);
}

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

export function prepLabel(prep) {
  if (prep === 'potong') return 'POTONG';
  if (prep === 'goreng') return 'GORENG';
  return 'SIAP';
}

export function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export function randomRecipe(rng) {
  return RECIPES[Math.floor(rng() * RECIPES.length)];
}
