/**
 * Lists unique section headings and formula titles from resurseFormulasRo.js (UTF-8).
 * Usage: node scripts/list-formula-unique-strings.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as RO from "../src/data/resurseFormulasRo.js";

const set = new Set();
for (const k of Object.keys(RO)) {
  const arr = RO[k];
  if (!Array.isArray(arr)) continue;
  for (const sec of arr) {
    set.add(sec.section);
    for (const f of sec.formulas) set.add(f.title);
  }
}

const sorted = [...set].sort((a, b) => a.localeCompare(b, "ro"));
const out = join(dirname(fileURLToPath(import.meta.url)), "formula-unique-utf8.json");
writeFileSync(out, JSON.stringify(sorted, null, 2), "utf8");
console.log("Wrote", out, sorted.length);
