/**
 * Translates scripts/formula-unique-explanations.json (RO) to
 * scripts/formula-en-explanations.txt (EN) using google-translate-api-x.
 * Run: node scripts/translate-formula-explanations.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import translate from "google-translate-api-x";

const __dir = dirname(fileURLToPath(import.meta.url));
const inPath = join(__dir, "formula-unique-explanations.json");
const outPath = join(__dir, "formula-en-explanations.txt");

const ro = JSON.parse(readFileSync(inPath, "utf8"));
const en = [];
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

for (let i = 0; i < ro.length; i++) {
  const text = ro[i];
  try {
    const res = await translate(text, { from: "ro", to: "en" });
    en.push(res.text);
    if ((i + 1) % 25 === 0) {
      console.log(`Translated ${i + 1}/${ro.length}`);
    }
  } catch (e) {
    console.error(`Fail at index ${i}:`, e.message);
    en.push(text);
  }
  await delay(200);
}

writeFileSync(outPath, en.join("\n"), "utf8");
console.log("Wrote", outPath, en.length, "lines");
