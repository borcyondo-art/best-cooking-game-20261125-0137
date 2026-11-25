# Warung Senja — Make the Best Cooking Game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/borcyondo-art/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/borcyondo-art/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original 2D cooking game that runs offline in a desktop browser
from static files. You are the cook at **Warung Senja**, a night-market
kitchen: take orders from the order board, fetch ingredients from the
counters, chop and fry what needs it, assemble each dish on the plate, and
serve it at the serving window before the customer's patience runs out.

## How to play

Serve the game folder with any static server (for example
`python3 -m http.server` inside `game/`) and open `index.html` in desktop
Chrome. No network, no build step, all art drawn in code and all sound
generated with WebAudio.

- **Move:** WASD / arrow keys, or click anywhere on the kitchen floor.
- **Use a station:** click the station (the cook walks over and uses it),
  or walk close and press **E** / **Space**.
- **Flow:** pick an ingredient from the top counters → chop it at the
  **Talenan** or fry it at the **Wajan** when its label says so → add it to
  the **Meja Racik** plate → when the plate matches an order, the finished
  dish appears at the **Jendela Saji** → click the matching order ticket
  (or the window) to serve it.
- **Trash:** the **Sampah** bin empties what you are carrying. Clicking the
  plate with empty hands clears the current assembly.
- **Pause:** P / Esc. **Restart:** R on the results screen. **Mute:** M.

## The shift

- Orders arrive on the board (up to 3), each with a patience bar and a
  recipe of 2–4 ingredients. Six original recipes combine the nine
  ingredients in different ways.
- Serving earns coins plus a combo bonus for serving in a streak and a
  bonus for fast service. A failed order costs one heart; three failed
  orders close the kitchen early.
- The shift lasts 2½ minutes. The last 30 seconds are the **Jam Ramai**
  rush: orders arrive faster with shorter patience.
- Finish the shift to see your score, dishes served, best combo and a
  1–3 star rating, then restart for another shift.

## Layout

- `game/index.html` — page shell, loads the game.
- `game/style.css` — page styling.
- `game/src/main.js` — boot, game loop, screens, shift state machine.
- `game/src/recipes.js` — ingredients, recipes, customers, set matching.
- `game/src/orders.js` — order spawning, patience, rewards.
- `game/src/kitchen.js` — station layout and what each station does.
- `game/src/kitchen-render.js` — the kitchen and every food icon, drawn in code.
- `game/src/cook.js` — cook movement and the drawn chef.
- `game/src/hud.js` — top bar, order board, tray bar, title/pause/results.
- `game/src/input.js` — keyboard and mouse state.
- `game/src/audio.js` — WebAudio sound effects, generated in code.
- `game/src/particles.js` — floating texts, steam and sparkles.
- `main.ts` — hand-in program: copies `game/` and `screenshots/` to
  `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json`.
- `vendor/makefun-game.ts` — make.fun's dossier library, copied unchanged
  from the competition kit.
- `screenshots/` — real renders of this game's own code in a desktop browser.

## License

MIT — see `LICENSE`.
