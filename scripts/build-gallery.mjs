#!/usr/bin/env node
// scripts/build-gallery.mjs
//
// Reads every PNG in public/gallery/ and writes data/gallery.json.
// Preserves any hand-written entries (matched by "file") — those keep their
// title, note, etc. Everything else is auto-generated from the filename.
//
// Run from the repo root:
//   node scripts/build-gallery.mjs
//
// Filename conventions understood:
//   <A>_x_<B>_m0.XX_s42_<palette>...png            = Method 1
//   <A>_ft_<B>_m0.XX_s42_<palette>...png           = Method 2
//   m3_<A>_x_<B>_m0.XX_s42_<palette>...png         = Method 3
// Also tolerates underscores instead of dots in m values (Mac-copy artefact).

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const IMG_DIR = join(ROOT, "public", "gallery");
const MANIFEST = join(ROOT, "data", "gallery.json");

// ----- filename decoding ------------------------------------------------
function decode(filename) {
  const base = filename.replace(/\.png$/i, "");
  const m3 = base.startsWith("m3_");
  const stripped = m3 ? base.slice(3) : base;

  const isFT = /_ft_/.test(stripped);
  const joiner = isFT ? "_ft_" : "_x_";

  const beforeM = stripped.split(/_m0[._]\d+/)[0];
  const parts = beforeM.split(joiner);
  if (parts.length < 2) return null;
  const A = parts[0];
  const B = parts.slice(1).join(joiner);

  const mMatch = stripped.match(/_m0[._](\d+)_/);
  if (!mMatch) return null;
  const m = parseFloat("0." + mMatch[1]);

  let method, glyph;
  if (isFT)      { method = "fine-tuning interpolation"; glyph = "→"; }
  else if (m3)   { method = "weight interpolation";      glyph = "×"; }
  else           { method = "multi-target training";     glyph = "×"; }

  return {
    file: filename,
    parents: `${A} ${glyph} ${B}`,
    method,
    m,
  };
}

// ----- main -------------------------------------------------------------
if (!existsSync(IMG_DIR)) {
  console.error(`Missing directory: ${IMG_DIR}`);
  process.exit(1);
}

const files = readdirSync(IMG_DIR)
  .filter((f) => /\.png$/i.test(f))
  .sort();

let existing = {};
if (existsSync(MANIFEST)) {
  try {
    const raw = JSON.parse(readFileSync(MANIFEST, "utf8"));
    for (const entry of raw) existing[entry.file] = entry;
  } catch (e) {
    console.warn(`Could not parse existing ${MANIFEST}, ignoring:`, e.message);
  }
}

const entries = [];
const skipped = [];
for (const file of files) {
  const decoded = decode(file);
  if (!decoded) { skipped.push(file); continue; }
  const prior = existing[file] ?? {};
  entries.push({
    file: decoded.file,
    title: prior.title ?? "",
    parents: prior.parents ?? decoded.parents,
    method:  prior.method  ?? decoded.method,
    m:       prior.m       ?? decoded.m,
    ...(prior.note ? { note: prior.note } : {}),
  });
}

function shuffle(arr, seed = 42) {
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
shuffle(entries);

writeFileSync(MANIFEST, JSON.stringify(entries, null, 2) + "\n", "utf8");
console.log(`Wrote ${entries.length} entries to ${MANIFEST}`);
if (skipped.length) {
  console.warn(`\nSkipped ${skipped.length} file(s) whose filenames did not decode:`);
  for (const f of skipped) console.warn(`  ${f}`);
}