/**
 * Build the RAG index.
 *
 * Reads every markdown file in data/corpus, chunks each document,
 * sends the chunks to Voyage for embeddings, and writes the result
 * to public/rag-index.json. If Pinecone credentials are present,
 * also upserts the vectors to the configured index so the
 * /api/rag?backend=pinecone path has data to query.
 *
 * The JSON file is loaded at request time by the in-memory retriever
 * and is intentionally small — 12 docs × ~6 chunks × 1024 floats at
 * 4 bytes each is roughly 300 KB after JSON overhead. That sits
 * comfortably in Node's memory on a Vercel serverless function.
 *
 * Run locally: `node scripts/build-rag-index.mjs`
 * Runs in CI:  attached to the `prebuild` npm script.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env.local in dev. Vercel already injects env vars in CI.
try {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
} catch {
  // dotenv is optional — not installed in CI, not required on Vercel.
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CORPUS_DIR = path.join(ROOT, "data", "corpus");
const OUT_PATH = path.join(ROOT, "public", "rag-index.json");

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_MODEL = "voyage-3";
const EMBEDDING_DIM = 1024;

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX;

if (!VOYAGE_API_KEY) {
  console.error(
    "VOYAGE_API_KEY is not set. Add it to .env.local or the Vercel env."
  );
  process.exit(1);
}

/* --------------------------------- parse --------------------------------- */

/**
 * Parse YAML-ish frontmatter (id/title/owner/version) from the top of
 * a markdown file. We only support string values on single lines —
 * nothing fancy, the corpus is hand-authored and stable.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+)\s*:\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return { meta, body: raw.slice(match[0].length) };
}

/* --------------------------------- chunk --------------------------------- */

/**
 * Chunk a document into ~500-token pieces with a small overlap at
 * chunk boundaries. The splitter is heading-aware: it prefers to
 * break at markdown `## ` headings so every chunk is a coherent
 * section, falling back to paragraph-level splits when a section
 * runs past the target size.
 *
 * Rough token budget: 1 token ≈ 4 characters for English prose, so
 * 2000 chars ≈ 500 tokens. Voyage-3 caps at 32k tokens per item and
 * 128 items per request; we stay well under both.
 */
