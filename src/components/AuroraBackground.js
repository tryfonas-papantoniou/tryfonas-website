"use client";
import { useEffect, useRef } from "react";

export default function AuroraBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const t = maxScroll > 0 ? scrollY / maxScroll : 0;

      // Purple: sweeps from top-right to bottom-left
      const b1x = 75 - t * 60;
      const b1y = 0 + t * 70;
      const b1o = (0.50 - t * 0.15).toFixed(3);

      // Blue: sweeps from left to center-right
      const b2x = 10 + t * 55;
      const b2y = 50 - t * 30;
      const b2o = (0.35 + t * 0.15).toFixed(3);

      // Teal: rises from bottom to center
      const b3x = 45 + t * 30;
      const b3y = 100 - t * 70;
      const b3o = (0.15 + t * 0.25).toFixed(3);

      // Orange: sweeps diagonally
      const b4x = 5 + t * 70;
      const b4y = 0 + t * 60;
      const b4o = (0.10 + t * 0.15).toFixed(3);

      // Pink: sweeps from right to left
      const b5x = 90 - t * 65;
      const b5y = 40 + t * 35;
      const b5o = (0.20 + t * 0.15).toFixed(3);

      // Green: appears in center as you scroll
      const b6x = 30 + t * 40;
      const b6y = 30 + t * 40;
      const b6o = (0.05 + t * 0.18).toFixed(3);

      el.style.background = [
        `radial-gradient(ellipse 90% 70% at ${b1x.toFixed(1)}% ${b1y.toFixed(1)}%, rgba(120, 50, 220, ${b1o}) 0%, transparent 55%)`,
        `radial-gradient(ellipse 80% 60% at ${b2x.toFixed(1)}% ${b2y.toFixed(1)}%, rgba(79, 110, 247, ${b2o}) 0%, transparent 50%)`,
        `radial-gradient(ellipse 75% 55% at ${b3x.toFixed(1)}% ${b3y.toFixed(1)}%, rgba(30, 190, 190, ${b3o}) 0%, transparent 50%)`,
        `radial-gradient(ellipse 55% 45% at ${b4x.toFixed(1)}% ${b4y.toFixed(1)}%, rgba(246, 153, 43, ${b4o}) 0%, transparent 40%)`,
        `radial-gradient(ellipse 65% 55% at ${b5x.toFixed(1)}% ${b5y.toFixed(1)}%, rgba(210, 70, 170, ${b5o}) 0%, transparent 45%)`,
        `radial-gradient(ellipse 50% 40% at ${b6x.toFixed(1)}% ${b6y.toFixed(1)}%, rgba(60, 200, 120, ${b6o}) 0%, transparent 45%)`,
      ].join(", ");

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    // Initial render
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        transition: "background 0.4s ease-out",
      }}
    />
  );
}
