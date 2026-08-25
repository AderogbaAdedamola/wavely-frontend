import { ImageResponse } from "next/og";

// Apple touch icon for iOS home screens. iOS applies its own rounded-rect mask,
// so this is a full-bleed amber square with the centered wave glyph.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d98a26",
        }}
      >
        <svg
          width="116"
          height="116"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2a1b06"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
