import Navigation from "@/components/Navigation";
import RagChat from "@/components/RagChat";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "RAG Knowledge Assistant — Tryfonas Papantoniou",
  description:
    "A live retrieval-augmented generation demo: ask questions about a fictional enterprise's order-to-cash policy and get cited, grounded answers from 12 indexed documents.",
};

/**
 * /projects/rag-demo
 *
 * A single-page demo of the RAG pipeline:
 *   Voyage embeddings → pluggable retriever → Claude Haiku 4.5.
 *
 * The chat widget is interactive; everything else on the page is
 * static context — what the system does, what's indexed, what's
 * under the hood. Keeping it visibly simple so visitors grasp the
 * architecture in 30 seconds.
 */
export default function RagDemoPage() {
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
          <h1 className="rag-page-title">RAG Knowledge Assistant</h1>
          <p className="rag-page-lead">
            Ask a question about a fictional enterprise's order-to-cash policy.
            Answers come from 12 indexed documents — credit limits, dunning
            cadences, dispute resolution, bad-debt provisioning — and every
            claim is cited back to the source chunk it came from.
          </p>

          <div className="rag-stack-row" aria-label="Tech stack">
            <span className="rag-stack-pill">
              <strong>Embeddings:</strong> Voyage AI · voyage-3
            </span>
            <span className="rag-stack-pill">
              <strong>Retriever:</strong> pluggable (in-memory + Pinecone)
            </span>
            <span className="rag-stack-pill">
              <strong>Answer model:</strong> Claude Haiku 4.5
            </span>
            <span className="rag-stack-pill">
              <strong>Runtime:</strong> Next.js · Vercel
            </span>
          </div>
        </header>

        <RagChat />

        <section className="rag-how-it-works" aria-label="How it works">
          <h2 className="rag-how-it-works-title">How it works</h2>
          <ol className="rag-pipeline">
            <li className="rag-step">
              <div className="rag-step-num">01</div>
              <div className="rag-step-title">Build-time indexing</div>
              <div className="rag-step-body">
                Twelve markdown policy documents are chunked by section, sent
                to Voyage as 1024-dimensional embeddings, and written to a
                compact JSON index shipped with the build.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">02</div>
              <div className="rag-step-title">Query-time retrieval</div>
              <div className="rag-step-body">
                Your question is embedded the same way, then the retriever
                ranks chunks by cosine similarity. The top four go into the
                prompt. A toggle swaps the in-memory backend for Pinecone —
                same interface, different store.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">03</div>
              <div className="rag-step-title">Grounded generation</div>
              <div className="rag-step-body">
                Claude Haiku 4.5 answers using only the retrieved chunks, with
                an explicit instruction to refuse when the corpus doesn't
                cover the question. Responses stream token-by-token.
              </div>
            </li>
            <li className="rag-step">
              <div className="rag-step-num">04</div>
              <div className="rag-step-title">Inline citations</div>
              <div className="rag-step-body">
                Every source chunk surfaces as a chip under the answer.
                Hovering shows the similarity score; clicking opens the full
                text so you can verify the model isn't making things up.
              </div>
            </li>
          </ol>
        </section>
      </main>
    </>
  );
}
