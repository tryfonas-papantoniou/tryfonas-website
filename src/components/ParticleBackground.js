"use client";
import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let stars = [];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // --- CURSOR INTERACTION ---
    // When the cursor is over the viewport, particles gently reorient
    // their velocity toward the cursor AND speed up by ~18% relative
    // to their base speed, so the field reads as "flowing toward you."
    // On mousedown, a radial impulse shoves nearby particles outward
    // away from the click point (distance-based falloff), then
    // `speedDamping` eases every particle's magnitude back toward its
    // target — base speed normally, boosted speed while cursor is on
    // screen — so bursts decay gracefully over ~1–2 seconds.
    let mouseX = 0;
    let mouseY = 0;
    let cursorActive = false;
    const cursorPull = 0.012; // direction blend factor per frame
    const cursorBoost = 1.18; // ~18% faster when heading to cursor
    const clickRadius = 420; // pixel radius affected by a click
    const clickStrength = 7; // peak velocity impulse at click center
    const speedDamping = 0.02; // per-frame pull toward target magnitude

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Palette tuned to match an aurora / night-sky reference:
    // mostly cool whites & pale blues, with a few warm accents.
    const palette = [
      { r: 255, g: 255, b: 255 }, // pure white
      { r: 226, g: 232, b: 255 }, // cool white
      { r: 190, g: 210, b: 255 }, // pale blue
      { r: 170, g: 190, b: 255 }, // ice blue
      { r: 235, g: 220, b: 255 }, // soft lavender
      { r: 255, g: 220, b: 190 }, // warm accent (rare)
    ];

    const createStars = () => {
      stars = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Denser field for a proper starfield look
      const count = Math.floor((w * h) / 4500);

      for (let i = 0; i < count; i++) {
        // Tier the sizes: lots of tiny pin-pricks, fewer medium, rare bright stars
        const tierRoll = Math.random();
        let radius, baseOpacity, hasGlow;
        if (tierRoll < 0.78) {
          // tiny pin-prick stars
          radius = Math.random() * 0.6 + 0.3;
          baseOpacity = Math.random() * 0.5 + 0.25;
          hasGlow = false;
        } else if (tierRoll < 0.97) {
          // medium stars
          radius = Math.random() * 0.8 + 0.9;
          baseOpacity = Math.random() * 0.35 + 0.55;
          hasGlow = true;
        } else {
          // rare bright "hero" stars
          radius = Math.random() * 1.1 + 1.6;
          baseOpacity = Math.random() * 0.25 + 0.75;
          hasGlow = true;
        }

        // Warm-tinted stars should be rare
        const colorRoll = Math.random();
        let color;
        if (colorRoll < 0.06) color = palette[5];
        else color = palette[Math.floor(Math.random() * 5)];

        // --- PARTICLE DRIFT MODE ---
        // Each particle picks its own direction (any angle) and its own
        // speed. Squared random biases toward slower particles, so the
        // field reads as gentle flow with occasional faster movers.
        // Range ≈ 0.04 → 0.25 px/frame (~35% slower than the first
        // particle-mode pass). The base `speed` value is stored on the
        // particle so cursor-attraction can rotate velocity without
        // altering magnitude. To revert to the still-star look,
        // replace this + vx/vy below with:
        //   vx: (Math.random() - 0.5) * 0.015,
        //   vy: (Math.random() - 0.5) * 0.015,
        const theta = Math.random() * Math.PI * 2;
        const speed = 0.04 + Math.pow(Math.random(), 1.6) * 0.21;

        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(theta) * speed,
          vy: Math.sin(theta) * speed,
          speed, // base speed, preserved during cursor-attraction rotation
          radius,
          baseOpacity,
          hasGlow,
          color,
          // twinkle: each star phases independently
          twinklePhase: Math.random() * Math.PI * 2,
          // Each star gets its OWN speed on page load, spanning almost
          // an order of magnitude. A squared random biases the
          // distribution toward slower stars — most gently breathe,
          // a few noticeably pulse — while the max stays tame enough
          // that no star feels frantic.
          //
          //   min ≈ 0.0009  (very slow, multi-second pulse)
          //   max ≈ 0.0090  (brisk but never strobing)
          twinkleSpeed: 0.0009 + Math.pow(Math.random(), 1.8) * 0.0081,
          twinkleDepth: 0.2 + Math.random() * 0.5,
        });
      }
    };

    const draw = (time) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        // Cursor attraction — rotate velocity toward cursor AND
        // target a slightly boosted magnitude so particles move
        // faster when heading to where the cursor is.
        if (cursorActive) {
          const dx = mouseX - s.x;
          const dy = mouseY - s.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 1) {
            const invDist = 1 / Math.sqrt(distSq);
            const targetMag = s.speed * cursorBoost;
            const targetVx = dx * invDist * targetMag;
            const targetVy = dy * invDist * targetMag;
            s.vx += (targetVx - s.vx) * cursorPull;
            s.vy += (targetVy - s.vy) * cursorPull;
          }
        }

        // Speed damping — gently pull each particle's speed magnitude
        // back toward its target (boosted when cursor is on screen,
        // base otherwise). This is what makes click-burst impulses
        // decay back to the natural flow instead of runaway fast.
        const currentSpeed = Math.hypot(s.vx, s.vy);
        if (currentSpeed > 0.001) {
          const targetMag = cursorActive ? s.speed * cursorBoost : s.speed;
          const scale =
            1 - speedDamping + (targetMag * speedDamping) / currentSpeed;
          s.vx *= scale;
          s.vy *= scale;
        }

        // Smooth twinkle via sine wave
        const twinkle =
          1 - s.twinkleDepth + s.twinkleDepth *
            (0.5 + 0.5 * Math.sin(s.twinklePhase + time * s.twinkleSpeed));
        const alpha = Math.min(1, s.baseOpacity * twinkle);
        const { r, g, b } = s.color;

        // Outer halo glow for the brighter tiers
        if (s.hasGlow) {
          const glowRadius = s.radius * 6;
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowRadius);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.55})`);
          grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.12})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Solid star core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Subtle drift + wrap
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -5) s.x = w + 5;
        if (s.x > w + 5) s.x = -5;
        if (s.y < -5) s.y = h + 5;
        if (s.y > h + 5) s.y = -5;
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createStars();
    animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      resize();
      createStars();
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorActive = true;
    };
    // Fires when the cursor leaves the viewport entirely
    const handleMouseLeave = () => {
      cursorActive = false;
    };
    // Click burst — shove every particle within `clickRadius` radially
    // away from the click point. Strength falls off linearly so
    // particles at the center get the full kick and edge particles
    // barely move. Speed damping (above) decays the burst back to
    // normal flow over roughly 1–2 seconds.
    const handleMouseDown = (e) => {
      const cx = e.clientX;
      const cy = e.clientY;
      const r2 = clickRadius * clickRadius;
      for (const s of stars) {
        const dx = s.x - cx;
        const dy = s.y - cy;
        const distSq = dx * dx + dy * dy;
        if (distSq < r2 && distSq > 0.5) {
          const dist = Math.sqrt(distSq);
          const falloff = 1 - dist / clickRadius; // 1 at center → 0 at edge
          const kick = clickStrength * falloff;
          s.vx += (dx / dist) * kick;
          s.vy += (dy / dist) * kick;
        }
      }
    };
    // Disable on touch devices — no hover/cursor concept, would feel odd
    const isTouchOnly =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches;

    window.addEventListener("resize", handleResize);
    if (!isTouchOnly) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mousedown", handleMouseDown, { passive: true });
      document.documentElement.addEventListener(
        "mouseleave",
        handleMouseLeave
      );
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (!isTouchOnly) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mousedown", handleMouseDown);
        document.documentElement.removeEventListener(
          "mouseleave",
          handleMouseLeave
        );
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  );
}
