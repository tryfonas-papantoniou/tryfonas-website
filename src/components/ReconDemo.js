"use client";

import { useState } from "react";
import {
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Hash,
  CalendarClock,
  FileX,
  FileQuestion,
} from "lucide-react";
import { CUSTODIAN_FEED, IBOR_POSITIONS, TRADE_DATE } from "@/lib/recon/example-data";
import { CATEGORY_LABELS } from "@/lib/recon/diff";

/**
 * Interactive reconciliation demo.
 *
 * Layout:
 *   - Two side-by-side data tables (custodian vs IBOR)
 *   - A "Run reconciliation" button below
 *   - After run: a summary line + a list of break cards. Each break
 *     card shows the AI-generated rationale up front and reveals
 *     the suggested action + the source rows on click.
 *
 * State stays in this component - no streaming, the API returns one
 * JSON blob and we render it. Total payload is small enough that it
 * arrives in well under a second.
 */

const CATEGORY_ICONS = {
  price_break: TrendingUp,
  quantity_break: Hash,
  settle_date_drift: CalendarClock,
  missing_in_custodian: FileQuestion,
  missing_in_ibor: FileX,
};

const SEVERITY_LABEL = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function ReconDemo() {
  const [result, setResult] = useState(null); // {matches, breaks, model, durationMs, llmError}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({}); // breakId -> open

  async function run() {
    setLoading(true);
    setError(null);
    setExpanded({});
    try {
      const resp = await fetch("/api/recon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custodian: CUSTODIAN_FEED,
          ibor: IBOR_POSITIONS,
        }),
      });
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.message || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setExpanded({});
  }

  return (
    <div className="recon-demo">
      <div className="recon-data-grid">
        <DataTable
          title="Custodian feed"
          subtitle="End-of-day position file from third-party custodian"
          rows={CUSTODIAN_FEED}
          rowsLabel={`${CUSTODIAN_FEED.length} rows`}
          accent="custodian"
          breaks={result?.breaks || []}
          breakSide="custodianRow"
        />
        <DataTable
          title="IBOR positions"
          subtitle="Internal Investment Book of Record"
          rows={IBOR_POSITIONS}
          rowsLabel={`${IBOR_POSITIONS.length} rows`}
          accent="ibor"
          breaks={result?.breaks || []}
          breakSide="iborRow"
        />
      </div>

      <div className="recon-controls">
        <div className="recon-controls-meta">
          <span className="recon-trade-date">Trade date {TRADE_DATE}</span>
          {result && (
            <span className="recon-controls-stats">
              <CheckCircle2 size={13} aria-hidden="true" />
              {result.matches} matched · {result.breaks.length} break
              {result.breaks.length === 1 ? "" : "s"}
              {typeof result.durationMs === "number" && result.durationMs > 0 && (
                <> · {(result.durationMs / 1000).toFixed(1)}s</>
              )}
            </span>
          )}
        </div>
        <div className="recon-controls-buttons">
          {result && (
            <button
              type="button"
              className="recon-btn recon-btn-secondary"
              onClick={reset}
              disabled={loading}
            >
              <RefreshCw size={14} />
              Reset
            </button>
          )}
          <button
            type="button"
            className="recon-btn recon-btn-primary"
            onClick={run}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="recon-btn-spinner" aria-hidden="true" />
                Reconciling…
              </>
            ) : (
              <>
                <Play size={14} />
                {result ? "Re-run reconciliation" : "Run reconciliation"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="recon-banner recon-banner-error" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {result?.llmError && (
        <div className="recon-banner recon-banner-warn" role="alert">
          <AlertTriangle size={16} />
          <span>{result.llmError}</span>
        </div>
      )}

      {result && (
        <ResultPanel
          breaks={result.breaks}
          matches={result.matches}
          expanded={expanded}
          onToggle={(id) =>
            setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
          }
        />
      )}
    </div>
  );
}

/* ---------------- DataTable ---------------- */

