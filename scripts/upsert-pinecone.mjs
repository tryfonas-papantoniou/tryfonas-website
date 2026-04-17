/**
 * Upsert the already-built rag-index.json into Pinecone.
 *
 * Run this whenever you change Pinecone credentials, switch the
 * index, or want to re-populate after rebuilding the JSON index.
 * Cheap — no Voyage calls, no rebuild.
 *
 *   node scripts/upsert-pinecone.mjs
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

try {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
} catch {
  // optional
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(ROOT, "public", "rag-index.json");

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX;

if (!PINECONE_API_KEY || !PINECONE_INDEX) {
  console.error(
    "PINECONE_API_KEY and PINECONE_INDEX must be set in .env.local"
  );
  process.exit(1);
}

const { Pinecone } = await import("@pinecone-database/pinecone");

async function main() {
  const raw = await fs.readFile(INDEX_PATH, "utf8");
  const { chunks } = JSON.parse(raw);
  console.log(`loaded ${chunks.length} chunks from ${INDEX_PATH}`);

  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(PINECONE_INDEX);

  const batchSize = 100;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const slice = chunks.slice(i, i + batchSize);
    const records = slice.map((c) => ({
      id: c.id,
      values: c.embedding,
      metadata: {
        docId: c.docId,
        docTitle: c.docTitle,
        text: c.text.slice(0, 2000),
      },
    }));
    console.log(`  upserting ${i + 1}–${i + slice.length}`);
    await index.upsert({ records });
  }

  console.log(`done — ${chunks.length} vectors upserted to ${PINECONE_INDEX}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
