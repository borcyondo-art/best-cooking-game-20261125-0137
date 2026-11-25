// orders.js — customer orders: spawning, patience, matching and serving.

import { CUSTOMERS, randomRecipe, sameSet } from './recipes.js';

let nextOrderId = 1;

export function makeOrder(rng, elapsed, rush) {
  const recipe = randomRecipe(rng);
  const base = rush ? 34 : 48;
  const maxPatience = Math.max(26, base - elapsed * 0.06);
  return {
    id: nextOrderId++,
    recipe,
    customer: CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)],
    patience: maxPatience,
    maxPatience,
    bornAt: elapsed,
    wobble: rng() * Math.PI * 2,
  };
}

export function spawnInterval(elapsed, rush) {
  if (rush) return Math.max(7, 10 - elapsed * 0.01);
  return Math.max(9, 15 - elapsed * 0.035);
}

export function findMatchingOrder(plateItems, orders) {
  return orders.find((o) => sameSet(plateItems, o.recipe.items)) || null;
}

export function orderReward(order, combo) {
  const base = order.recipe.price;
  const comboBonus = Math.min(combo, 5) * 4;
  const patienceBonus = order.patience > order.maxPatience * 0.5 ? 6 : 0;
  return base + comboBonus + patienceBonus;
}

export function resetOrderIds() {
  nextOrderId = 1;
}
