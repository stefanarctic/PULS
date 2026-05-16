/**
 * Lists unique formula explanation strings (UTF-8), sorted (ro).
 * Usage: node scripts/list-formula-unique-explanations.mjs
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
    for (const f of sec.formulas) {
      if (f.explanation) set.add(f.explanation);
    }
  }
}

const sorted = [...set].sort((a, b) => a.localeCompare(b, "ro"));
const out = join(dirname(fileURLToPath(import.meta.url)), "formula-unique-explanations.json");
writeFileSync(out, JSON.stringify(sorted, null, 2), "utf8");
console.log("Wrote", out, sorted.length);
