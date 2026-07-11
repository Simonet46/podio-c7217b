import { ImageResponse } from "next/og";
import { getTeamCampaigns, getTeamCampaignBySlug } from "@/lib/data/campaigns";
import { sportColorForTeam } from "@/components/TeamCampaignCard";

// Tarjeta de previsualización por campaña de equipo. PNG estático (build).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const campaigns = await getTeamCampaigns();
  const params = campaigns.map((c) => ({ slug: c.slug }));
  // output: export exige al menos un param. Si no hay campañas, placeholder
  // (la imagen cae al diseño por defecto de la marca). Sin esto, CI falla.
  return params.length ? params : [{ slug: "__none__" }];
}

function money(n: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

export default async function Image({ params }: { params: { slug: string } }) {
  const c = await getTeamCampaignBySlug(params.slug);
  const name = c?.team_name ?? "GRANITO";
  const color = c ? sportColorForTeam(c.sport) : "#6CB4E4";
  const goal = c?.goal_amount ?? 0;
  const raised = c?.raised_amount ?? 0;
  const pct = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
  const over = goal > 0 && raised > goal;
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0A1A2F", padding: "56px 64px", position: "relative", fontFamily: "sans-serif" }}>
        {/* Franja de 5 colores arriba */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, display: "flex" }}>
          {["#0072CE", "#F4C300", "#111111", "#009F3D", "#DF0024"].map((col) => (
            <div key={col} style={{ flex: 1, background: col }} />
          ))}
        </div>

        {/* Header: wordmark + eyebrow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#ffffff", fontSize: 38, fontWeight: 800, letterSpacing: 2 }}>GRANIT</span>
            <span style={{ color: "#C9A227", fontSize: 38, fontWeight: 800, letterSpacing: 2 }}>O</span>
          </div>
          <div style={{ display: "flex", color: "#6CB4E4", fontSize: 22, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3 }}>
            Proyecto deportivo
          </div>
        </div>

        {/* Cuerpo: escudo + nombre + misión */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 128, height: 128, borderRadius: 28, background: `${color}22`, border: `4px solid ${color}`, color, fontSize: 54, fontWeight: 800, marginRight: 32 }}>
            {initials}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignSelf: "flex-start", background: color, color: "#ffffff", fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, padding: "5px 14px", borderRadius: 6, marginBottom: 12 }}>
              {c?.sport ?? ""}
            </div>
            <div style={{ display: "flex", color: "#ffffff", fontSize: 62, fontWeight: 800, lineHeight: 1, textTransform: "uppercase" }}>{name}</div>
          </div>
        </div>

        {c?.competition && (
          <div style={{ display: "flex", color: "rgba(255,255,255,0.65)", fontSize: 28, marginTop: 22 }}>🎯 {c.competition}</div>
        )}

        {/* Barra de progreso (si hay objetivo) */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          {goal > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div style={{ display: "flex", color: "#C9A227", fontSize: 40, fontWeight: 800 }}>{money(raised)}</div>
                <div style={{ display: "flex", color: "rgba(255,255,255,0.55)", fontSize: 26 }}>objetivo {money(goal)}</div>
              </div>
              <div style={{ display: "flex", width: "100%", height: 20, borderRadius: 999, background: "rgba(255,255,255,0.1)", marginTop: 14 }}>
                <div style={{ display: "flex", width: `${pct}%`, height: 20, borderRadius: 999, background: over ? "#6CB4E4" : "#C9A227" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                <div style={{ display: "flex", color: over ? "#6CB4E4" : "#C9A227", fontSize: 24, fontWeight: 700 }}>{pct}% {over ? "· ¡objetivo superado!" : ""}</div>
                <div style={{ display: "flex", background: "#C9A227", color: "#0A1A2F", fontSize: 24, fontWeight: 800, padding: "12px 26px", borderRadius: 10 }}>Sumá tu granito</div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", color: "rgba(255,255,255,0.6)", fontSize: 26 }}>somosgranito.com</div>
              <div style={{ display: "flex", background: "#C9A227", color: "#0A1A2F", fontSize: 24, fontWeight: 800, padding: "12px 26px", borderRadius: 10 }}>Sumá tu granito</div>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
