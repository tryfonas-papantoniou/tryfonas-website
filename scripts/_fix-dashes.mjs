// One-off: normalize em-dashes and repair a botched earlier pass.
// Walks the usual source dirs + data/corpus + rag-index.json.
//
// Rules:
//   1.  "X - Y"   (space + em-dash + space)    -> "X - Y"
//   2.  "X-Y"     (em-dash with no spaces)     -> "X-Y"
//   3.  Repair leftovers from a previous broken pass that stripped
//       the trailing space, producing "X -Y" where a dash is
//       adjacent to a word that originally had a space. We look
//       for the specific pattern of a single hyphen with a space
//       only before it and then a letter immediately after
//       (outside of common compounds like "a -b flag").
//
// Scope list is explicit so we never touch node_modules or .next.
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(".");
const TARGET_DIRS = ["src", "scripts", "data/corpus"];
const EXTRA_FILES = ["public/rag-index.json"];

// Files whose trailing space got stripped by the earlier pass.
// We need a broader repair only on these.
const NEEDS_REPAIR = new Set([
  "src/app/not-found.js",
  "src/app/layout.js",
  "src/app/globals.css",
].map((p) => path.resolve(p)));

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

function normalize(content, repair = false) {
  let out = content;
  // 1. " - " -> " - "
  out = out.replaceAll(" \u2014 ", " - ");
  // 2. any leftover em-dash -> hyphen (covers "X-Y" or start/end of line)
  out = out.replaceAll("\u2014", "-");
  // 3. Repair pass for files touched earlier: a space-hyphen glued to
  //    a letter followed later by a word is almost certainly a
  //    stripped em-dash boundary. Be narrow: require "space, hyphen,
  //    a-z/A-Z" AND that the preceding word ends in a letter (i.e.
  //    we're in prose, not "--flag").
  if (repair) {
    out = out.replace(/([A-Za-z]) -([A-Za-z])/g, "$1 - $2");
  }
  return out;
}

let changed = 0;
let scanned = 0;

async function processFile(abs) {
  scanned++;
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  const buf = await readFile(abs, "utf8");
  const next = normalize(buf, NEEDS_REPAIR.has(abs));
  if (next !== buf) {
    await writeFile(abs, next, "utf8");
    changed++;
    console.log("fixed", rel);
  }
}

for (const d of TARGET_DIRS) {
  const abs = path.resolve(d);
  const files = await walk(abs);
  for (const f of files) {
    if (/\.(js|mjs|ts|tsx|jsx|css|md|json)$/i.test(f)) {
      await processFile(f);
    }
  }
}
for (const f of EXTRA_FILES) {
  await processFile(path.resolve(f));
}

console.log(`\nscanned ${scanned}, changed ${changed}`);
