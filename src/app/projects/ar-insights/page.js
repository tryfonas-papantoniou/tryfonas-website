import Navigation from "@/components/Navigation";
import ARDashboard from "@/components/ARDashboard";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "AR Insights Dashboard",
  description:
    "An agentic AI demo over a synthetic accounts receivable portfolio: ask plain-English questions about exposure, aging, DSO, or specific customers and Claude calls the right analytical functions to answer with cited data and inline charts.",
};

/**
 * /projects/ar-insights
 *
 * Agentic AR analytics demo. The user asks a natural-language
 * question; Claude Haiku 4.5 plans a sequence of tool calls over a
 * fixed library of pure analytical functions; the response weaves
 * together the answer, any inline charts the tools suggested, and a
 * full audit panel of the underlying data.
 *
 * The architectural point: GenAI as an orchestration layer over
 * vetted analytical primitives. Numbers always come from code; the
 * model writes the prose and picks the route.
 */
export default function ARInsightsPage() {
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
          <h1 className="rag-page-title">AR Insights Dashboard</h1>
          <p className="rag-page-lead">
            A synthetic accounts receivable portfolio for a fictional B2B
            company. Ask in plain English about total exposure, aging,
            collection trends, or any specific customer. The assistant
            picks one or more analytical functions, runs them, and
            answers in a few sentences with inline charts and a full
            audit trail of the data behind every number.
          </p>

          <div className="rag-stack-row" aria-label="Tech stack">
            <span className="rag-stack-pill">
              <strong>Pattern:</strong> agentic tool-use loop
            </span>
            <span className="rag-stack-pill">
              <strong>Functions:</strong> 6 vetted analytical primitives
            </span>
            <span className="rag-stack-pill">
              <strong>Model:</strong> Claude Haiku 4.5
            </span>
            <span className="rag-stack-pill">
              <strong>Charts:</strong> inline SVG, no library
            </span>
          </div>
        </header>

        <ARDashboard />

        <section className="rag-how-it-works" aria-label="How it works">
          <h2 className="rag-how-it-works-title">How it works</h2>
          <ol className="rag-pipeline">
            <li className="rag-step">
              <div className="rag-step-num">01</div>
              <div className="rag-step-title">Question arrives</div>
              <div className="rag-step-body">
                A finance lead types a question - everyday English, no
                SQL. The recent conversation history travels with it so
                follow-up questions work naturally.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">02</div>
              <div className="rag-step-title">Plan the tool calls</div>
              <div className="rag-step-body">
                Claude sees the question and a fixed catalogue of six
                analytical functions, each with a strict input schema.
                It picks one or chains a sequence - say, a customer
                ranking followed by that customer&apos;s detail.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">03</div>
              <div className="rag-step-title">Execute against the dataset</div>
              <div className="rag-step-body">
                Each function is pure deterministic code over the
                in-memory ledger. It returns structured records, a
                summary line, and (where useful) a chart specification
                the front end can render.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">04</div>
              <div className="rag-step-title">Synthesise and cite</div>
              <div className="rag-step-body">
                Claude writes a two-to-four sentence answer using the
                tools&apos; output. The UI renders the charts inline and
                opens an audit panel listing every function call,
                every argument, and every record returned.
              </div>
            </li>
          </ol>
        </section>

        <section className="recon-roadmap" aria-label="How the tool could be extended">
          <h2 className="rag-how-it-works-title">How the tool could be extended</h2>
          <ul className="recon-roadmap-list">
            <li>
              <strong>Live data sources</strong> - swap the synthetic
              dataset for a connector to the customer&apos;s ERP (SAP,
              Oracle, NetSuite) with read-only scoping.
            </li>
            <li>
              <strong>More analytical primitives</strong> - cohort
              analysis, payment behaviour clustering, dispute root-cause
              counting, customer lifetime value.
            </li>
            <li>
              <strong>Action layer</strong> - on top of the read-only
              read primitives, gated tools to draft a dunning email,
              place a customer on credit hold, or open a dispute ticket.
            </li>
            <li>
              <strong>Saved views and alerts</strong> - persist a
              question as a recurring report, notify on threshold
              breaches (utilisation over 90%, days-overdue trend
              reversing).
            </li>
            <li>
              <strong>Permission-aware answers</strong> - restrict which
              functions a given role can call, and which customer set
              they can see.
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
