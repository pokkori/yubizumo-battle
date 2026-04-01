import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = " 指相撲バトル YUBIZUMO | 2人対戦物理相撲";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #1a0505, #3d0f0f, #1a0505)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 900, color: "#fca5a5", marginBottom: 12, textShadow: "0 0 30px rgba(220,38,38,0.6)" }}>
          指相撲バトル
        </div>
        <div style={{ fontSize: 32, color: "#fca5a5", fontWeight: 700, marginBottom: 8 }}>
          YUBIZUMO
        </div>
        <div style={{ fontSize: 24, color: "#ef4444" }}>
          2人でスマホを囲んで指1本で対戦！横綱を目指せ
        </div>
      </div>
    ),
    { ...size }
  );
}