function chunkDocument(body, { targetChars = 2000, overlapChars = 200 } = {}) {
  // Split on headings (## or ###) but keep the heading with the section.
  const sections = [];
  const lines = body.split(/\r?\n/);
  let current = [];
  for (const line of lines) {
    if (/^#{2,3}\s/.test(line) && current.length) {
      sections.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length) sections.push(current.join("\n"));

  // Now pack sections into chunks. A section longer than target is
  // split by paragraph; contiguous short sections are merged.
  const chunks = [];
  let buf = "";
  for (const section of sections) {
    if (section.length > targetChars) {
      if (buf) {
        chunks.push(buf);
        buf = "";
      }
      // Split long section by double newline (paragraphs).
      const paras = section.split(/\n\s*\n/);
      let inner = "";
      for (const p of paras) {
        if ((inner + "\n\n" + p).length > targetChars && inner) {
          chunks.push(inner.trim());
          // carry an overlap from the tail of the previous chunk
          inner = inner.slice(-overlapChars) + "\n\n" + p;
        } else {
          inner = inner ? inner + "\n\n" + p : p;
        }
      }
      if (inner.trim()) chunks.push(inner.trim());
    } else if ((buf + "\n\n" + section).length > targetChars && buf) {
      chunks.push(buf.trim());
      buf = section;
    } else {
      buf = buf ? buf + "\n\n" + section : section;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

/* --------------------------------- embed --------------------------------- */

/**
 * Call Voyage's embeddings endpoint with automatic retry on 429.
 * Voyage free-tier caps at 3 RPM and 10K TPM, so we batch small
 * and back off aggressively when rate-limited. Paid tiers do not
 * hit the backoff path at all.
 */
async function embedBatch(texts, inputType = "document", attempt = 1) {
  const resp = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: VOYAGE_MODEL,
      input_type: inputType,
    }),
  });
  if (resp.status === 429 && attempt <= 4) {
    const wait = 25000; // 25s — safely past the 20s free-tier window
    console.log(`  rate-limited (429), waiting ${wait / 1000}s (attempt ${attempt})…`);
    await new Promise((r) => setTimeout(r, wait));
    return embedBatch(texts, inputType, attempt + 1);
  }
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Voyage error ${resp.status}: ${err}`);
  }
  const json = await resp.json();
  return json.data.map((d) => d.embedding);
}

async function embedAll(chunks) {
  const out = new Array(chunks.length);
  // 8 chunks × ~500 tokens ≈ 4k tokens per request, well under the
  // 10k TPM free-tier cap. On paid tiers the batch could safely be
  // much larger but this size is harmless either way.
  const batchSize = 8;
  // Between batches, wait long enough to clear the 3-RPM free-tier
  // window (20s). A paid tier burns the wait needlessly but keeps
  // a single codepath.
  const interBatchDelayMs = 21000;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const slice = chunks.slice(i, i + batchSize);
    console.log(
      `  embedding ${i + 1}–${i + slice.length} of ${chunks.length}`
    );
    const vectors = await embedBatch(slice.map((c) => c.text));
    for (let j = 0; j < vectors.length; j++) {
      out[i + j] = vectors[j];
    }
    if (i + batchSize < chunks.length) {
      await new Promise((r) => setTimeout(r, interBatchDelayMs));
    }
  }
  return out;
}

/* -------------------------------- pinecone ------------------------------- */

/**
 * Optional — upsert chunks + embeddings to Pinecone so the pluggable
 * backend has data. Skipped silently if credentials are not present.
 * We upsert in batches of 100, which is the Pinecone per-request cap.
 */
async function upsertToPinecone(chunks) {
  if (!PINECONE_API_KEY || !PINECONE_INDEX) {
    console.log("  pinecone credentials missing — skipping upsert");
    return;
  }
  let Pinecone;
  try {
    ({ Pinecone } = await import("@pinecone-database/pinecone"));
  } catch {
    console.log("  @pinecone-database/pinecone not installed — skipping upsert");
    return;
  }
  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(PINECONE_INDEX);
  console.log(`  upserting ${chunks.length} vectors to ${PINECONE_INDEX}`);
  const batchSize = 100;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const slice = chunks.slice(i, i + batchSize);
    // Pinecone JS SDK v7 takes `{ records: [...] }`, not a raw
    // array. Metadata has a 40 KB total cap per record, so truncate
    // the stored text to keep batches well under that.
    const records = slice.map((c) => ({
      id: c.id,
      values: c.embedding,
      metadata: {
        docId: c.docId,
        docTitle: c.docTitle,
        text: c.text.slice(0, 2000),
      },
    }));
    await index.upsert({ records });
  }
}

/* ---------------------------------- main --------------------------------- */

async function main() {
  console.log("building RAG index…");
  const files = (await fs.readdir(CORPUS_DIR))
    .filter((f) => f.endsWith(".md"))
    .sort();

  const rawChunks = [];
  for (const file of files) {
    const full = path.join(CORPUS_DIR, file);
    const raw = await fs.readFile(full, "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const docId = meta.id || path.basename(file, ".md");
    const docTitle = meta.title || docId;
    const parts = chunkDocument(body);
    parts.forEach((text, i) => {
      rawChunks.push({
        id: `${docId}#${i}`,
        docId,
        docTitle,
        text,
      });
    });
    console.log(`  ${file}: ${parts.length} chunks`);
  }

  console.log(`\nembedding ${rawChunks.length} chunks with ${VOYAGE_MODEL}…`);
  const vectors = await embedAll(rawChunks);
  const chunks = rawChunks.map((c, i) => ({ ...c, embedding: vectors[i] }));

  // Sanity check — dimension should match what the app expects.
  if (chunks[0].embedding.length !== EMBEDDING_DIM) {
    throw new Error(
      `Unexpected embedding dimension ${chunks[0].embedding.length} (expected ${EMBEDDING_DIM})`
    );
  }

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  const payload = {
    model: VOYAGE_MODEL,
    dim: EMBEDDING_DIM,
    generatedAt: new Date().toISOString(),
    chunks,
  };
  await fs.writeFile(OUT_PATH, JSON.stringify(payload));
  const sizeKb = (Buffer.byteLength(JSON.stringify(payload)) / 1024).toFixed(1);
  console.log(
    `\nwrote ${OUT_PATH} (${chunks.length} chunks, ${sizeKb} KB)`
  );

  await upsertToPinecone(chunks);
  console.log("\ndone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
