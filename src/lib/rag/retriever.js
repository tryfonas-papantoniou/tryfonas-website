/**
 * Pluggable retriever interface for the RAG demo.
 *
 * The shape is intentionally small: every retriever implements
 *   `async retrieve(queryEmbedding, { topK }) => Array<Hit>`
 * where a Hit is `{ id, docId, docTitle, text, score }`.
 *
 * Two implementations ship by default:
 *
 * - `InMemoryRetriever` (default) loads `public/rag-index.json`
 *   on first use and does a straight cosine-similarity sweep over
 *   all chunks. At 26 chunks × 1024 floats it runs in well under
 *   a millisecond — cheaper than a network round trip. This is
 *   the primary backend for the deployed demo.
 *
 * - `PineconeRetriever` delegates to a serverless Pinecone index
 *   containing the same vectors. It exists to show the swap is a
 *   one-line change and to back a "?backend=pinecone" switch in
 *   the API route, which the demo UI exposes as a toggle. It is
 *   not faster than the in-memory path at this corpus size — it's
 *   there to demonstrate the architecture, not as an optimisation.
 *
 * A real production system would move to Pinecone (or equivalent)
 * when the corpus outgrew what the function memory could hold, or
 * when a single index needed to be shared across services.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

// Voyage's voyage-3 embeddings are normalized to unit length, which
// means cosine similarity reduces to a plain dot product. We still
// compute norms defensively so the function also works for any
// hand-crafted test vectors.
function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/* ----------------------------- in-memory -------------------------------- */

let cachedIndex = null;

async function loadIndex() {
  if (cachedIndex) return cachedIndex;
  // Read from the built public/rag-index.json. In Vercel's serverless
  // environment the public/ directory is part of the deployed bundle
  // and is available at process.cwd().
  const indexPath = path.join(process.cwd(), "public", "rag-index.json");
  const raw = await fs.readFile(indexPath, "utf8");
  cachedIndex = JSON.parse(raw);
  return cachedIndex;
}

export class InMemoryRetriever {
  name = "in-memory";

  async retrieve(queryEmbedding, { topK = 4 } = {}) {
    const index = await loadIndex();
    const scored = index.chunks.map((c) => ({
      id: c.id,
      docId: c.docId,
      docTitle: c.docTitle,
      text: c.text,
      score: cosineSimilarity(queryEmbedding, c.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

/* ------------------------------- pinecone ------------------------------- */

export class PineconeRetriever {
  name = "pinecone";

  constructor({ apiKey, indexName }) {
    if (!apiKey) throw new Error("Pinecone API key is required");
    if (!indexName) throw new Error("Pinecone index name is required");
    this.apiKey = apiKey;
    this.indexName = indexName;
    this._client = null;
  }

  async _getIndex() {
    if (!this._client) {
      const { Pinecone } = await import("@pinecone-database/pinecone");
      this._client = new Pinecone({ apiKey: this.apiKey });
    }
    return this._client.index(this.indexName);
  }

  async retrieve(queryEmbedding, { topK = 4 } = {}) {
    const index = await this._getIndex();
    const res = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });
    return (res.matches || []).map((m) => ({
      id: m.id,
      docId: m.metadata?.docId || "",
      docTitle: m.metadata?.docTitle || "",
      text: m.metadata?.text || "",
      score: m.score || 0,
    }));
  }
}

/* ------------------------------- factory -------------------------------- */

/**
 * Pick a retriever by name. The API route passes `backend` from the
 * query string; anything unrecognised falls back to in-memory so a
 * misconfigured client never breaks the demo.
 */
export function getRetriever(backend = "in-memory") {
  if (backend === "pinecone") {
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX;
    if (!apiKey || !indexName) {
      console.warn(
        "Pinecone env vars missing — falling back to in-memory retriever"
      );
      return new InMemoryRetriever();
    }
    return new PineconeRetriever({ apiKey, indexName });
  }
  return new InMemoryRetriever();
}

/* ------------------------------- embed --------------------------------- */

/**
 * Embed a user query with Voyage. The API route uses this before
 * handing off to a retriever. We use `input_type: "query"` so
 * Voyage applies the asymmetric search prompt template — documents
 * were embedded with `input_type: "document"` in the build step.
 */
export async function embedQuery(query) {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY is not set");
  const resp = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: [query],
      model: "voyage-3",
      input_type: "query",
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Voyage embed error ${resp.status}: ${err}`);
  }
  const json = await resp.json();
  return json.data[0].embedding;
}
