import { getTeamCampaigns, getTeamCampaignBySlug } from "@/lib/data/campaigns";
import { sportColorForTeam } from "@/components/TeamCampaignCard";
import { ogPhoto } from "@/lib/og/photo";
import { ogJpeg } from "@/lib/og/render";
import { campaignShare } from "@/lib/share";

// Tarjeta de previsualización por campaña de equipo. JPEG estático (build).
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const INK = "#0A1A2F";
const GOLD = "#C9A227";
/** Alto de la foto. El resto es la banda sólida con el objetivo y el porqué. */
const PHOTO_H = 372;

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
  // Solo mostramos el recaudado cuando suma. Con $0 —o con un arranque que
  // redondea a 0%— la card estaría anunciando que nadie apoyó todavía, justo
  // en el momento en que más necesita convencer.
  const showProgress = goal > 0 && raised > 0 && (over || pct >= 5);
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  // Solo el porqué escrito por el equipo. El texto de respaldo de campaignShare
  // ("Están juntando para llegar a X") sirve para la bajada del preview, pero
  // acá repetiría palabra por palabra la línea "Quieren llegar a" y el botón.
  const reason = c?.goal_purpose?.trim() ? campaignShare(c).reason : "";

  // Recortamos la foto EXACTAMENTE al alto que se ve (1200x372) en vez de a
  // toda la card: así el recorte inteligente encuadra a los pibes dentro de la
  // zona visible y no debajo de la banda de texto.
  const photo = await ogPhoto(c?.photo_url ?? c?.photo_secondary_url, { width: 1200, height: PHOTO_H });

  return ogJpeg(
    (
      <div style={{ width: 1200, height: 630, display: "flex", background: INK, position: "relative", fontFamily: "sans-serif" }}>
        {/* ── Foto a sangre arriba, sin velo: es la cara del proyecto ── */}
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={1200} height={PHOTO_H} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: PHOTO_H, objectFit: "cover" }} />
        )}
        {/* Sombra suave arriba (para que se lea el wordmark) y fundido hacia
            la banda de texto, así la foto no corta con un borde duro. */}
        {photo && (
          <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 150, background: "linear-gradient(180deg, rgba(10,26,47,0.85) 0%, rgba(10,26,47,0.35) 55%, rgba(10,26,47,0) 100%)" }} />
        )}
        {photo && (
          <div style={{ position: "absolute", top: PHOTO_H - 170, left: 0, width: 1200, height: 170, background: "linear-gradient(180deg, rgba(10,26,47,0) 0%, rgba(10,26,47,0.75) 62%, rgba(10,26,47,1) 100%)" }} />
        )}

        {/* Sin foto, la zona superior quedaría como un vacío negro: la teñimos
            con el color del deporte. Va antes del encabezado para no taparlo. */}
        {!photo && (
          <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: PHOTO_H, background: `linear-gradient(120deg, ${color}44 0%, rgba(10,26,47,0) 65%)` }} />
        )}

        {/* Franja de 5 colores arriba */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 12, display: "flex" }}>
          {["#0072CE", "#F4C300", "#111111", "#009F3D", "#DF0024"].map((col) => (
            <div key={col} style={{ flex: 1, background: col }} />
          ))}
        </div>

        {/* ── Encabezado sobre la foto ── */}
        <div style={{ position: "absolute", top: 44, left: 56, width: 1088, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#ffffff", fontSize: 36, fontWeight: 800, letterSpacing: 2 }}>GRANIT</span>
            <span style={{ color: GOLD, fontSize: 36, fontWeight: 800, letterSpacing: 2 }}>O</span>
          </div>
          <div style={{ display: "flex", background: color, color: "#ffffff", fontSize: 19, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, padding: "7px 16px", borderRadius: 6 }}>
            {c?.sport ?? "Proyecto deportivo"}
          </div>
        </div>

        {/* Escudo del equipo, centrado en la zona que ocuparía la foto */}
        {!photo && (
          <div style={{ position: "absolute", top: 116, left: 56, display: "flex", alignItems: "center", justifyContent: "center", width: 150, height: 150, borderRadius: 32, background: `${color}22`, border: `4px solid ${color}`, color, fontSize: 60, fontWeight: 800 }}>
            {initials}
          </div>
        )}

        {/* ── Banda de abajo: quiénes son, qué buscan y para qué ── */}
        <div style={{ position: "absolute", bottom: 44, left: 56, width: 1088, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#ffffff", fontSize: 52, fontWeight: 800, lineHeight: 1.02, textTransform: "uppercase" }}>
            {name}
          </div>

          {/* Qué quieren lograr */}
          {c?.competition && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
              <div style={{ display: "flex", color: GOLD, fontSize: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                Quieren llegar a
              </div>
              <div style={{ display: "flex", color: "#ffffff", fontSize: 26, fontWeight: 700, marginLeft: 12 }}>{c.competition}</div>
            </div>
          )}

          {/* Por qué necesitan el apoyo */}
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
              Sumá tu granito
            </div>
            {showProgress ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", color: GOLD, fontSize: 30, fontWeight: 800 }}>{money(raised)}</div>
                <div style={{ display: "flex", color: "rgba(255,255,255,0.55)", fontSize: 23, marginLeft: 14 }}>
                  {over ? "· ¡objetivo superado!" : `· ${pct}% del objetivo`}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", color: "rgba(255,255,255,0.55)", fontSize: 24 }}>somosgranito.com</div>
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
