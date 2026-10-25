import { ImageResponse } from "next/og";

// The picture shown when the store link is shared on WhatsApp, Facebook, etc.
export const alt = "Zarghoon Cosmetics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "#2F5D46", color: "#F5F6F2",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 12, color: "#E7C9A0" }}>COSMETICS</div>
        <div style={{ fontSize: 120, fontFamily: "serif", marginTop: 10 }}>Zarghoon</div>
        <div style={{ fontSize: 30, marginTop: 20, opacity: 0.85 }}>Skincare &amp; beauty, shipped worldwide</div>
      </div>
    ),
    size,
  );
}
