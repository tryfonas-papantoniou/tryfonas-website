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
            don&apos;t, operations analysts spend hours finding and explaining
            breaks. This tool runs the comparison in rule-based code
            (reproducible and auditable) and uses Claude only to explain
            each break in plain English, with a concrete next step for the
            analyst.
          </p>

          <div className="rag-stack-row" aria-label="Tech stack">
            <span className="rag-stack-pill">
              <strong>Comparison:</strong> rule-based, field-by-field
            </span>
            <span className="rag-stack-pill">
              <strong>Explanations:</strong> Claude Haiku 4.5
            </span>
            <span className="rag-stack-pill">
              <strong>Output:</strong> schema-validated
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
                Both files arrive as structured records. In production these
                would be SWIFT MT940, CSV, or SFTP file drops; here they
                are synthetic records so the underlying logic is visible
                end to end.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">02</div>
              <div className="rag-step-title">Match by trade identifier</div>
              <div className="rag-step-body">
                Records are matched on symbol and trade date. Anything that
                exists on only one side is flagged immediately as missing.
                Anything on both sides moves to a field-by-field comparison.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">03</div>
              <div className="rag-step-title">Field-by-field comparison</div>
              <div className="rag-step-body">
                Quantity, price, and settlement date are compared. Prices
                use a tolerance band to avoid flagging rounding differences.
                Every break records the field, both values, and the source
                rows - everything an auditor would need to verify the
                finding.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">04</div>
              <div className="rag-step-title">Explain with structured output</div>
              <div className="rag-step-body">
                Only the breaks are sent to Claude, alongside a strict
                response schema. The model must return a rationale, a
                suggested action, and a severity for each break - no
                free-form text. Cost scales with the number of breaks, not
                the size of the input files.
              </div>
            </li>
          </ol>
        </section>

        <section className="recon-roadmap" aria-label="How the tool could be extended">
          <h2 className="rag-how-it-works-title">How the tool could be extended</h2>
          <ul className="recon-roadmap-list">
            <li>
              <strong>FX deltas</strong> for multi-currency portfolios, with
              tolerance bands configured per currency pair.
            </li>
            <li>
              <strong>Settlement calendars</strong> (T+1 vs T+2, market
              holiday schedules) so date drift is evaluated against the
              correct settlement convention.
            </li>
            <li>
              <strong>SWIFT MT940 / MT535</strong> file ingestion - same
              downstream processing, different input format.
            </li>
            <li>
              <strong>Tolerance configuration per security type</strong>
              {" "}so equities, FX forwards, and bonds each have their own
              break thresholds.
            </li>
            <li>
              <strong>Audit trail</strong> of analyst actions per break,
              retained for compliance and used to refine future
              explanations.
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
