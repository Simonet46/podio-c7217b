/**
 * Pieza vertical para historias de Instagram (1080x1920).
 *
 * Se genera en el build, igual que las tarjetas de compartir, y queda servida
 * como un .jpg estático que el atleta puede bajar o mandar directo al menú de
 * compartir del teléfono.
 *
 * Instagram tapa con su propia interfaz los ~250 px de arriba (nombre de la
 * cuenta) y los ~250 px de abajo (barra de respuesta). Por eso la foto se come
 * el borde superior —no lleva texto— y el bloque de abajo termina bastante
 * antes del pie.
 */

export const STORY = { width: 1080, height: 1920 };
/** Alto de la foto. El resto es la banda sólida con el texto. */
export const STORY_PHOTO_H = 1020;

const INK = "#0A1A2F";
const GOLD = "#C9A227";
const FLAG = ["#0072CE", "#F4C300", "#111111", "#009F3D", "#DF0024"];

export function StoryCard({
  photo,
  initials,
  chip,
  chipColor,
  title,
  subtitle,
  reason,
  cta,
  url,
}: {
  /** Data URL de la foto ya recortada a 1080x1020, o null. */
  photo: string | null;
  initials: string;
  chip: string;
  chipColor: string;
  title: string;
  subtitle?: string;
  reason?: string;
  cta: string;
  /** Se muestra abajo para que quien mire la historia sepa dónde entrar. */
  url: string;
}) {
  return (
    <div style={{ width: STORY.width, height: STORY.height, display: "flex", background: INK, position: "relative", fontFamily: "sans-serif" }}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" width={STORY.width} height={STORY_PHOTO_H} style={{ position: "absolute", top: 0, left: 0, width: STORY.width, height: STORY_PHOTO_H, objectFit: "cover" }} />
      )}
      {!photo && (
        <div style={{ position: "absolute", top: 0, left: 0, width: STORY.width, height: STORY_PHOTO_H, background: `linear-gradient(150deg, ${chipColor}44 0%, rgba(10,26,47,0) 70%)` }} />
      )}
      {!photo && (
        <div style={{ position: "absolute", top: 380, left: 0, width: STORY.width, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 300, height: 300, borderRadius: 64, background: `${chipColor}22`, border: `8px solid ${chipColor}`, color: chipColor, fontSize: 120, fontWeight: 800 }}>
            {initials}
          </div>
        </div>
      )}
      {/* Fundido de la foto hacia la banda de texto */}
      {photo && (
        <div style={{ position: "absolute", top: STORY_PHOTO_H - 320, left: 0, width: STORY.width, height: 320, background: "linear-gradient(180deg, rgba(10,26,47,0) 0%, rgba(10,26,47,0.72) 60%, rgba(10,26,47,1) 100%)" }} />
      )}

      {/* Franja de 5 colores arriba */}
      <div style={{ position: "absolute", top: 0, left: 0, width: STORY.width, height: 18, display: "flex" }}>
        {FLAG.map((c) => (
          <div key={c} style={{ flex: 1, background: c }} />
        ))}
      </div>

      {/* ── Bloque de texto, anclado arriba del borde que tapa Instagram ── */}
      <div style={{ position: "absolute", bottom: 170, left: 72, width: 936, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignSelf: "flex-start", background: chipColor, color: "#ffffff", fontSize: 30, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, padding: "10px 24px", borderRadius: 8 }}>
          {chip}
        </div>

        <div style={{ display: "flex", color: "#ffffff", fontSize: 88, fontWeight: 800, lineHeight: 1.03, textTransform: "uppercase", marginTop: 24 }}>
          {title}
        </div>

        {subtitle && (
          <div style={{ display: "flex", color: "rgba(255,255,255,0.62)", fontSize: 40, marginTop: 16 }}>{subtitle}</div>
        )}

        {reason && (
          <div style={{ display: "flex", marginTop: 30 }}>
            <div style={{ display: "flex", width: 6, borderRadius: 6, background: GOLD, marginRight: 26 }} />
            <div style={{ display: "flex", color: "rgba(255,255,255,0.85)", fontSize: 38, lineHeight: 1.38, maxWidth: 860 }}>
              {reason}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignSelf: "flex-start", background: GOLD, color: INK, fontSize: 44, fontWeight: 800, padding: "24px 46px", borderRadius: 16, marginTop: 44 }}>
          {cta}
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#ffffff", fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>GRANIT</span>
            <span style={{ color: GOLD, fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>O</span>
          </div>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.5)", fontSize: 32, marginLeft: 24 }}>{url}</div>
        </div>
      </div>
    </div>
  );
}
