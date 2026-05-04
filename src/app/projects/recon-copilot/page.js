import Navigation from "@/components/Navigation";
import ReconDemo from "@/components/ReconDemo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Reconciliation Copilot",
  description:
    "An AI-native reconciliation tool: takes two end-of-day position files, finds the breaks deterministically, and uses Claude to explain each one in plain English with auditable citations.",
};

/**
 * /projects/recon-copilot
 *
 * A focused demo for an AI-native data-ops platform: deterministic
 * field-level diff between a custodian feed and an IBOR position
 * file, with Claude Haiku 4.5 enriching each break with a plain
 * English rationale, a suggested action, and a severity rating -
 * delivered via tool-use so the response shape is locked.
 *
 * The split between code-does-the-math and LLM-does-the-writing is
 * the architectural point of the demo: structured outputs, full
 * auditability, costs that scale with breaks (not data volume).
 */
export default function ReconCopilotPage() {
  return (
    <>
      <Navigation />

      <main className="rag-page">
        <a href="/#projects" className="rag-back-link">
          <ArrowLeft size={14} />
          <span>Back to projects</span>
        </a>

        <header className="rag-page-header">
          <span className="section-label">Project · Live Demo</span>
          <h1 className="rag-page-title">Reconciliation Copilot</h1>
          <p className="rag-page-lead">
            Two end-of-day position files - one from a custodian, one from
            an internal book of record - should match exactly. When they
            don&apos;t, ops analysts spend hours finding and explaining
            breaks. This tool runs the diff in code (deterministic, audit-able)
            and uses Claude only to explain each break in plain English,
            with a concrete next step.
          </p>

          <div className="rag-stack-row" aria-label="Tech stack">
            <span className="rag-stack-pill">
              <strong>Diff:</strong> deterministic JS, field-level
            </span>
            <span className="rag-stack-pill">
              <strong>Explanations:</strong> Claude Haiku 4.5
            </span>
            <span className="rag-stack-pill">
              <strong>Output shape:</strong> tool-use, schema-locked
            </span>
            <span className="rag-stack-pill">
              <strong>Runtime:</strong> Next.js · Vercel
            </span>
          </div>
        </header>

        <ReconDemo />

        <section className="rag-how-it-works" aria-label="How it works">
          <h2 className="rag-how-it-works-title">How it works</h2>
          <ol className="rag-pipeline">
            <li className="rag-step">
              <div className="rag-step-num">01</div>
              <div className="rag-step-title">Parse and normalise</div>
              <div className="rag-step-body">
                Both files arrive as arrays of trades. In production these
                would be SWIFT MT940 / CSV / SFTP drops; here they&apos;re
                hand-tuned synthetic data so the demo is honest about
                what&apos;s under the hood.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">02</div>
              <div className="rag-step-title">Match by composite key</div>
              <div className="rag-step-body">
                Records are joined on (symbol, trade date). Anything that
                exists on only one side is flagged immediately as missing.
                Anything on both sides moves to a field-level diff.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">03</div>
              <div className="rag-step-title">Field-level diff</div>
              <div className="rag-step-body">
                Quantity, price, and settle date are compared. Prices use
                a small tolerance to ignore rounding noise. Every break
                carries the field, both values, and the source rows -
                everything an auditor would need.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">04</div>
              <div className="rag-step-title">Explain with structured output</div>
              <div className="rag-step-body">
                Only the breaks are sent to Claude, with one tool defined
                in the request. The model must call that tool, returning
                a rationale, a suggested action, and a severity per break.
                Token cost scales with breaks, not data volume.
              </div>
            </li>
          </ol>
        </section>

        <section className="recon-roadmap" aria-label="What would extend this">
          <h2 className="rag-how-it-works-title">What would extend this</h2>
          <ul className="recon-roadmap-list">
            <li>
              <strong>FX deltas</strong> for multi-currency portfolios with
              tolerance bands per pair.
            </li>
            <li>
              <strong>Settlement calendars</strong> (T+1 vs T+2, holiday
              schedules) so date drift is judged against the right rule.
            </li>
            <li>
              <strong>SWIFT MT940 / MT535</strong> ingestion at the parse
              step - same downstream pipeline, different file format.
            </li>
            <li>
              <strong>Tolerance configuration per security type</strong>
              {" "}so equities, FX forwards, and bonds each get their own
              break thresholds.
            </li>
            <li>
              <strong>Audit log</strong> of analyst actions per break,
              feeding back into prompt examples.
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
