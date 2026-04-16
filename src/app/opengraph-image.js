import { ImageResponse } from "next/og";

export const alt = "Tryfonas Papantoniou — AI Solutions Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0a0f1c",
          color: "#f1f5f9",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Aurora gradient layers */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 60% at 20% 20%, rgba(120, 50, 220, 0.55) 0%, transparent 55%), radial-gradient(ellipse 55% 50% at 80% 70%, rgba(79, 110, 247, 0.50) 0%, transparent 55%), radial-gradient(ellipse 45% 40% at 50% 100%, rgba(30, 190, 190, 0.35) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 90% 10%, rgba(246, 153, 43, 0.25) 0%, transparent 55%)",
            display: "flex",
          }}
        />

        {/* Top meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a78bfa",
            position: "relative",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#22c55e",
              display: "block",
            }}
          />
          <span>Available for AI Roles · Kraków / Remote</span>
        </div>

        {/* Name + tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 104,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.02,
              display: "flex",
            }}
          >
            Tryfonas Papantoniou
          </div>
          <div
            style={{
              fontSize: 38,
              color: "#cbd5e1",
              maxWidth: 900,
              lineHeight: 1.25,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
              fontWeight: 500,
              display: "flex",
            }}
          >
            I build AI tools that solve real problems —
            RAG systems, chatbots, and agentic workflows.
          </div>
        </div>

        {/* Bottom meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#94a3b8",
            position: "relative",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
            fontWeight: 500,
          }}
        >
          <div style={{ display: "flex", gap: 28 }}>
            <span>Claude API</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Pinecone</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Next.js 16</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Vercel</span>
          </div>
          <div style={{ display: "flex", fontWeight: 600, color: "#7B93FA" }}>
            tryfonaspapantoniou.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
