import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const url = "https://simulator-motoare.vercel.app";
const out = path.join(ROOT, "public/res/screenshots/Motoare_Ardere_Interna_Screenshot.png");

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
await new Promise((r) => setTimeout(r, 4000));
const buf = await page.screenshot({ type: "png", fullPage: false });
writeFileSync(out, buf);
await browser.close();
console.log("Saved", out);
