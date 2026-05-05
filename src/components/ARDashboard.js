"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Database,
} from "lucide-react";
import BarChart from "@/components/ar/BarChart";
import LineChart from "@/components/ar/LineChart";
import { risk_summary } from "@/lib/ar/analytics";

/**
 * AR Insights Dashboard - the interactive surface.
 *
 * Layout:
 *   - KPI strip across the top (computed client-side from the
 *     synthetic dataset; renders instantly, no API call needed)
 *   - Chat-style Q&A surface below
 *     - Empty state shows starter questions
 *     - User asks; the agent loop calls one or more analytics
 *       functions; the answer + chart(s) + audit panel render
 *     - Conversation persists in component state for follow-ups
 *
 * The audit panel under each answer is the architecturally
 * important detail - every claim is backed by a tool call you can
 * inspect, with the function name, the arguments, and the
 * structured data that was returned.
 */

const STARTER_QUESTIONS = [
  "What's our total AR exposure right now?",
  "Who are our most overdue customers?",
  "Show me the aging breakdown for the whole portfolio",
  "Tell me about DriftWood Hotels Group",
  "Is collection time getting better or worse?",
];

const TOOL_LABELS = {
  risk_summary: "Risk summary",
  top_customers_by: "Customer ranking",
  customer_aging: "Aging breakdown",
  invoices_filtered: "Invoice filter",
  dso_trend: "Collection-period trend",
  customer_detail: "Customer detail",
};

