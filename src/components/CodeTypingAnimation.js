"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Types out a syntax-highlighted code block line by line.
 *
 * `lines` is a 2D array of tokens: lines[i] = [{ text, type? }, ...]
 * where `type` maps to a CSS class (keyword / function / string / comment / operator).
 * Empty lines should be passed as `[{ text: "" }]` or just `[]`.
 *
 * Respects `prefers-reduced-motion` and skips the animation in that case.
 */
export default function CodeTypingAnimation({
  lines,
  speed = 18,
  startDelay = 300,
  onComplete,
}) {
  const [pos, setPos] = useState({ line: 0, seg: 0, char: 0 });
  const [done, setDone] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Skip animation for users who prefer reduced motion
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        setDone(true);
        onComplete?.();
        return;
      }
    }

    const advance = () => {
      setPos((prev) => {
        const currentLine = lines[prev.line];
        if (!currentLine) return prev;

        const currentSeg = currentLine[prev.seg];

        // Empty line: jump to next line
        if (!currentSeg || currentSeg.text === "") {
          if (prev.line + 1 >= lines.length) {
            setDone(true);
            onComplete?.();
            return prev;
          }
          return { line: prev.line + 1, seg: 0, char: 0 };
        }

        // More chars in this segment?
        if (prev.char + 1 < currentSeg.text.length) {
          return { ...prev, char: prev.char + 1 };
        }

        // Segment finished — next segment
        if (prev.seg + 1 < currentLine.length) {
          return { line: prev.line, seg: prev.seg + 1, char: 0 };
        }

        // Line finished — next line
        if (prev.line + 1 >= lines.length) {
          setDone(true);
          onComplete?.();
          return prev;
        }
        return { line: prev.line + 1, seg: 0, char: 0 };
      });
    };

    // Variable-speed tick: slight jitter makes it feel organic
    const tick = () => {
      if (done) return;
      advance();
      const jitter = 0.7 + Math.random() * 0.7; // 0.7–1.4×
      timeoutRef.current = setTimeout(tick, speed * jitter);
    };

    const initial = setTimeout(tick, startDelay);
    return () => {
      clearTimeout(initial);
      clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  return (
    <>
      {lines.map((line, lineIdx) => {
        // Render an empty placeholder for lines we haven't reached yet
        // (keeps the container height stable so surrounding UI doesn't jump).
        if (!done && lineIdx > pos.line) {
          return (
            <div key={lineIdx} className="code-line" aria-hidden="true">
              &nbsp;
            </div>
          );
        }
        // Render a blank spacer for truly empty lines
        if (!line || line.length === 0 || (line.length === 1 && line[0].text === "")) {
          return (
            <div key={lineIdx} className="code-line">
              &nbsp;
            </div>
          );
        }

        const isCurrentLine = !done && lineIdx === pos.line;

        return (
          <div key={lineIdx} className="code-line">
            {line.map((seg, segIdx) => {
              let visibleText;
              if (done || lineIdx < pos.line) {
                visibleText = seg.text;
              } else if (segIdx < pos.seg) {
                visibleText = seg.text;
              } else if (segIdx === pos.seg) {
                visibleText = seg.text.substring(0, pos.char + 1);
              } else {
                return null;
              }
              // Preserve leading whitespace
              const rendered = visibleText.replace(/ /g, "\u00A0");
              return seg.type ? (
                <span key={segIdx} className={seg.type}>
                  {rendered}
                </span>
              ) : (
                <span key={segIdx}>{rendered}</span>
              );
            })}
            {isCurrentLine && <span className="typing-cursor" />}
            {done && lineIdx === lines.length - 1 && (
              <span className="typing-cursor" />
            )}
          </div>
        );
      })}
    </>
  );
}
