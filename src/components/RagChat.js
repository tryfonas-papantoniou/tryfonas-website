"use client";

import { useEffect, useRef, useState } from "react";
import { Send, FileText, AlertTriangle, RefreshCw } from "lucide-react";

/**
 * The chat surface for the RAG demo.
 *
 * Conversation state lives in the component. The last six turns are
 * sent to the API on each request so follow-up questions stay in
 * context, but the authoritative knowledge is always the retrieved
 * chunks — we don't try to build a long-running conversation agent.
 *
 * The response is NDJSON: each line is a tagged event (`sources`,
 * `text`, `done`, `error`). Sources arrive first, then text tokens
 * stream in, then a `done` event closes the stream.
 */

const STARTER_QUESTIONS = [
  "Who approves a credit limit above 1M EUR?",
  "What triggers an automatic credit hold?",
  "When do we escalate a dispute?",
  "How is the bad debt provision calculated?",
];

export default function RagChat() {
  const [messages, setMessages] = useState([]); // {role, content, sources?}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backend, setBackend] = useState("in-memory");
  const [expandedSources, setExpandedSources] = useState({}); // sourceId -> open
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the transcript scrolled to the bottom as new content streams in.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function ask(question) {
    if (!question || loading) return;
    setError(null);
    setInput("");

    // Push the user turn immediately so it shows up while we wait
    // on the first network byte. The assistant placeholder goes in
    // at the same time and is mutated in place as tokens arrive.
    const userTurn = { role: "user", content: question };
    const assistantTurn = { role: "assistant", content: "", sources: [], done: false };
    const nextMessages = [...messages, userTurn, assistantTurn];
    setMessages(nextMessages);
    setLoading(true);

    // Build the history to send: everything before this turn, plus
    // the new user turn. We cap server-side at six turns but send
    // everything — the server trims.
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    try {
      const resp = await fetch(`/api/rag?backend=${backend}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question, history }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ message: "Request failed" }));
        throw new Error(err.message || `HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // NDJSON parsing — split on newlines, keep the last partial
        // line in the buffer for the next chunk.
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let msg;
          try {
            msg = JSON.parse(line);
          } catch {
            continue;
          }
          if (msg.type === "sources") {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                sources: msg.sources,
              };
              return copy;
            });
          } else if (msg.type === "text") {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                content: copy[copy.length - 1].content + msg.text,
              };
              return copy;
            });
          } else if (msg.type === "done") {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                done: true,
              };
              return copy;
            });
          } else if (msg.type === "error") {
            throw new Error(msg.message);
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong.");
        // Strip the empty assistant placeholder if the stream failed
        // before any text arrived — better UX than leaving a blank bubble.
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant" && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    } finally {
      setLoading(false);
      // Return focus to the input so power users can keep typing.
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask(input.trim());
  }

  function reset() {
    setMessages([]);
    setError(null);
    setExpandedSources({});
    inputRef.current?.focus();
  }

  return (
    <div className="rag-chat glow-border">
      <div className="rag-chat-head">
        <div className="rag-chat-title">
          <span className="rag-chat-dot" aria-hidden="true" />
          <span>Order-to-Cash knowledge assistant</span>
        </div>
        <div className="rag-chat-controls">
          <label className="rag-backend-toggle">
            <span>Retriever</span>
            <select
              value={backend}
              onChange={(e) => setBackend(e.target.value)}
              aria-label="Retrieval backend"
            >
              <option value="in-memory">In-memory</option>
              <option value="pinecone">Pinecone</option>
            </select>
          </label>
          {messages.length > 0 && (
            <button
              type="button"
              className="rag-reset"
              onClick={reset}
              aria-label="Reset conversation"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="rag-chat-scroller" ref={scrollerRef}>
        {messages.length === 0 && (
          <div className="rag-empty-state">
            <p className="rag-empty-lead">
              Ask a question about the fictional company's O2C policy. The
              assistant only answers from the 12 indexed documents.
            </p>
            <div className="rag-starter-grid">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="rag-starter"
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
          <div key={i} className={`rag-msg rag-msg-${m.role}`}>
            <div className="rag-msg-bubble">
              {m.content || (m.role === "assistant" && !m.done && <TypingDots />)}
            </div>
            {m.role === "assistant" && m.sources && m.sources.length > 0 && (
              <SourcesStrip
                sources={m.sources}
                expanded={expandedSources}
                onToggle={(id) =>
                  setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }))
                }
              />
            )}
          </div>
        ))}

        {error && (
          <div className="rag-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <form className="rag-chat-input" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about credit limits, dunning, disputes…"
          aria-label="Your question"
          maxLength={1000}
          disabled={loading}
        />
        <button
          type="submit"
          className="rag-send"
          aria-label="Send question"
          disabled={loading || !input.trim()}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="rag-typing" aria-label="Thinking…">
      <span />
      <span />
      <span />
    </span>
  );
}

function SourcesStrip({ sources, expanded, onToggle }) {
  return (
    <div className="rag-sources">
      <div className="rag-sources-label">Sources</div>
      <div className="rag-sources-chips">
        {sources.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`rag-source-chip${expanded[s.id] ? " open" : ""}`}
            onClick={() => onToggle(s.id)}
            aria-expanded={!!expanded[s.id]}
          >
            <FileText size={12} />
            <span className="rag-source-idx">[{s.index}]</span>
            <span className="rag-source-title">{s.docTitle}</span>
            <span className="rag-source-score">{s.score.toFixed(2)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
