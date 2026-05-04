/**
 * Reconciliation API route.
 *
 * POST /api/recon
 *   body: { custodian: Array<TradeRow>, ibor: Array<TradeRow> }
 *
 * Flow:
 *   1. Rate-limit per client IP (shared limiter with the RAG demo).
 *   2. Run a deterministic diff in JS to find breaks. The LLM never
 *      sees the full position files - only the breaks themselves -
 *      which keeps the cost flat regardless of dataset size.
 *   3. Ask Claude Haiku 4.5 to enrich each break with a plain-English
 *      rationale, a suggested action, and a severity rating. The
 *      response shape is locked in via tool-use so the structure is
 *      bullet-proof: we define a single tool and force Claude to
 *      call it. No parse-and-pray on free-form text.
 *   4. Merge the enrichment back into the breaks list and return the
 *      whole thing as one JSON response.
 *
 * Why batch JSON, not streaming: reconciliation is a one-shot
 * analysis, not a chat. Streaming buys nothing and complicates the
 * client. The full response is small (~5-15 breaks worth of JSON).
 */

import Anthropic from "@anthropic-ai/sdk";
import { diff } from "@/lib/recon/diff";
import { checkRateLimit, getClientIp } from "@/lib/rag/ratelimit";
import { ensureEnvLoaded } from "@/lib/rag/env";

ensureEnvLoaded();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-haiku-4-5";
const MAX_OUTPUT_TOKENS = 2048;

const SYSTEM_PROMPT = `You are a senior reconciliation analyst on the Operations team of an asset manager. Your job is to look at breaks between a custodian's end-of-day position file and the firm's internal Investment Book of Record (IBOR), and explain each break in plain English to a junior analyst who will action it.

For every break you receive:
- Write a one or two sentence "rationale" that names the most likely cause in plain language. Be specific - cite the field and the values. Do not hedge with "could be many things".
- Provide a "suggestedAction" - one concrete next step the junior analyst should take. Examples: "Confirm the executed quantity with the broker via Bloomberg chat", "Verify the settle date with the custodian against T+2 calendar", "Check whether the trade was booked in IBOR but not yet sent to the custodian".
- Pick a "severity": "high" if money or settlement risk is at stake (price breaks, large quantity breaks, missing trades), "medium" if it's a process drift unlikely to cause loss (e.g. settle date off by one business day), "low" if it's almost certainly cosmetic.

Tone: direct, helpful, never speculative. If you genuinely can't tell the cause from the data, say so and recommend the analyst escalate.

You MUST call the submit_break_analysis tool exactly once with one entry per break, keyed by the break id you were given. Do not respond with prose.`;

const TOOL = {
  name: "submit_break_analysis",
  description:
    "Return one analysis entry per reconciliation break. The 'analyses' array MUST contain one item for every break id provided in the input.",
  input_schema: {
    type: "object",
    properties: {
      analyses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The break id this analysis applies to (e.g. 'B-001'). Must match an id from the input.",
            },
            rationale: {
              type: "string",
              description:
                "1-2 sentences explaining the most likely cause. Cite the field and values.",
            },
            suggestedAction: {
              type: "string",
              description:
                "One concrete next step for the junior analyst.",
            },
            severity: {
              type: "string",
              enum: ["low", "medium", "high"],
              description:
                "high = money / settlement risk, medium = process drift, low = cosmetic",
            },
          },
          required: ["id", "rationale", "suggestedAction", "severity"],
        },
      },
    },
    required: ["analyses"],
  },
};

function buildBreaksPayload(breaks) {
  // Hand the model only what it needs - the breaks themselves and
  // the matched rows from each side. Sending the full 10-row files
  // would just bloat tokens for no gain; the diff already isolated
  // the interesting records.
  return breaks.map((b) => ({
    id: b.id,
    tradeKey: b.tradeKey,
    category: b.category,
    field: b.field,
    custodianValue: b.custodianValue,
    iborValue: b.iborValue,
    delta: b.delta,
    custodianRow: b.custodianRow,
    iborRow: b.iborRow,
  }));
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

  const { custodian, ibor } = body || {};
  if (!Array.isArray(custodian) || !Array.isArray(ibor)) {
    return Response.json(
      {
        error: "bad_request",
        message: "Both `custodian` and `ibor` arrays are required.",
      },
      { status: 400 }
    );
  }

  // Guard against an over-large input. The synthetic demo uses ~10
  // rows per side; even 200 rows total would be cheap, but cap it
  // anyway so a hostile payload can't drive token cost up.
  if (custodian.length + ibor.length > 200) {
    return Response.json(
      {
        error: "bad_request",
        message: "Inputs too large. Demo accepts up to 200 rows total.",
      },
      { status: 400 }
    );
  }

  const { matches, breaks } = diff(custodian, ibor);

  // Edge case: nothing to explain. Return early without spending
  // any tokens on the LLM.
  if (breaks.length === 0) {
    return Response.json({
      matches,
      breaks: [],
      model: null,
      durationMs: 0,
    });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const startedAt = Date.now();

  let analyses = [];
  let modelLabel = MODEL;
  let llmError = null;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      tools: [TOOL],
      tool_choice: { type: "tool", name: TOOL.name },
      messages: [
        {
          role: "user",
          content: `Here are the reconciliation breaks for trade date 2026-04-15. Provide one analysis per break id.\n\n${JSON.stringify(buildBreaksPayload(breaks), null, 2)}`,
        },
      ],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (toolUse?.input?.analyses) {
      analyses = toolUse.input.analyses;
    }
  } catch (err) {
    console.error("recon claude error:", err);
    if (err instanceof Anthropic.RateLimitError) {
      llmError = "Analysis service is rate-limited. Try again in a moment.";
    } else if (err instanceof Anthropic.AuthenticationError) {
      llmError = "Analysis service is not authenticated.";
    } else if (
      err?.error?.error?.message &&
      String(err.error.error.message).toLowerCase().includes("credit")
    ) {
      llmError =
        "Analysis service is temporarily unavailable (billing). The diff still ran - breaks are listed without explanations.";
    } else {
      llmError = "Could not generate explanations.";
    }
  }

  // Merge the LLM enrichment back into the breaks list. If the model
  // failed (or didn't return an entry for some break), the field is
  // left undefined and the UI shows the deterministic diff alone.
  const byId = new Map(analyses.map((a) => [a.id, a]));
  const enrichedBreaks = breaks.map((b) => {
    const a = byId.get(b.id);
    return {
      ...b,
      rationale: a?.rationale,
      suggestedAction: a?.suggestedAction,
      severity: a?.severity,
    };
  });

  return Response.json({
    matches,
    breaks: enrichedBreaks,
    model: modelLabel,
    durationMs: Date.now() - startedAt,
    llmError,
  });
}
