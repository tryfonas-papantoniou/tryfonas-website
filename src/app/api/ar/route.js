/**
 * AR Insights API route - agentic tool-use loop.
 *
 * POST /api/ar
 *   body: { question: string, history?: Array<{role, content}> }
 *
 * Flow:
 *   1. Rate-limit per client IP (shared limiter with the other demos).
 *   2. Build a single user turn from `question` plus a short history.
 *   3. Run an agent loop:
 *      - Send the conversation + the analytics tool schemas to Claude.
 *      - If Claude returns tool_use blocks, execute them locally,
 *        push the results as a tool_result message, and loop.
 *      - If Claude returns plain text and stop_reason === 'end_turn',
 *        we're done. Take the text as the final answer.
 *   4. Return the answer plus the audit trail (every tool that was
 *      called, with arguments, returned data, and any chart hint).
 *
 * Why agentic, not single-shot: real AR questions chain. "Tell me
 * about our biggest exposure" needs (a) find the top customer,
 * then (b) pull the customer's detail. Letting the model run that
 * chain itself, with hard guards, is the architectural point of the
 * demo - not "an LLM with one tool", but "an LLM as an orchestrator
 * over a fixed set of vetted analytical functions".
 */

import Anthropic from "@anthropic-ai/sdk";
import { TOOLS } from "@/lib/ar/analytics";
import { checkRateLimit, getClientIp } from "@/lib/rag/ratelimit";
import { ensureEnvLoaded } from "@/lib/rag/env";

ensureEnvLoaded();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-haiku-4-5";
const MAX_OUTPUT_TOKENS = 1500;
const MAX_AGENT_STEPS = 5; // Hard cap on the tool-use loop

const SYSTEM_PROMPT = `You are an AR (accounts receivable) analyst assistant for Aurelia Industries, a fictional B2B services and supplies company. The user is a finance lead asking about their AR portfolio. Your job: answer their question by calling one or more of the analytical tools available to you, then write a short plain-English answer.

Today's date for all calculations is 2026-04-30. The dataset spans November 2025 through April 2026.

Rules:
- Always call at least one tool. Never make up numbers.
- For questions about specific customers (by name), first find the customer's ID. The most reliable way is to call top_customers_by with metric "outstanding" and a high limit, then pick the matching name from the result. For obvious "overall portfolio" questions, prefer risk_summary or customer_aging with no customerId.
- For multi-step questions (e.g. "show me my biggest exposure and is it improving"), chain tools: e.g. top_customers_by then customer_detail.
- Quote specific numbers and customer names. Mention amounts in USD with thousands separators.
- Do not list every invoice unless the user explicitly asked. The audit panel renders the data tables for them automatically.
- If a tool returns zero matches, say so plainly and suggest a follow-up question - do not invent values.

Output format:
- Plain prose only. No markdown, no asterisks for bold, no hash signs for headings, no bullet lists. Write in flowing sentences.
- Keep the answer to 2-4 sentences for simple questions, up to 6 for customer-detail or multi-tool questions.
- Currency throughout is USD.`;

/* ----------------------------- Tool schemas ----------------------------- */

const TOOL_SCHEMAS = [
  {
    name: "risk_summary",
    description:
      "High-level KPI snapshot of the entire AR portfolio: total open AR, % overdue, average days overdue, top exposure customer. Use for general 'how does AR look' questions.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "top_customers_by",
    description:
      "Rank customers by a single metric and return the top N with their outstanding balance, overdue, max days overdue, and credit utilization. Use for 'most overdue', 'biggest exposure', 'highest credit utilization' questions. Also use as a customer-id lookup when the user names a customer.",
    input_schema: {
      type: "object",
      properties: {
        metric: {
          type: "string",
          enum: ["outstanding", "overdue", "days_overdue", "utilization"],
          description:
            "outstanding = total unpaid balance; overdue = past-due balance only; days_overdue = highest single-invoice days past due; utilization = outstanding / creditLimit %.",
        },
        limit: {
          type: "integer",
          description: "How many customers to return (1-20). Default 5.",
          minimum: 1,
          maximum: 20,
        },
      },
      required: ["metric"],
    },
  },
  {
    name: "customer_aging",
    description:
      "Aging bucket breakdown (current, 1-30, 31-60, 61-90, 90+) for one customer or for the entire portfolio if customerId is omitted. Use for 'aging breakdown' questions.",
    input_schema: {
      type: "object",
      properties: {
        customerId: {
          type: "string",
          description:
            "Optional customer id (e.g. 'C-022'). Omit for the entire portfolio.",
        },
      },
      required: [],
    },
  },
  {
    name: "invoices_filtered",
    description:
      "Slice the invoice ledger by criteria. Use for 'show me invoices over 60 days late', 'all unpaid invoices for X', or amount-bound queries.",
    input_schema: {
      type: "object",
      properties: {
        customerId: { type: "string" },
        minDaysOverdue: { type: "number" },
        maxDaysOverdue: { type: "number" },
        status: { type: "string", enum: ["paid", "unpaid"] },
        minAmount: { type: "number" },
        limit: { type: "integer", minimum: 1, maximum: 50 },
      },
      required: [],
    },
  },
  {
    name: "dso_trend",
    description:
      "Average collection period (days) by month over the dataset window. Use for 'is DSO improving', 'how is collection trending'.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "customer_detail",
    description:
      "Full snapshot of one customer: identity, terms, every invoice, outstanding, overdue, credit utilization, on-time payment percentage. Use when the user names a specific customer.",
    input_schema: {
      type: "object",
      properties: {
        customerId: { type: "string", description: "e.g. 'C-022'." },
      },
      required: ["customerId"],
    },
  },
];

