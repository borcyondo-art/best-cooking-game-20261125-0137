// SPDX-License-Identifier: MIT
// main.ts — Warung Senja hand-in program (Node 22, standard library only).
// Copies game/ and screenshots/ into the output directory and writes the
// dossier with buildDossier from vendor/makefun-game.ts. Running it twice
// writes the same bytes both times: plain recursive copies, no timestamps.

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(resolve(repoRoot, 'game'), resolve(outDir, 'game'), { recursive: true });
cpSync(resolve(repoRoot, 'screenshots'), resolve(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(resolve(outDir, 'dossier.json'), dossier);
