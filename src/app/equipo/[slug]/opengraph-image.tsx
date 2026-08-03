import { getTeams, getTeamBySlug } from "@/lib/data/athletes";
import { SEED_TEAMS } from "@/lib/data/teams";
import { getSport } from "@/config/sports";
import { ogPhoto } from "@/lib/og/photo";
import { ogJpeg } from "@/lib/og/render";
import { teamShare } from "@/lib/share";

// Tarjeta de previsualización del hub de una selección. JPEG estático (build).
// Mismo diseño "póster" que la card de campaña: foto limpia arriba, banda
// sólida abajo con quiénes son y por qué necesitan apoyo.
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const INK = "#0A1A2F";
const GOLD = "#C9A227";
const PHOTO_H = 372;

export async function generateStaticParams() {
  const teams = await getTeams();
  if (teams.length > 0) return teams.map((t) => ({ slug: t.slug }));
  return SEED_TEAMS.map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const team = await getTeamBySlug(params.slug);
  const name = team?.name ?? "GRANITO";
  const color = team?.color ?? (team ? getSport(team.sport)?.color : undefined) ?? "#6CB4E4";
  const reason = team?.bio?.trim() ? teamShare(team).reason : "";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const photo = await ogPhoto(team?.photo_url, { width: 1200, height: PHOTO_H });

  return ogJpeg(
    (
      <div style={{ width: 1200, height: 630, display: "flex", background: INK, position: "relative", fontFamily: "sans-serif" }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={1200} height={PHOTO_H} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: PHOTO_H, objectFit: "cover" }} />
        )}
        {photo && (
          <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 150, background: "linear-gradient(180deg, rgba(10,26,47,0.85) 0%, rgba(10,26,47,0.35) 55%, rgba(10,26,47,0) 100%)" }} />
        )}
        {photo && (
          <div style={{ position: "absolute", top: PHOTO_H - 170, left: 0, width: 1200, height: 170, background: "linear-gradient(180deg, rgba(10,26,47,0) 0%, rgba(10,26,47,0.75) 62%, rgba(10,26,47,1) 100%)" }} />
        )}
        {!photo && (
          <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: PHOTO_H, background: `linear-gradient(120deg, ${color}44 0%, rgba(10,26,47,0) 65%)` }} />
        )}

        {/* Franja de 5 colores arriba */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 12, display: "flex" }}>
          {["#0072CE", "#F4C300", "#111111", "#009F3D", "#DF0024"].map((col) => (
            <div key={col} style={{ flex: 1, background: col }} />
          ))}
        </div>

        <div style={{ position: "absolute", top: 44, left: 56, width: 1088, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#ffffff", fontSize: 36, fontWeight: 800, letterSpacing: 2 }}>GRANIT</span>
            <span style={{ color: GOLD, fontSize: 36, fontWeight: 800, letterSpacing: 2 }}>O</span>
          </div>
          <div style={{ display: "flex", background: color, color: "#ffffff", fontSize: 19, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, padding: "7px 16px", borderRadius: 6 }}>
            {team?.national ? "Selección nacional" : "Equipo"}
          </div>
        </div>

        {!photo && (
          <div style={{ position: "absolute", top: 116, left: 56, display: "flex", alignItems: "center", justifyContent: "center", width: 150, height: 150, borderRadius: 32, background: `${color}22`, border: `4px solid ${color}`, color, fontSize: 60, fontWeight: 800 }}>
            {initials}
          </div>
        )}

        <div style={{ position: "absolute", bottom: 44, left: 56, width: 1088, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#ffffff", fontSize: 52, fontWeight: 800, lineHeight: 1.02, textTransform: "uppercase", maxWidth: 1000 }}>
            {name}
          </div>
          {team?.discipline && (
            <div style={{ display: "flex", color: "rgba(255,255,255,0.65)", fontSize: 26, marginTop: 12 }}>{team.discipline}</div>
          )}
          {reason && (
            <div style={{ display: "flex", marginTop: 14 }}>
              <div style={{ display: "flex", width: 4, borderRadius: 4, background: GOLD, marginRight: 16 }} />
              <div style={{ display: "flex", color: "rgba(255,255,255,0.82)", fontSize: 24, lineHeight: 1.35, maxWidth: 900 }}>
                {reason}
              </div>
            </div>
          )}
          <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}>
            <div style={{ display: "flex", background: GOLD, color: INK, fontSize: 25, fontWeight: 800, padding: "13px 28px", borderRadius: 10 }}>
              Elegí a quién apoyar
            </div>
            <div style={{ display: "flex", color: "rgba(255,255,255,0.55)", fontSize: 24 }}>somosgranito.com</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
