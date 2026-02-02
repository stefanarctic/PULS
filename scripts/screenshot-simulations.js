/**
 * Script pentru screenshot-uri la simulările 15+ din simulations.js.
 * Deschide iframeSrc-ul fiecărei simulări, face screenshot, salvează în public/res/screenshots
 * și actualizează src/data/simulations.js cu importurile și referințele la imagini.
 *
 * Utilizare:
 *   1. Pornește dev server: npm run dev
 *   2. În alt terminal: node scripts/screenshot-simulations.js
 *
 * Opțional: BASE_URL=http://localhost:8000 node scripts/screenshot-simulations.js
 */

import puppeteer from "puppeteer";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SIMULATIONS_PATH = path.join(ROOT, "src", "data", "simulations.js");
const SCREENSHOTS_DIR = path.join(ROOT, "public", "res", "screenshots");

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const VIEWPORT = { width: 1280, height: 720 };
const WAIT_AFTER_LOAD_MS = 2000;

/** Slug -> nume fișier: "circuite-electricitate" -> "Circuite_Electricitate_Screenshot.png" */
function slugToFilename(slug) {
  const parts = slug.replace(/-/g, "_").split("_");
  const titleCase = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("_");
  return `${titleCase}_Screenshot.png`;
}

/** Slug -> nume variabilă import: "circuite-electricitate" -> "circuiteElectricitateImg" */
function slugToImportName(slug) {
  const parts = slug.replace(/-/g, "_").split("_");
  const camel =
    parts[0].toLowerCase() +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join("");
  return `${camel}Img`;
}

/** Extrage simulările cu id >= 15 din sursa simulations.js (parsare simplă). */
function getSimulationsFromSource() {
  const content = readFileSync(SIMULATIONS_PATH, "utf-8");
  const simulations = [];
  const configMatch = content.match(/export const simulationsConfig = \[([\s\S]*)\];/);
  if (!configMatch) throw new Error("Nu s-a găsit simulationsConfig în simulations.js");

  const blockRegex = /\{\s*id:\s*(\d+),[\s\S]*?slug:\s*"([^"]+)"[\s\S]*?image:\s*(\w+)[\s\S]*?iframeSrc:\s*"([^"]+)"/g;
  let m;
  while ((m = blockRegex.exec(configMatch[1])) !== null) {
    const id = parseInt(m[1], 10);
    if (id >= 15) {
      simulations.push({
        id,
        slug: m[2],
        iframeSrc: m[4],
        currentImageRef: m[3],
      });
    }
  }
  return simulations;
}

async function takeScreenshots() {
  const simulations = getSimulationsFromSource();
  if (simulations.length === 0) {
    console.log("Nicio simulare cu id >= 15 găsită.");
    return;
  }

  console.log(`Se fac screenshot-uri pentru ${simulations.length} simulări (id 15+). Base URL: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];
  for (const sim of simulations) {
    const url = BASE_URL + sim.iframeSrc;
    const filename = slugToFilename(sim.slug);
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    const importName = slugToImportName(sim.slug);

    try {
      const page = await browser.newPage();
      await page.setViewport(VIEWPORT);
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      await new Promise((r) => setTimeout(r, WAIT_AFTER_LOAD_MS));
      await page.screenshot({ path: filepath, type: "png" });
      await page.close();
      console.log(`  [${sim.id}] ${sim.slug} -> ${filename}`);
      results.push({
        id: sim.id,
        slug: sim.slug,
        filename,
        importName,
        currentImageRef: sim.currentImageRef,
      });
    } catch (err) {
      console.error(`  [${sim.id}] ${sim.slug} EROARE:`, err.message);
    }
  }

  await browser.close();

  if (results.length > 0) {
    updateSimulationsJs(results);
  }
}

/** Actualizează simulations.js: adaugă importuri noi și înlocuiește image: pentru id 15+. */
function updateSimulationsJs(results) {
  let content = readFileSync(SIMULATIONS_PATH, "utf-8");

  // Adaugă noile importuri după ultimul import existent
  const lastImport = content.lastIndexOf('from "/res/screenshots/');
  const endOfLastImport = content.indexOf(";", lastImport) + 1;
  const beforeImports = content.slice(0, endOfLastImport + 1);
  const afterImports = content.slice(endOfLastImport + 1);

  const newImportLines = results
    .map(
      (r) =>
        `import ${r.importName} from "/res/screenshots/${r.filename}";`
    )
    .join("\n");

  content =
    beforeImports +
    "\n" +
    newImportLines +
    "\n" +
    afterImports.trimStart();

  // Înlocuiește image: currentRef cu image: importName pentru fiecare id
  for (const r of results) {
    const blockRegex = new RegExp(
      `(id:\\s*${r.id},[\\s\\S]*?image:\\s*)${escapeRegex(r.currentImageRef)}(,)`,
      "g"
    );
    content = content.replace(blockRegex, `$1${r.importName}$2`);
  }

  writeFileSync(SIMULATIONS_PATH, content, "utf-8");
  console.log("\nActualizat src/data/simulations.js cu noile importuri și referințe image.");
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

takeScreenshots().catch((err) => {
  console.error("Eroare:", err);
  process.exit(1);
});