/* ----------------------------- Route handler ----------------------------- */

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

  const question = (body?.question || "").trim();
  if (!question) {
    return Response.json(
      { error: "bad_request", message: "`question` is required" },
      { status: 400 }
    );
  }
  if (question.length > 600) {
    return Response.json(
      { error: "bad_request", message: "Question too long (max 600 chars)" },
      { status: 400 }
    );
  }

  // Keep only a short tail of history so the prompt stays focused.
  const history = Array.isArray(body?.history) ? body.history.slice(-4) : [];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const startedAt = Date.now();

  const messages = [
    ...history
      .filter((m) => m && m.role && m.content)
      .map((m) => ({ role: m.role, content: String(m.content) })),
    { role: "user", content: question },
  ];

  // The audit trail returned to the client: every tool the model
  // called, with the arguments and the result. The UI renders this
  // as a panel under the answer so the data is fully traceable.
  const toolCalls = [];
  let charts = []; // any chart hints from successful tool calls
  let finalText = "";
  let stops = 0;
  let llmError = null;

  try {
    while (stops < MAX_AGENT_STEPS) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: SYSTEM_PROMPT,
        tools: TOOL_SCHEMAS,
        messages,
      });

      // Pull text and tool_use blocks out of the response.
      const textBlocks = response.content.filter((b) => b.type === "text");
      const toolUses = response.content.filter((b) => b.type === "tool_use");

      // Stash any text the model wrote at this step. If this turns
      // out to be the final step, we'll use the latest non-empty
      // text as the answer.
      const stepText = textBlocks.map((b) => b.text).join("").trim();
      if (stepText) finalText = stepText;

      if (response.stop_reason === "end_turn" || toolUses.length === 0) {
        break;
      }

      if (response.stop_reason === "tool_use") {
        // Append the assistant turn (full content - the API expects
        // the same blocks back when we send tool_results).
        messages.push({ role: "assistant", content: response.content });

        const toolResultBlocks = [];
        for (const tu of toolUses) {
          const fn = TOOLS[tu.name];
          let result;
          let isError = false;
          if (!fn) {
            result = { error: `Unknown tool: ${tu.name}` };
            isError = true;
          } else {
            try {
              result = fn(tu.input || {});
            } catch (e) {
              console.error(`tool ${tu.name} threw:`, e);
              result = { error: `Tool ${tu.name} failed.` };
              isError = true;
            }
          }
          toolCalls.push({
            id: tu.id,
            name: tu.name,
            input: tu.input,
            output: result,
            isError,
          });
          if (result?.chart) charts.push(result.chart);
          // Send the tool result back. We hand the model the full
          // structured payload (data + summary) so it can quote
          // numbers verbatim instead of paraphrasing.
          toolResultBlocks.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: JSON.stringify(result),
            is_error: isError || undefined,
          });
        }

        messages.push({ role: "user", content: toolResultBlocks });
        stops += 1;
        continue;
      }

      // Other stop reasons (max_tokens, etc.) - bail with what we have.
      break;
    }
  } catch (err) {
    console.error("ar agent error:", err);
    if (err instanceof Anthropic.RateLimitError) {
      llmError = "Analysis service is rate-limited. Try again in a moment.";
    } else if (err instanceof Anthropic.AuthenticationError) {
      llmError = "Analysis service is not authenticated.";
    } else if (
      err?.error?.error?.message &&
      String(err.error.error.message).toLowerCase().includes("credit")
    ) {
      llmError =
        "Analysis service is temporarily unavailable (billing). Tools that already ran are shown below.";
    } else {
      llmError = "Could not generate the answer.";
    }
  }

  // If we exited the loop without a final answer (e.g. hit MAX_AGENT_STEPS
  // mid-call), give the user something useful instead of an empty bubble.
  if (!finalText && toolCalls.length > 0 && !llmError) {
    finalText =
      "I gathered the data below but ran out of agent steps before finishing the summary. The tool results above are accurate - feel free to ask a more specific follow-up.";
  }
  if (!finalText && llmError) {
    finalText = "";
  }

  return Response.json({
    answer: finalText,
    toolCalls,
    charts,
    durationMs: Date.now() - startedAt,
    model: MODEL,
    llmError,
  });
}
