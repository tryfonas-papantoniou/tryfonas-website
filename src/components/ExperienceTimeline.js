import ScrollReveal from "./ScrollReveal";
import { Building2 } from "lucide-react";

/**
 * Vertical career timeline. Dates and role summaries are placeholders —
 * update them with your real employment history. The component stays
 * as-is; you only need to edit the EXPERIENCE array below.
 */
const EXPERIENCE = [
  {
    company: "Accenture",
    role: "Change Management · Tech",
    period: "Nov 2025 — Present",
    location: "Kraków, Poland",
    summary:
      "Moved into tech-focused change management — guiding how enterprise teams adopt new systems and ways of working. The bridge between six years of operational experience and the AI tools I'm now building.",
    accent: "#F6992B",
  },
  {
    company: "Accenture",
    role: "Senior C&C Specialist · SME · Pharmaceutical",
    period: "Aug 2022 — Nov 2025",
    location: "Kraków, Poland",
    summary:
      "Subject-matter expert on a pharmaceutical client's credit & collections operation — $50M+ recovered across 250+ clients. Three consecutive Excellence Awards (2023, 2024, 2025). The day-to-day that exposed every inefficiency an LLM could solve.",
    accent: "#7B93FA",
  },
  {
    company: "Infosys",
    role: "C&C Process Specialist · Shipping & Maritime",
    period: "Nov 2021 — Jul 2022",
    location: "Kraków, Poland",
    summary:
      "Credit & collections for a global shipping and maritime client. Wrote the SOP documentation that powered the transition of operations from Greece to Poland — my first real taste of large-scale process design.",
    accent: "#4F6EF7",
  },
  {
    company: "HEINEKEN HGSS",
    role: "Junior C&C Specialist · FMCG",
    period: "Feb 2020 — Oct 2021",
    location: "Kraków, Poland",
    summary:
      "Managed a 240+ customer portfolio in order-to-cash for one of the world's largest brewers. First corporate role after university — where I learned how finance operations actually run inside a multinational.",
    accent: "#22c55e",
  },
];

export default function ExperienceTimeline() {
  return (
    <section id="experience">
      <ScrollReveal>
        <span className="section-label">Experience</span>
        <h2 className="section-title">Six Years Inside Big Enterprise</h2>
        <p className="section-subtitle">
          Before building AI tools, I spent six years inside three multinationals
          — watching how large organizations actually operate. That context is
          the difference between AI that looks good in a demo and AI that
          survives a production rollout.
        </p>
      </ScrollReveal>
      <ScrollReveal stagger>
        <ol className="timeline">
          {EXPERIENCE.map((e, i) => (
            <li key={i} className="timeline-item fade-up">
              <div
                className="timeline-marker"
                style={{ "--marker-color": e.accent }}
                aria-hidden="true"
              >
                <Building2 size={16} strokeWidth={2} />
              </div>
              <div className="timeline-card glow-border">
                <div className="timeline-card-head">
                  <h3 className="timeline-company">{e.company}</h3>
                  <span className="timeline-period">{e.period}</span>
                </div>
                <div className="timeline-meta">
                  <span className="timeline-role">{e.role}</span>
                  <span className="timeline-dot" aria-hidden="true">·</span>
                  <span className="timeline-location">{e.location}</span>
                </div>
                <p className="timeline-summary">{e.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </ScrollReveal>
    </section>
  );
}
