import Image from "next/image";
import Navigation from "@/components/Navigation";
import ScrollReveal from "@/components/ScrollReveal";
import ParticleBackground from "@/components/ParticleBackground";
import TypingAnimation from "@/components/TypingAnimation";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <>
      <Navigation />

      {/* HERO */}
      <section className="hero">
        <ParticleBackground />
        <div className="hero-inner">
          <div className="hero-content">
            <h1>
              I&apos;m Tryfonas<span className="highlight">.</span>
              <br />
              I build{" "}
              <TypingAnimation
                phrases={["AI tools", "RAG systems", "chatbots", "smart automation"]}
                typingSpeed={90}
                deletingSpeed={50}
                pauseTime={2200}
              />
              <br />
              that solve real problems
            </h1>
            <p className="hero-description">
              Computer Science graduate building enterprise-grade AI solutions —
              from RAG systems to intelligent chatbots. With 6+ years of
              corporate experience, I understand the real problems that AI is
              best positioned to solve.
            </p>
            <div className="hero-buttons">
              <a href="#projects" className="btn-primary glow-border">
                See What I&apos;ve Built →
              </a>
              <a href="#about" className="btn-secondary glow-border">
                About Me
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-header">
                <span className="hero-card-dot"></span>
                <span className="hero-card-dot"></span>
                <span className="hero-card-dot"></span>
                <span className="hero-card-title">rag_pipeline.py</span>
              </div>
              <div className="code-line">
                <span className="comment"># RAG-Powered Knowledge Assistant</span>
              </div>
              <div className="code-line">
                <span className="keyword">from</span> anthropic{" "}
                <span className="keyword">import</span>{" "}
                <span className="function">Anthropic</span>
              </div>
              <div className="code-line">
                <span className="keyword">from</span> pinecone{" "}
                <span className="keyword">import</span>{" "}
                <span className="function">Pinecone</span>
              </div>
              <div className="code-line">&nbsp;</div>
              <div className="code-line">
                <span className="keyword">class</span>{" "}
                <span className="function">KnowledgeAssistant</span>:
              </div>
              <div className="code-line">
                &nbsp;&nbsp;<span className="keyword">def</span>{" "}
                <span className="function">query</span>(self, question):
              </div>
              <div className="code-line">
                &nbsp;&nbsp;&nbsp;&nbsp;docs{" "}
                <span className="operator">=</span> self.index.
                <span className="function">query</span>(question)
              </div>
              <div className="code-line">
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span>{" "}
                self.claude.<span className="function">generate</span>(
              </div>
              <div className="code-line">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prompt
                <span className="operator">=</span>question,
              </div>
              <div className="code-line">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;context
                <span className="operator">=</span>docs
              </div>
              <div className="code-line">
                &nbsp;&nbsp;&nbsp;&nbsp;)<span className="typing-cursor"></span>
              </div>
            </div>
            <div className="floating-badge badge-1 glow-border">
              <div className="badge-icon">🤖</div>
              <div>
                <div style={{ fontWeight: 600 }}>RAG Pipeline</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Live Demo
                </div>
              </div>
            </div>
            <div className="floating-badge badge-2 glow-border">
              <div className="badge-icon">⚡</div>
              <div>
                <div style={{ fontWeight: 600 }}>Built with AI</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Cursor + Claude
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <ScrollReveal>
          <span className="section-label">About Me</span>
          <h2 className="section-title">The Short Version</h2>
        </ScrollReveal>
        <div className="about-layout">
          <ScrollReveal>
            <div className="about-text">
              <p>
                I&apos;m a <strong>Computer Science graduate</strong> from
                Greece, currently based in Kraków, Poland. My passion is{" "}
                <strong>artificial intelligence</strong> — specifically building
                practical AI tools that solve real business problems.
              </p>
              <p>
                I spent 6+ years working at major multinationals like{" "}
                <strong>Accenture</strong>, <strong>Infosys</strong>, and{" "}
                <strong>HEINEKEN</strong>, where I gained deep understanding of
                how large enterprises operate — the processes, the pain points,
                and the communication dynamics that make or break projects.
              </p>
              <p>
                That corporate experience gave me something most AI builders
                don&apos;t have:{" "}
                <strong>
                  I know what the actual problems look like from the inside.
                </strong>{" "}
                Now I&apos;m combining that real-world understanding with
                hands-on AI development — building RAG systems, chatbots, and
                automation tools inspired by the problems I&apos;ve seen
                firsthand.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="about-photo">
              <div className="about-photo-inner">
                <Image
                  src="/tryfonas.jpg"
                  alt="Tryfonas Papantoniou"
                  width={240}
                  height={240}
                  priority
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects">
        <ScrollReveal>
          <span className="section-label">Projects</span>
          <h2 className="section-title">AI Tools I&apos;m Building</h2>
          <p className="section-subtitle">
            Each project demonstrates a different aspect of modern AI engineering
            — from retrieval-augmented generation to document intelligence and
            agentic workflows.
          </p>
          <div className="projects-intro">
            These tools are inspired by real inefficiencies I encountered during
            my 6+ years in enterprise finance operations — manual processes, slow
            decisions, and inconsistent data handling that are exactly the kind
            of problems AI can solve.
          </div>
        </ScrollReveal>
        <ScrollReveal stagger>
          <div className="projects-grid">

            {/* O2C Policy Assistant */}
            <div className="project-card glow-border fade-up">
              <div className="project-info">
                <div className="project-info-top">
                  <div className="project-tags">
                    <span className="project-tag">LLM</span>
                    <span className="project-tag">RAG</span>
                    <span className="project-tag">Anthropic API</span>
                  </div>
                  <span className="project-status status-soon">Coming Soon</span>
                </div>
                <h3>O2C Policy Assistant</h3>
                <p>
                  AI chatbot powered by RAG that can answer questions about
                  Order-to-Cash policies — invoicing, collections, dispute
                  resolution — with source citations.
                </p>
              </div>
              <div className="project-preview project-preview-1">
                <div className="chat-preview">
                  <div className="chat-msg chat-msg-user">
                    What&apos;s the credit limit policy?
                  </div>
                  <div className="chat-msg chat-msg-ai">
                    Limits are based on payment history and revenue per §3.2.
                    <div><span className="chat-source-tag">📄 Credit Risk Policy</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Classifier */}
            <div className="project-card glow-border fade-up">
              <div className="project-info">
                <div className="project-info-top">
                  <div className="project-tags">
                    <span className="project-tag">Document AI</span>
                    <span className="project-tag">Classification</span>
                    <span className="project-tag">Automation</span>
                  </div>
                  <span className="project-status status-soon">Coming Soon</span>
                </div>
                <h3>Invoice Classifier</h3>
                <p>
                  Automated invoice categorization and routing using LLMs —
                  turning hours of manual document processing into seconds.
                </p>
              </div>
              <div className="project-preview project-preview-2">
                <div className="invoice-preview">
                  <div className="invoice-preview-header">
                    <span className="invoice-filename">INV-2024-0891.pdf</span>
                    <span className="invoice-badge-classified">✓ Classified</span>
                  </div>
                  <div className="invoice-card">
                    <div className="invoice-row">
                      <span className="invoice-label">Vendor</span>
                      <span className="invoice-value">Nexoris S.A.</span>
                    </div>
                    <div className="invoice-row">
                      <span className="invoice-label">Status</span>
                      <span className="invoice-status">✓ Auto-approved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AR Insights Dashboard */}
            <div className="project-card glow-border fade-up">
              <div className="project-info">
                <div className="project-info-top">
                  <div className="project-tags">
                    <span className="project-tag">Agentic AI</span>
                    <span className="project-tag">Data Analysis</span>
                    <span className="project-tag">NLP</span>
                  </div>
                  <span className="project-status status-soon">Coming Soon</span>
                </div>
                <h3>AR Insights Dashboard</h3>
                <p>
                  AI-powered accounts receivable analytics — ask questions about
                  financial data in plain English and get intelligent
                  visualizations.
                </p>
              </div>
              <div className="project-preview project-preview-3">
                <div className="ar-preview">
                  <div className="ar-preview-header">
                    <span className="ar-title">AR Overview</span>
                  </div>
                  <div className="ar-metric">
                    <span className="ar-metric-value">$2.4M</span>
                    <span className="ar-metric-change">↑ 12%</span>
                  </div>
                  <div className="ar-bars">
                    {[35, 55, 70, 50, 85, 60, 45, 75, 90].map((h, i) => (
                      <div
                        key={i}
                        className={`ar-bar${i === 8 ? " ar-bar-highlight" : ""}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="ar-ai-insight">
                    <span className="ar-ai-icon">✦</span>
                    3 accounts flagged at risk of late payment
                  </div>
                </div>
              </div>
            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* SKILLS */}
      <section id="skills">
        <ScrollReveal>
          <span className="section-label">Technical Skills</span>
          <h2 className="section-title">What I Work With</h2>
          <p className="section-subtitle">
            A growing AI toolkit backed by a Computer Science degree and
            hands-on project experience.
          </p>
        </ScrollReveal>
        <ScrollReveal stagger>
          <div className="skills-grid">
            <div className="skill-card glow-border fade-up">
              <div className="skill-card-icon" style={{ background: "rgba(79, 110, 247, 0.12)" }}>🧠</div>
              <h3>Large Language Models</h3>
              <p>Building applications with LLMs — prompt engineering, system design, and API integrations.</p>
              <div className="tech-list">
                <span className="tech-tag">Claude API</span>
                <span className="tech-tag">Prompt Engineering</span>
                <span className="tech-tag">System Prompts</span>
              </div>
            </div>
            <div className="skill-card glow-border fade-up">
              <div className="skill-card-icon" style={{ background: "rgba(139, 92, 246, 0.12)" }}>🔍</div>
              <h3>RAG & Vector Search</h3>
              <p>Building retrieval-augmented generation pipelines — embedding documents, vector storage, and context-aware retrieval.</p>
              <div className="tech-list">
                <span className="tech-tag">Pinecone</span>
                <span className="tech-tag">Embeddings</span>
                <span className="tech-tag">Vector Search</span>
              </div>
            </div>
            <div className="skill-card glow-border fade-up">
              <div className="skill-card-icon" style={{ background: "rgba(246, 153, 43, 0.12)" }}>🤖</div>
              <h3>Agentic AI</h3>
              <p>Designing AI agents that can reason, use tools, and execute multi-step workflows autonomously.</p>
              <div className="tech-list">
                <span className="tech-tag">Tool Use</span>
                <span className="tech-tag">Multi-step Reasoning</span>
                <span className="tech-tag">Workflow Automation</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal stagger>
          <div className="skills-grid-bottom">
            <div className="skill-card glow-border fade-up">
              <div className="skill-card-icon" style={{ background: "rgba(34, 197, 94, 0.12)" }}>💻</div>
              <h3>Web Development</h3>
              <p>Building and deploying web applications using modern frameworks and hosting platforms.</p>
              <div className="tech-list">
                <span className="tech-tag">Next.js</span>
                <span className="tech-tag">React</span>
                <span className="tech-tag">Tailwind CSS</span>
                <span className="tech-tag">Vercel</span>
              </div>
            </div>
            <div className="skill-card glow-border fade-up">
              <div className="skill-card-icon" style={{ background: "rgba(236, 72, 153, 0.12)" }}>🛠️</div>
              <h3>AI-Assisted Development</h3>
              <p>Using AI as a development partner — turning ideas into working software through AI collaboration.</p>
              <div className="tech-list">
                <span className="tech-tag">Cursor</span>
                <span className="tech-tag">Claude</span>
                <span className="tech-tag">AI Pair Programming</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* EDUCATION */}
      <section id="education">
        <ScrollReveal>
          <span className="section-label">Credentials</span>
          <h2 className="section-title">Education, Trainings & Certifications</h2>
          <p className="section-subtitle">
            Formal education in Computer Science, complemented by targeted AI
            certifications from industry leaders.
          </p>
        </ScrollReveal>
        <div className="education-layout">
          <ScrollReveal stagger>
            <div className="edu-column">
              <h3>Education</h3>
              <div className="edu-item glow-border fade-up">
                <div className="edu-icon" style={{ background: "rgba(79, 110, 247, 0.12)" }}>
                  <span className="edu-icon-emoji">🎓</span>
                </div>
                <div className="edu-info">
                  <h4>BSc Computer Science</h4>
                  <p>University of Macedonia, Thessaloniki, Greece</p>
                </div>
              </div>
              <div className="edu-item glow-border fade-up">
                <div className="edu-icon" style={{ background: "rgba(139, 92, 246, 0.12)" }}>
                  <span className="edu-icon-emoji">🌍</span>
                </div>
                <div className="edu-info">
                  <h4>Erasmus+ — Business Administration</h4>
                  <p>BA School of Business & Finance, Riga, Latvia</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal stagger>
            <div className="edu-column">
              <h3>AI Trainings & Certifications</h3>
              <div className="edu-item glow-border fade-up">
                <div className="edu-icon" style={{ background: "rgba(34, 197, 94, 0.12)" }}>
                  <span className="edu-icon-emoji">🔧</span>
                </div>
                <div className="edu-info">
                  <h4>AI Technical Practitioner (AITECH)</h4>
                  <p>Cisco — 2026</p>
                </div>
              </div>
              <div className="edu-item glow-border fade-up">
                <div className="edu-icon" style={{ background: "rgba(236, 72, 153, 0.12)" }}>
                  <span className="edu-icon-emoji">💼</span>
                </div>
                <div className="edu-info">
                  <h4>AI Business Practitioner (AIBIZ)</h4>
                  <p>Cisco — 2026</p>
                </div>
              </div>
              <div className="edu-item glow-border fade-up">
                <div className="edu-icon" style={{ background: "rgba(246, 153, 43, 0.12)" }}>
                  <span className="edu-icon-emoji">🤖</span>
                </div>
                <div className="edu-info">
                  <h4>Reinvention with Agentic AI</h4>
                  <p>Accenture — 2026</p>
                </div>
              </div>
              <div className="edu-item glow-border fade-up">
                <div className="edu-icon" style={{ background: "rgba(220, 38, 38, 0.12)" }}>
                  <span className="edu-icon-emoji">🏛️</span>
                </div>
                <div className="edu-info">
                  <h4>CS50 ReadyPlayer50</h4>
                  <p>Harvard University — 2023</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <ScrollReveal>
          <span className="section-label">Contact</span>
          <h2 className="section-title">Let&apos;s Connect</h2>
          <p className="section-subtitle">
            Looking for my next role in AI — building tools, implementing
            solutions, and bridging the gap between technology and business.
            Let&apos;s talk.
          </p>
          <div className="contact-links">
            <a href="mailto:tryfonaspapantoniou@gmail.com" className="contact-link glow-border">
              ✉️ Email
            </a>
            <a href="https://linkedin.com/in/tryfonaspapantoniou" className="contact-link glow-border" target="_blank" rel="noopener noreferrer">
              💼 LinkedIn
            </a>
            <a href="https://github.com/tryfonas-papantoniou" className="contact-link glow-border" target="_blank" rel="noopener noreferrer">
              🔗 GitHub
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer>
        <p>
          © 2026 Tryfonas Papantoniou. Built with Next.js & AI — deployed on Vercel.
          {" · "}
          <a href="/how-i-built-this" style={{ color: "var(--accent)", textDecoration: "none" }}>
            How I Built This Site
          </a>
        </p>
      </footer>
      <BackToTop />
    </>
  );
}