function DataTable({ title, subtitle, rows, rowsLabel, accent, breaks, breakSide }) {
  // Build a set of row ids that participate in a break for this side
  // so we can highlight them after a run.
  const breakIds = new Set();
  for (const b of breaks) {
    const r = b[breakSide];
    if (r?.id) breakIds.add(r.id);
  }

  return (
    <div className={`recon-table recon-table-${accent}`}>
      <div className="recon-table-head">
        <div>
          <div className="recon-table-title">{title}</div>
          <div className="recon-table-sub">{subtitle}</div>
        </div>
        <div className="recon-table-rowcount">{rowsLabel}</div>
      </div>
      <div className="recon-table-scroll">
        <table>
          <thead>
            <tr>
              <th className="recon-th-symbol">Symbol</th>
              <th className="recon-th-side">Side</th>
              <th className="recon-th-num">Qty</th>
              <th className="recon-th-num">Price</th>
              <th className="recon-th-date">Settle</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className={breakIds.has(r.id) ? "recon-row-break" : ""}
              >
                <td className="recon-td-symbol">
                  <div className="recon-td-symbol-main">{r.symbol}</div>
                  <div className="recon-td-symbol-sub">{r.cusip}</div>
                </td>
                <td>
                  <span className={`recon-side recon-side-${r.side.toLowerCase()}`}>
                    {r.side}
                  </span>
                </td>
                <td className="recon-td-num">{r.quantity.toLocaleString()}</td>
                <td className="recon-td-num">
                  {r.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="recon-td-date">{r.settleDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- ResultPanel ---------------- */

function ResultPanel({ breaks, matches, expanded, onToggle }) {
  if (breaks.length === 0) {
    return (
      <div className="recon-result-empty">
        <CheckCircle2 size={20} aria-hidden="true" />
        <div>
          <div className="recon-result-empty-title">All positions reconcile cleanly.</div>
          <div className="recon-result-empty-sub">
            {matches} trade{matches === 1 ? "" : "s"} matched on quantity, price, and settle date.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recon-result">
      <div className="recon-result-head">
        <div className="recon-result-title">Breaks identified</div>
        <div className="recon-result-sub">
          Each break is matched on symbol and trade date, then compared
          field by field. Claude explains the likely cause and provides
          a suggested next step.
        </div>
      </div>
      <ul className="recon-break-list">
        {breaks.map((b) => (
          <BreakCard
            key={b.id}
            breakRow={b}
            open={!!expanded[b.id]}
            onToggle={() => onToggle(b.id)}
          />
        ))}
      </ul>
    </div>
  );
}

/* ---------------- BreakCard ---------------- */

function BreakCard({ breakRow, open, onToggle }) {
  const Icon = CATEGORY_ICONS[breakRow.category] || AlertTriangle;
  const sev = breakRow.severity;
  return (
    <li className={`recon-break ${open ? "open" : ""}`}>
      <button
        type="button"
        className="recon-break-head"
        onClick={onToggle}
        aria-expanded={open}
      >
        <div className="recon-break-icon" aria-hidden="true">
          <Icon size={15} />
        </div>
        <div className="recon-break-headline">
          <div className="recon-break-trade">{breakRow.tradeKey.replace("|", " · ")}</div>
          <div className="recon-break-rationale">
            {breakRow.rationale || (
              <span className="recon-break-norationale">
                Break identified - explanation unavailable.
              </span>
            )}
          </div>
        </div>
        <div className="recon-break-meta">
          <span className={`recon-cat-badge recon-cat-${breakRow.category}`}>
            {CATEGORY_LABELS[breakRow.category] || breakRow.category}
          </span>
          {sev && (
            <span className={`recon-sev recon-sev-${sev}`} title={`Severity: ${SEVERITY_LABEL[sev]}`}>
              <span className="recon-sev-dot" aria-hidden="true" />
              {SEVERITY_LABEL[sev]}
            </span>
          )}
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>
      {open && <BreakDetail breakRow={breakRow} />}
    </li>
  );
}

function BreakDetail({ breakRow }) {
  return (
    <div className="recon-break-body">
      {breakRow.suggestedAction && (
        <div className="recon-break-action">
          <span className="recon-break-action-label">Suggested action</span>
          <span className="recon-break-action-text">{breakRow.suggestedAction}</span>
        </div>
      )}
      <div className="recon-break-rows">
        <SourceRow label="Custodian feed" row={breakRow.custodianRow} highlight={breakRow.field} />
        <SourceRow label="IBOR position" row={breakRow.iborRow} highlight={breakRow.field} />
      </div>
    </div>
  );
}

function SourceRow({ label, row, highlight }) {
  if (!row) {
    return (
      <div className="recon-source-row recon-source-empty">
        <div className="recon-source-label">{label}</div>
        <div className="recon-source-missing">No matching record.</div>
      </div>
    );
  }
  const fields = [
    { key: "symbol", label: "Symbol", value: row.symbol },
    { key: "side", label: "Side", value: row.side },
    { key: "quantity", label: "Quantity", value: row.quantity.toLocaleString() },
    {
      key: "price",
      label: "Price",
      value: row.price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    { key: "settleDate", label: "Settle date", value: row.settleDate },
  ];
  return (
    <div className="recon-source-row">
      <div className="recon-source-label">{label}</div>
      <dl className="recon-source-fields">
        {fields.map((f) => (
          <div
            key={f.key}
            className={`recon-source-field${
              highlight === f.key ? " recon-source-field-flagged" : ""
            }`}
          >
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
