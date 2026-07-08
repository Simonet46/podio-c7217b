import { ImageResponse } from "next/og";

// Tarjeta de previsualización por defecto (home y páginas sin card propia).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0A1A2F", position: "relative", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 14, display: "flex" }}>
          {["#0072CE", "#F4C300", "#111111", "#009F3D", "#DF0024"].map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ color: "#ffffff", fontSize: 96, fontWeight: 800, letterSpacing: 3 }}>GRANIT</span>
          <span style={{ color: "#C9A227", fontSize: 96, fontWeight: 800, letterSpacing: 3 }}>O</span>
        </div>
        <div style={{ display: "flex", color: "rgba(255,255,255,0.85)", fontSize: 36, marginTop: 12, textAlign: "center", maxWidth: 900 }}>
          Apoyo directo al deporte argentino
        </div>
        <div style={{ display: "flex", color: "rgba(255,255,255,0.5)", fontSize: 26, marginTop: 40 }}>
          somosgranito.com
        </div>
      </div>
    ),
    { ...size },
  );
}
