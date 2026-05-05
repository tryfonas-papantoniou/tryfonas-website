"use client";

/**
 * Inline-SVG line chart. Single series, equal-spaced x-axis labels.
 * Used for the DSO trend (months on x, days on y).
 *
 * Visual rules:
 *   - Soft grid line at the median value for visual reference
 *   - Filled area under the line at low opacity
 *   - Solid line in the accent colour, with circular markers at
 *     each data point
 *   - Last point gets an emphasised value label so the trend's
 *     endpoint is the first thing the eye lands on
 */

const ACCENT = "#4F6EF7";
const ACCENT_LIGHT = "#7B93FA";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_SECONDARY = "#cbd5e1";
const TEXT_MUTED = "#94a3b8";

export default function LineChart({ title, valueLabel, data }) {
  if (!data || data.length === 0) {
    return (
      <div className="ar-chart-empty">
        <div className="ar-chart-title">{title}</div>
        <div className="ar-chart-empty-body">No data.</div>
      </div>
    );
  }

  const totalW = 600;
  const totalH = 240;
  const padL = 44;
  const padR = 28;
  const padTop = 36;
  const padBottom = 36;
  const innerW = totalW - padL - padR;
  const innerH = totalH - padTop - padBottom;

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  // Pad the range a touch so the line never touches the top/bottom.
  const range = max - min || 1;
  const yMin = Math.max(0, min - range * 0.2);
  const yMax = max + range * 0.2;

  const xFor = (i) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yFor = (v) => padTop + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  const points = data.map((d, i) => ({ x: xFor(i), y: yFor(d.value) }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath =
    `M ${points[0].x} ${padTop + innerH} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x} ${padTop + innerH} Z`;

  // Three y-axis ticks (min, mid, max) for orientation
  const yTicks = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div className="ar-chart">
      <div className="ar-chart-title">{title}</div>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="ar-chart-svg"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="ar-line-area" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y-axis tick lines */}
        {yTicks.map((v, i) => {
          const y = yFor(v);
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={padL + innerW}
                y1={y}
                y2={y}
                stroke="rgba(148,163,184,0.10)"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill={TEXT_MUTED}
                style={{
                  fontFamily: "var(--font-body), system-ui, sans-serif",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.round(v)}
              </text>
            </g>
          );
        })}

        {/* Filled area under the line */}
        <path d={areaPath} fill="url(#ar-line-area)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={ACCENT_LIGHT}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Points */}
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isLast ? 5 : 3.5}
                fill={isLast ? ACCENT_LIGHT : ACCENT}
                stroke="#0a0f1c"
                strokeWidth="2"
              />
              {isLast && (
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={TEXT_PRIMARY}
                  style={{
                    fontFamily: "var(--font-body), system-ui, sans-serif",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {data[i].formatted}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={xFor(i)}
            y={padTop + innerH + 18}
            textAnchor="middle"
            fontSize="11"
            fill={TEXT_SECONDARY}
            style={{
              fontFamily: "var(--font-body), system-ui, sans-serif",
            }}
          >
            {d.label}
          </text>
        ))}

        {valueLabel && (
          <text
            x={totalW - padR}
            y={padTop - 12}
            textAnchor="end"
            fontSize="10"
            fill={TEXT_MUTED}
            style={{
              fontFamily: "var(--font-body), system-ui, sans-serif",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {valueLabel}
          </text>
        )}
      </svg>
    </div>
  );
}
