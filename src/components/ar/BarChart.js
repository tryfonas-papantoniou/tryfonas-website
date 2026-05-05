"use client";

/**
 * Inline-SVG bar chart. Two orientations:
 *   - "horizontal" - long labels on the left, bars run right.
 *     Best for customer rankings.
 *   - "vertical"   - short labels under each bar, value on top.
 *     Best for aging buckets / fixed categorical breakdowns.
 *
 * Theme: uses the site's accent color with a soft inner highlight.
 * Drawn at a fixed viewBox; the parent CSS scales to width. No
 * external chart library so the page stays light and the visual
 * stays consistent with the rest of the design.
 */

const ACCENT = "#4F6EF7";
const ACCENT_LIGHT = "#7B93FA";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_SECONDARY = "#cbd5e1";
const TEXT_MUTED = "#94a3b8";

export default function BarChart({
  title,
  valueLabel,
  data,
  orientation = "horizontal",
}) {
  if (!data || data.length === 0) {
    return (
      <div className="ar-chart-empty">
        <div className="ar-chart-title">{title}</div>
        <div className="ar-chart-empty-body">No data.</div>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  if (orientation === "horizontal") {
    return (
      <HorizontalBars title={title} valueLabel={valueLabel} data={data} max={max} />
    );
  }
  return (
    <VerticalBars title={title} valueLabel={valueLabel} data={data} max={max} />
  );
}

function HorizontalBars({ title, valueLabel, data, max }) {
  const rowH = 28;
  const gap = 6;
  const labelW = 200;
  const valueW = 110;
  const barAreaW = 360;
  const padX = 18;
  const padTop = 36;
  const padBottom = 12;
  const totalW = padX * 2 + labelW + barAreaW + valueW;
  const totalH = padTop + padBottom + data.length * rowH + (data.length - 1) * gap;

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
          <linearGradient id="ar-bar-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.85" />
            <stop offset="100%" stopColor={ACCENT_LIGHT} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const y = padTop + i * (rowH + gap);
          const w = (d.value / max) * barAreaW;
          return (
            <g key={i}>
              <text
                x={padX + labelW - 8}
                y={y + rowH / 2 + 4}
                textAnchor="end"
                fontSize="12"
                fill={TEXT_SECONDARY}
                style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
              >
                {truncate(d.label, 28)}
              </text>
              <rect
                x={padX + labelW}
                y={y + 2}
                width={barAreaW}
                height={rowH - 4}
                fill="rgba(148,163,184,0.06)"
                rx="4"
              />
              <rect
                x={padX + labelW}
                y={y + 2}
                width={Math.max(2, w)}
                height={rowH - 4}
                fill="url(#ar-bar-h)"
                rx="4"
              />
              <text
                x={padX + labelW + barAreaW + 8}
                y={y + rowH / 2 + 4}
                fontSize="12"
                fill={TEXT_PRIMARY}
                fontWeight="600"
                style={{
                  fontFamily: "var(--font-body), system-ui, sans-serif",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {d.formatted}
              </text>
            </g>
          );
        })}
        {valueLabel && (
          <text
            x={totalW - padX}
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

function VerticalBars({ title, valueLabel, data, max }) {
  const totalW = 600;
  const totalH = 240;
  const padX = 28;
  const padTop = 36;
  const padBottom = 36;
  const innerW = totalW - padX * 2;
  const innerH = totalH - padTop - padBottom;
  const barW = (innerW / data.length) * 0.6;
  const slot = innerW / data.length;

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
          <linearGradient id="ar-bar-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={ACCENT_LIGHT} stopOpacity="0.85" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {/* baseline */}
        <line
          x1={padX}
          x2={padX + innerW}
          y1={padTop + innerH}
          y2={padTop + innerH}
          stroke="rgba(148,163,184,0.18)"
          strokeWidth="1"
        />
        {data.map((d, i) => {
          const cx = padX + i * slot + slot / 2;
          const h = (d.value / max) * innerH;
          const y = padTop + innerH - h;
          return (
            <g key={i}>
              <rect
                x={cx - barW / 2}
                y={padTop}
                width={barW}
                height={innerH}
                fill="rgba(148,163,184,0.05)"
                rx="3"
              />
              <rect
                x={cx - barW / 2}
                y={y}
                width={barW}
                height={Math.max(2, h)}
                fill="url(#ar-bar-v)"
                rx="3"
              />
              <text
                x={cx}
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
              <text
                x={cx}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fill={TEXT_PRIMARY}
                fontWeight="600"
                style={{
                  fontFamily: "var(--font-body), system-ui, sans-serif",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {d.formatted}
              </text>
            </g>
          );
        })}
        {valueLabel && (
          <text
            x={totalW - padX}
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

function truncate(s, n) {
  if (!s) return "";
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
