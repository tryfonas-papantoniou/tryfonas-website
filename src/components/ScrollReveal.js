"use client";
import { useEffect, useRef } from "react";

export default function ScrollReveal({ children, className = "", stagger = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (stagger) {
              const children = entry.target.querySelectorAll(".fade-up");
              children.forEach((child) => child.classList.add("visible"));
            } else {
              entry.target.classList.add("visible");
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [stagger]);

  const classes = stagger
    ? `stagger-children ${className}`
    : `fade-up ${className}`;

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
