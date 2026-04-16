"use client";
import { useEffect, useRef } from "react";

/**
 * Thin gradient bar at the top of the viewport showing how far the user
 * has scrolled through the page. Updates via rAF-throttled scroll listener
 * and writes to a CSS custom property so the DOM is only touched once per frame.
 */
export default function ScrollProgressBar() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
      el.style.setProperty("--progress", progress.toString());
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="scroll-progress"
      aria-hidden="true"
      style={{ "--progress": 0 }}
    />
  );
}
