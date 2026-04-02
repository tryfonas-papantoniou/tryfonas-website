import Navigation from "@/components/Navigation";

export const metadata = {
  title: "How I Built This Site — Tryfonas Papantoniou",
  description: "A transparent look at how I used AI tools to design, build, and deploy this portfolio site — without writing code manually.",
};

export default function HowIBuiltThis() {
  return (
    <>
      <Navigation />

      <section className="hero" style={{ minHeight: "auto", paddingTop: "8rem", paddingBottom: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          <span className="section-label">Behind the Scenes</span>
          <h1 style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: "3rem",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
          }}>
            How I Built This Site
          </h1>
          <p className="hero-description" style={{ maxWidth: "100%" }}>
            This site is itself a demonstration of what I do — using AI tools to build
            professional, production-grade software. Here&apos;s a transparent look at the
            process, tools, and decisions behind it.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <div className="build-story">
          <div className="build-section">
            <h2 className="build-heading">The Approach</h2>
            <p className="build-text">
              I&apos;m not a professional developer — and that&apos;s the point. This entire site
              was built through <strong>AI-assisted development</strong>: I described what I wanted,
              made design decisions, and directed the AI to write the code. Every component,
              animation, and layout was created through collaboration between me and Claude (Anthropic&apos;s AI).
            </p>
            <p className="build-text">
              This is exactly the skill I&apos;m positioning myself around — the ability to use AI
              as a force multiplier to produce real, working, professional-quality output without
              being a senior developer.
            </p>
          </div>

          <div className="build-section">
            <h2 className="build-heading">The Tech Stack</h2>
            <div className="build-stack-grid">
              <div className="build-stack-item">
                <h3>Next.js</h3>
                <p>React-based framework. The foundation of the site — handles routing, server-side rendering, and image optimization.</p>
              </div>
              <div className="build-stack-item">
                <h3>Vercel</h3>
                <p>Hosting and deployment. Every push to GitHub automatically builds and deploys the site within seconds.</p>
              </div>
              <div className="build-stack-item">
                <h3>Cursor</h3>
                <p>AI-powered code editor. My primary workspace — used for all file editing, terminal commands, and project navigation.</p>
              </div>
              <div className="build-stack-item">
                <h3>Claude (Anthropic)</h3>
                <p>AI assistant that wrote the code. I described the design, provided feedback, and Claude generated every component, style, and animation.</p>
              </div>
              <div className="build-stack-item">
                <h3>Git & GitHub</h3>
                <p>Version control. Every change is tracked, and the repository connects to Vercel for automatic deployments.</p>
              </div>
              <div className="build-stack-item">
                <h3>Tailwind CSS</h3>
                <p>Utility-first CSS framework included in the project setup for styling flexibility.</p>
              </div>
            </div>
          </div>

          <div className="build-section">
            <h2 className="build-heading">The Process</h2>
            <div className="build-timeline">
              <div className="build-step">
                <div className="build-step-number">01</div>
                <div className="build-step-content">
                  <h3>Infrastructure Setup</h3>
                  <p>Set up the Next.js project, connected GitHub to Vercel, pointed my domain from Hostinger — all guided by Claude step by step.</p>
                </div>
              </div>
              <div className="build-step">
                <div className="build-step-number">02</div>
                <div className="build-step-content">
                  <h3>Design Iteration</h3>
                  <p>Claude generated HTML previews of the landing page. I reviewed each version, gave feedback on positioning, tone, and visual style. We went through 7+ iterations.</p>
                </div>
              </div>
              <div className="build-step">
                <div className="build-step-number">03</div>
                <div className="build-step-content">
                  <h3>Component Building</h3>
                  <p>Once the design was approved, Claude converted the HTML into React components — Navigation, ScrollReveal, ParticleBackground, and more.</p>
                </div>
              </div>
              <div className="build-step">
                <div className="build-step-number">04</div>
                <div className="build-step-content">
                  <h3>Polish & Effects</h3>
                  <p>Added the animated gradient borders (inspired by Arc Raiders), particle background, typing animations, scroll reveals, grain texture, and dark/light mode.</p>
                </div>
              </div>
              <div className="build-step">
                <div className="build-step-number">05</div>
                <div className="build-step-content">
                  <h3>Deploy & Iterate</h3>
                  <p>Pushed to GitHub, auto-deployed via Vercel, tested on desktop and mobile, and continued refining.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="build-section">
            <h2 className="build-heading">What This Demonstrates</h2>
            <p className="build-text">
              Building this site wasn&apos;t about proving I can write React from scratch — it was
              about demonstrating a modern, practical skill: <strong>the ability to direct AI to produce
              professional results</strong>. I made every design decision, provided the content and
              context, managed the project, and quality-checked every output. The AI handled
              the syntax.
            </p>
            <p className="build-text">
              This is the same approach I apply to building AI tools — understanding the problem,
              designing the solution, and leveraging AI to execute it at a level that would
              traditionally require a full development team.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
          <a href="/" className="btn-primary glow-border">← Back to Home</a>
        </div>
      </section>

      <footer>
        <p>© 2026 Tryfonas Papantoniou. Built with Next.js & AI — deployed on Vercel.</p>
      </footer>
    </>
  );
}