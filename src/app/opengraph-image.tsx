import { ImageResponse } from "next/og";

// Shared social-share card for every route (Open Graph + Twitter). Built on the
// dark "deep water" palette so it reads well as a thumbnail in social feeds.
export const alt = "Wavely — WhatsApp automation console";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The signal wave that runs along the bottom of the card.
const WAVE =
  "M0 30 C 32.5 8 97.5 8 130 30 S 227.5 52 260 30 S 357.5 8 390 30 S 487.5 52 520 30 S 617.5 8 650 30 S 747.5 52 780 30 S 877.5 8 910 30 S 1007.5 52 1040 30";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #0b1a22 0%, #12242e 55%, #0b1a22 100%)",
          color: "#e6ede9",
        }}
      >
        {/* eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#4fc08a",
            }}
          />
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 6,
              color: "#46c7d0",
            }}
          >
            WHATSAPP AUTOMATION CONSOLE
          </div>
        </div>

        {/* brand + headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                background: "#f0a94c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a1204"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0" />
              </svg>
            </div>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -1 }}>
              Wavely
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.08,
            }}
          >
            <div>Arm your bot.</div>
            <div style={{ color: "#f0a94c" }}>Broadcast in waves.</div>
          </div>

          <div style={{ fontSize: 30, color: "#8aa1a6", maxWidth: 900 }}>
            Link a line, arm automated replies, and dispatch broadcasts and
            scheduled sends from one signal desk.
          </div>
        </div>

        {/* signal wave */}
        <svg width="1040" height="60" viewBox="0 0 1040 60" fill="none">
          <path
            d={WAVE}
            stroke="#46c7d0"
            strokeOpacity={0.35}
            strokeWidth={9}
            strokeLinecap="round"
          />
          <path d={WAVE} stroke="#f0a94c" strokeWidth={5} strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
