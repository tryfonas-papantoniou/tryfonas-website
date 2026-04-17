/**
 * Small env helper that guarantees `.env.local` wins over an
 * inherited empty shell variable.
 *
 * Why this exists: Claude Code and some IDEs export
 * `ANTHROPIC_API_KEY=""` into every shell they spawn for safety.
 * Next.js's env precedence rules let an inherited process.env
 * value (even an empty string) override `.env.local`, so the key
 * we actually want to use never gets seen by the API route.
 *
 * The fix: at module load we parse `.env.local` directly and fill
 * in anything that is currently empty or missing. Production on
 * Vercel doesn't ship `.env.local`, so this code path is a no-op
 * there — the real env is already populated by the platform.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

let loaded = false;

function parse(raw) {
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function ensureEnvLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const filePath = path.join(process.cwd(), ".env.local");
    const raw = readFileSync(filePath, "utf8");
    const parsed = parse(raw);
    for (const [key, value] of Object.entries(parsed)) {
      // Only fill in keys that are missing or empty — do NOT
      // overwrite a value that was deliberately set by the platform.
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local is optional — production environments inject the
    // keys some other way.
  }
}
