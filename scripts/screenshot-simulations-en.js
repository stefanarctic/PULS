/**
 * Screenshot-uri EN pentru toate simulările din pagina /simulations (rute /en/simulation/...).
 * Folosește același layout ca utilizatorul englez: SimulationPage + iframe cu ?lang=en unde e cazul.
 *
 * Rezultat: PNG-uri în public/res/screenshots/en/ (ex. Simplu_Screenshot_en.png),
 * separate de capturile RO din public/res/screenshots/.
 *
 * Cerințe:
 *   1. Pornește aplicația: npm run dev   (implicit port 8000 din vite.config)
 *   2. Într-un alt terminal: npm run screenshot-simulations-en
 *
 * Variabile de mediu:
 *   BASE_URL=http://localhost:8000   (implicit)
 *   WAIT_AFTER_MS=4000               așteptare după load (implicit 3500)
 *   ONLY_SLUG=pendul-simplu          doar un slug (debug)
 */

import puppeteer from "puppeteer";
import { mkdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SIMULATIONS_PATH = path.join(ROOT, "src", "data", "simulations.js");
const SITE_EN_PATH = path.join(ROOT, "public", "translations", "site.en.json");
const SCREENSHOTS_EN_DIR = path.join(ROOT, "public", "res", "screenshots", "en");

const BASE_URL = (process.env.BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const WAIT_AFTER_LOAD_MS = Number(process.env.WAIT_AFTER_MS || 3500);
const ONLY_SLUG = process.env.ONLY_SLUG?.trim() || null;

const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1 };

/** RO slug -> nume fișier ca în screenshot-simulations.js */
function slugToFilename(slug) {
  const parts = slug.replace(/-/g, "_").split("_");
  const titleCase = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("_");
  return `${titleCase}_Screenshot_en.png`;
}

function loadPathMap() {
  const raw = readFileSync(SITE_EN_PATH, "utf-8");
  const data = JSON.parse(raw);
  const pathMap = data?.routing?.pathMap;
  if (!pathMap || typeof pathMap !== "object") {
    throw new Error("site.en.json lipsește routing.pathMap");
  }
  return pathMap;
}

/** Extrage toate simulările: id, slug, route RO, iframeSrc (pentru debug). */
function getSimulationsFromSource() {
  const content = readFileSync(SIMULATIONS_PATH, "utf-8");
  const configMatch = content.match(/export const simulationsConfig = \[([\s\S]*)\];/);
  if (!configMatch) throw new Error("Nu s-a găsit simulationsConfig în simulations.js");

  const blockRegex =
    /\{\s*id:\s*(\d+),[\s\S]*?slug:\s*"([^"]+)"[\s\S]*?route:\s*"([^"]+)"[\s\S]*?iframeSrc:\s*"([^"]*)"/g;
  const simulations = [];
  let m;
  while ((m = blockRegex.exec(configMatch[1])) !== null) {
    simulations.push({
      id: parseInt(m[1], 10),
      slug: m[2],
      route: m[3],
      iframeSrc: m[4],
    });
  }
  return simulations;
}

function buildEnglishPageUrl(pathMap, route) {
  const enPath = pathMap[route];
  if (!enPath) {
    throw new Error(`Nu există mapare EN în site.en.json pentru route: ${route}`);
  }
  return `${BASE_URL}/en${enPath}`;
}

async function screenshotIframe(page, filepath) {
  const frame = await page.waitForSelector(".simulation-frame iframe", {
    visible: true,
    timeout: 90000,
  });
  await new Promise((r) => setTimeout(r, WAIT_AFTER_LOAD_MS));
  await frame.screenshot({ path: filepath, type: "png" });
}

async function screenshotFallbackPage(page, filepath) {
  await new Promise((r) => setTimeout(r, WAIT_AFTER_LOAD_MS));
  await page.screenshot({ path: filepath, type: "png", fullPage: false });
}

async function main() {
  const pathMap = loadPathMap();
  let simulations = getSimulationsFromSource();
  if (ONLY_SLUG) {
    simulations = simulations.filter((s) => s.slug === ONLY_SLUG);
    if (simulations.length === 0) {
      console.error(`Nu s-a găsit slug-ul: ${ONLY_SLUG}`);
      process.exit(1);
    }
  }

  mkdirSync(SCREENSHOTS_EN_DIR, { recursive: true });

  console.log(
    `Captură EN pentru ${simulations.length} simulări → ${path.relative(ROOT, SCREENSHOTS_EN_DIR)}/\n` +
      `BASE_URL=${BASE_URL}  WAIT_AFTER_MS=${WAIT_AFTER_LOAD_MS}\n`
  );

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const ok = [];
  const failed = [];

  for (const sim of simulations) {
    const filename = slugToFilename(sim.slug);
    const filepath = path.join(SCREENSHOTS_EN_DIR, filename);
    let url;
    try {
      url = buildEnglishPageUrl(pathMap, sim.route);
    } catch (e) {
      console.error(`  [${sim.id}] ${sim.slug} — ${e.message}`);
      failed.push({ sim, error: e.message });
      continue;
    }

    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
      try {
        await screenshotIframe(page, filepath);
      } catch {
        console.warn(`  [${sim.id}] ${sim.slug} — cadru iframe indisponibil, fallback la viewport`);
        await screenshotFallbackPage(page, filepath);
      }
      console.log(`  [${sim.id}] ${sim.slug} → en/${filename}`);
      ok.push(sim.id);
    } catch (err) {
      console.error(`  [${sim.id}] ${sim.slug} EROARE:`, err.message);
      failed.push({ sim, url, error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log(`\nGata: ${ok.length}/${simulations.length} reușite.`);
  if (failed.length) {
    console.log(`Eșuate (${failed.length}):`);
    failed.forEach((f) => console.log(`  - ${f.sim.slug}: ${f.error}${f.url ? ` (${f.url})` : ""}`));
    process.exitCode = 1;
  }

  console.log(
    "\nNotă: imaginile sunt în public/res/screenshots/en/. Pentru a le folosi pe siteul EN,\n" +
      "poți importa condiționat după limbă sau actualiza cardurile din Simulari."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