export default function ARDashboard() {
  const [messages, setMessages] = useState([]); // {role, content, toolCalls?, charts?}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditOpen, setAuditOpen] = useState({}); // msgIdx -> open
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);

  // Compute KPIs once on mount. risk_summary is a pure function so
  // it returns the same numbers every render; cheap enough to call
  // again if the dataset ever changes, but no need to memoize hard.
  const kpi = useMemo(() => risk_summary().data, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function ask(question) {
    if (!question || loading) return;
    setError(null);
    setInput("");

    const userTurn = { role: "user", content: question };
    const assistantPlaceholder = {
      role: "assistant",
      content: "",
      toolCalls: [],
      charts: [],
      done: false,
    };
    const next = [...messages, userTurn, assistantPlaceholder];
    setMessages(next);
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch("/api/ar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.message || `HTTP ${resp.status}`);
      }
      const data = await resp.json();

      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          content: data.answer || (data.llmError ? "" : "(no answer)"),
          toolCalls: data.toolCalls || [],
          charts: data.charts || [],
          done: true,
          llmError: data.llmError || null,
        };
        return copy;
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function reset() {
    setMessages([]);
    setError(null);
    setAuditOpen({});
    inputRef.current?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask(input.trim());
  }

  return (
    <div className="ar-dashboard">
      <KpiStrip kpi={kpi} />

      <div className="ar-chat glow-border">
        <div className="ar-chat-head">
          <div className="ar-chat-title">
            <span className="ar-chat-dot" aria-hidden="true" />
            <span>AR Insights · Aurelia Industries</span>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              className="ar-reset"
              onClick={reset}
              aria-label="Reset conversation"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="ar-chat-scroller" ref={scrollerRef}>
          {messages.length === 0 && (
            <div className="ar-empty-state">
              <p className="ar-empty-lead">
                Ask a question about Aurelia&apos;s accounts receivable
                portfolio. The assistant calls one or more analytical
                functions over the dataset, then writes the answer in
                plain English. Every number is traceable back to the
                source rows.
              </p>
              <div className="ar-starter-grid">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="ar-starter"
                    onClick={() => ask(q)}
                    disabled={loading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <Message
              key={i}
              msg={m}
              idx={i}
              auditOpen={auditOpen}
              onToggleAudit={(idx) =>
                setAuditOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))
              }
            />
          ))}

          {error && (
            <div className="ar-error" role="alert">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <form className="ar-chat-input" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about exposures, aging, DSO, a specific customer…"
            aria-label="Your question"
            maxLength={600}
            disabled={loading}
          />
          <button
            type="submit"
            className="ar-send"
            aria-label="Send question"
            disabled={loading || !input.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ----------------- KPI strip ----------------- */

function KpiStrip({ kpi }) {
  const fmtUSD = (n) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  return (
    <div className="ar-kpi-strip">
      <Kpi
        label="Total open AR"
        value={fmtUSD(kpi.totalAR)}
        sub={`${kpi.activeCustomers} customers · ${kpi.totalInvoices} open invoices`}
      />
      <Kpi
        label="% past due"
        value={`${kpi.overduePct.toFixed(1)}%`}
        sub={`${fmtUSD(kpi.overdueAR)} of total`}
        tone={kpi.overduePct > 30 ? "warn" : "neutral"}
      />
      <Kpi
        label="Avg days overdue"
        value={`${kpi.avgDaysOverdue.toFixed(0)}d`}
        sub="Across past-due balances"
        tone={kpi.avgDaysOverdue > 45 ? "warn" : "neutral"}
      />
      <Kpi
        label="Largest exposure"
        value={kpi.topCustomer ? kpi.topCustomer.name : "—"}
        sub={
          kpi.topCustomer
            ? `${fmtUSD(kpi.topCustomer.amount)} · ${kpi.topCustomer.pctOfLimit.toFixed(0)}% of limit`
            : ""
        }
        tone={kpi.topCustomer && kpi.topCustomer.pctOfLimit > 90 ? "warn" : "neutral"}
      />
    </div>
  );
}

function Kpi({ label, value, sub, tone = "neutral" }) {
  return (
    <div className={`ar-kpi ar-kpi-${tone}`}>
      <div className="ar-kpi-label">{label}</div>
      <div className="ar-kpi-value">{value}</div>
      <div className="ar-kpi-sub">{sub}</div>
    </div>
  );
}

/* ----------------- Single message ----------------- */

function Message({ msg, idx, auditOpen, onToggleAudit }) {
  if (msg.role === "user") {
    return (
      <div className="ar-msg ar-msg-user">
        <div className="ar-msg-bubble">{msg.content}</div>
      </div>
    );
  }

  const open = !!auditOpen[idx];
  const hasTools = msg.toolCalls && msg.toolCalls.length > 0;
  const hasCharts = msg.charts && msg.charts.length > 0;

  return (
    <div className="ar-msg ar-msg-assistant">
      <div className="ar-msg-bubble">
        {msg.content || (!msg.done && <TypingDots />)}
      </div>

      {msg.llmError && (
        <div className="ar-banner ar-banner-warn" role="alert">
          <AlertTriangle size={14} />
          <span>{msg.llmError}</span>
        </div>
      )}

      {hasCharts && (
        <div className="ar-charts">
          {msg.charts.map((c, ci) =>
            c.type === "line" ? (
              <LineChart
                key={ci}
                title={c.title}
                valueLabel={c.valueLabel}
                data={c.data}
              />
            ) : (
              <BarChart
                key={ci}
                title={c.title}
                valueLabel={c.valueLabel}
                data={c.data}
                orientation={c.orientation}
              />
            )
          )}
        </div>
      )}

      {hasTools && (
        <div className="ar-audit">
          <button
            type="button"
            className="ar-audit-toggle"
            onClick={() => onToggleAudit(idx)}
            aria-expanded={open}
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Sparkles size={13} aria-hidden="true" />
            <span>
              {msg.toolCalls.length} analytical function
              {msg.toolCalls.length === 1 ? "" : "s"} called
            </span>
            <span className="ar-audit-tools-summary">
              {msg.toolCalls.map((t) => TOOL_LABELS[t.name] || t.name).join(" · ")}
            </span>
          </button>
          {open && (
            <div className="ar-audit-body">
              {msg.toolCalls.map((tc, ti) => (
                <ToolCallCard key={ti} call={tc} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToolCallCard({ call }) {
  const label = TOOL_LABELS[call.name] || call.name;
  return (
    <div className={`ar-tool-call${call.isError ? " ar-tool-call-error" : ""}`}>
      <div className="ar-tool-call-head">
        <Database size={13} aria-hidden="true" />
        <span className="ar-tool-call-name">{label}</span>
        <span className="ar-tool-call-fn">({call.name})</span>
      </div>
      {call.input && Object.keys(call.input).length > 0 && (
        <div className="ar-tool-call-args">
          <span className="ar-tool-call-args-label">Arguments</span>
          <code>{JSON.stringify(call.input)}</code>
        </div>
      )}
      <ToolResultPreview output={call.output} />
    </div>
  );
}

function ToolResultPreview({ output }) {
  if (!output) return null;
  if (output.error) {
    return <div className="ar-tool-call-summary ar-tool-call-summary-error">{output.error}</div>;
  }
  return (
    <>
      {output.summary && (
        <div className="ar-tool-call-summary">{output.summary}</div>
      )}
      {output.data?.rows && Array.isArray(output.data.rows) && (
        <RowsTable rows={output.data.rows} />
      )}
      {output.data?.invoices && Array.isArray(output.data.invoices) && (
        <RowsTable rows={output.data.invoices.map(decorateInvoice)} />
      )}
    </>
  );
}

function decorateInvoice(inv) {
  return {
    invoice: inv.id,
    issued: inv.issueDate,
    due: inv.dueDate,
    amount: inv.amount,
    status: inv.status,
    daysOverdue: inv.daysOverdue,
  };
}

function RowsTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  // Take the union of keys but preserve first-row order
  const cols = Object.keys(rows[0]);
  const fmt = (v) => {
    if (typeof v === "number" && (cols.includes("amount") || cols.includes("outstanding"))) {
      // Numbers in dollar-shaped columns get currency formatting
      return v.toLocaleString("en-US");
    }
    if (typeof v === "number") return v.toLocaleString("en-US");
    if (v === null || v === undefined) return "—";
    return String(v);
  };
  return (
    <div className="ar-tool-rows">
      <table>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((r, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c}>{fmt(r[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 10 && (
        <div className="ar-tool-rows-truncated">
          Showing 10 of {rows.length} rows.
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="ar-typing" aria-label="Thinking…">
      <span />
      <span />
      <span />
    </span>
  );
}
