/**
 * RAG API route.
 *
 * POST /api/rag
 *   body:  { query: string, history?: Array<{role, content}> }
 *   query: ?backend=in-memory | pinecone  (optional — defaults to in-memory)
 *
 * Flow:
 *   1. Rate-limit per client IP.
 *   2. Embed the user's query with Voyage.
 *   3. Retrieve top-K chunks from the chosen backend.
 *   4. Build a grounded prompt with inline citations.
 *   5. Stream Claude Haiku 4.5's answer back to the client.
 *
 * The response is newline-delimited JSON ("NDJSON"): one JSON object
 * per line, each tagged with `type`. The client reads them in order.
 * This is simpler than SSE for a single-request/single-response chat
 * and works cleanly with ReadableStream on both sides.
 */

import Anthropic from "@anthropic-ai/sdk";
import { getRetriever, embedQuery } from "@/lib/rag/retriever";
import { checkRateLimit, getClientIp } from "@/lib/rag/ratelimit";
import { ensureEnvLoaded } from "@/lib/rag/env";

ensureEnvLoaded();

// We want Node — not the Edge runtime — because the in-memory
// retriever reads `public/rag-index.json` off the function filesystem
// and the Pinecone SDK expects Node globals.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-haiku-4-5";
const TOP_K = 4;
const MAX_OUTPUT_TOKENS = 1024;

const SYSTEM_PROMPT = `You are a careful assistant that answers questions about order-to-cash (O2C) policies for a fictional enterprise. You only know what appears in the CONTEXT provided below.

Rules:
- Only use information from CONTEXT. If the answer is not there, say "That isn't covered in the documents I have access to" and stop.
- Quote specific numbers, thresholds, and approval levels when the question involves them.
- Cite sources inline using [#] where # is the index of the chunk in CONTEXT. Multiple citations are fine.
- Be concise. Short paragraphs or bullets. No preamble like "Based on the documents…".
- Never invent policies, people, or numbers that are not in the context.`;

function buildContextBlock(hits) {
  return hits
    .map((h, i) => {
      return `[${i + 1}] Source: ${h.docTitle}\n${h.text}`;
    })
    .join("\n\n---\n\n");
}

export async function POST(request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return Response.json(
      {
        error: "rate_limited",
        message: `Too many requests. Try again in ${rl.retryAfterSec}s.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "bad_request", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const query = (body?.query || "").trim();
  if (!query) {
    return Response.json(
      { error: "bad_request", message: "`query` is required" },
      { status: 400 }
    );
  }
  if (query.length > 1000) {
    return Response.json(
      { error: "bad_request", message: "Query too long (max 1000 chars)" },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const backend = url.searchParams.get("backend") || "in-memory";
  const retriever = getRetriever(backend);

  // Prior conversation is optional and kept short — the RAG context
  // is authoritative, and a long history would just dilute Haiku's
  // attention without improving answers.
  const history = Array.isArray(body?.history) ? body.history.slice(-6) : [];

  let queryEmbedding;
  let hits;
  try {
    queryEmbedding = await embedQuery(query);
    hits = await retriever.retrieve(queryEmbedding, { topK: TOP_K });
  } catch (err) {
    console.error("retrieval error:", err);
    return Response.json(
      {
        error: "retrieval_failed",
        message: "Could not fetch relevant documents.",
      },
      { status: 500 }
    );
  }

  const context = buildContextBlock(hits);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Each stream message carries a `type` so the client can branch
  // on it. The first message carries the source list so the UI can
  // render citation chips before the text starts arriving.
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (obj) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      send({
        type: "sources",
        backend: retriever.name,
        sources: hits.map((h, i) => ({
          index: i + 1,
          id: h.id,
          docId: h.docId,
          docTitle: h.docTitle,
          score: Number(h.score.toFixed(4)),
        })),
      });

      try {
        const userTurn = `CONTEXT:\n\n${context}\n\n---\n\nQUESTION: ${query}`;
        const messages = [
          ...history
            .filter((m) => m && m.role && m.content)
            .map((m) => ({ role: m.role, content: String(m.content) })),
          { role: "user", content: userTurn },
        ];

        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta?.type === "text_delta"
          ) {
            send({ type: "text", text: event.delta.text });
          }
        }

        const final = await response.finalMessage();
        send({
          type: "done",
          usage: final.usage,
        });
      } catch (err) {
        console.error("claude stream error:", err);
        let message = "Something went wrong while generating the answer.";
        if (err instanceof Anthropic.RateLimitError) {
          message = "The answer service is rate-limited. Try again in a moment.";
        } else if (err instanceof Anthropic.AuthenticationError) {
          message = "The answer service is not authenticated — the API key is missing or invalid.";
        } else if (
          err?.error?.error?.message &&
          String(err.error.error.message).toLowerCase().includes("credit")
        ) {
          // Thrown when the Anthropic account has no credits. Useful
          // to flag explicitly so the page doesn't look broken when
          // it's a billing issue.
          message =
            "The answer service is temporarily unavailable (billing). Retrieval still works — sources are listed above.";
        }
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Retriever-Backend": retriever.name,
    },
  });
}
