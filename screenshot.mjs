/**
 * One-shot screenshot helper. Writes PNGs to ./temporary screenshots/
 * using Chrome via Puppeteer from the global install under
 * C:/Users/Tryfonas/AppData/Local/Temp/puppeteer-test/.
 *
 *   node screenshot.mjs <url> [label]
 *
 * Auto-increments N so consecutive runs never overwrite each other.
 */

import { createRequire } from "node:module";
import { promises as fs } from "node:fs";
import path from "node:path";

const PUPPETEER_ROOT =
  "C:/Users/Tryfonas/AppData/Local/Temp/puppeteer-test";
const require = createRequire(PUPPETEER_ROOT + "/package.json");
const puppeteer = require("puppeteer");

const [, , url, label] = process.argv;
if (!url) {
  console.error("usage: node screenshot.mjs <url> [label]");
  process.exit(1);
}

const outDir = path.resolve("./temporary screenshots");
await fs.mkdir(outDir, { recursive: true });
const existing = await fs.readdir(outDir);
const next =
  existing
    .map((f) => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || "0", 10))
    .reduce((a, b) => Math.max(a, b), 0) + 1;

const name = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;
const fullPath = path.join(outDir, name);

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
// Small wait so fade-in animations settle.
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: fullPath, fullPage: true });
await browser.close();
console.log(`saved ${fullPath}`);
