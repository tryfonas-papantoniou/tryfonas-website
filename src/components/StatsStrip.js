"use client";
import { useEffect, useRef, useState } from "react";

/**
 * A row of headline stats that animate a count-up when the strip
 * first scrolls into view. Reads `prefers-reduced-motion` and skips
 * the animation for users who opt out.
 */
const STATS = [
  { value: 6, suffix: "+", label: "years in enterprise", sub: "Accenture · Infosys · HEINEKEN" },
  { value: 3, suffix: "", label: "multinationals", sub: "across finance operations" },
  { value: 4, suffix: "+", label: "AI certifications", sub: "Cisco · Accenture · Harvard" },
  {
    value: 4,
    suffix: "",
    label: "AI projects",
    sub: "1 live · 3 in progress",
    href: "#projects",
  },
];

function CountUp({ target, suffix, play, duration = 1400 }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!play) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [play, target, duration]);

  return (
    <span>
      {value}
      {suffix}
    </span>
  );
}

export default function StatsStrip() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats-strip-wrap" aria-label="Career stats">
      <div ref={ref} className="stats-strip">
        {STATS.map((s, i) => {
          const inner = (
            <>
              <div className="stat-value">
                <CountUp target={s.value} suffix={s.suffix} play={visible} />
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </>
          );
          return s.href ? (
            <a
              key={i}
              href={s.href}
              className="stat-item stat-item-link"
              aria-label={`${s.value} ${s.label} — ${s.sub}. Jump to projects.`}
            >
              {inner}
            </a>
          ) : (
            <div key={i} className="stat-item">
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
