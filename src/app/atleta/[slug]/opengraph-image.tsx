import { getAllAthletes, getAthleteBySlug } from "@/lib/data/athletes";
import { getSport } from "@/config/sports";
import { ogPhoto } from "@/lib/og/photo";
import { ogJpeg } from "@/lib/og/render";
import { athleteShare, place } from "@/lib/share";

// Tarjeta de previsualización (WhatsApp / Instagram / X) por atleta.
// Se genera como JPEG estático en el build (compatible con output: export).
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

const INK = "#0A1A2F";
const GOLD = "#C9A227";
const FLAG = ["#0072CE", "#F4C300", "#111111", "#009F3D", "#DF0024"];

export async function generateStaticParams() {
  const athletes = await getAllAthletes();
  return athletes.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const athlete = await getAthleteBySlug(params.slug);
  const sport = athlete ? getSport(athlete.sport) : undefined;
  const color = sport?.color ?? "#6CB4E4";
  const name = athlete?.full_name ?? "GRANITO";
  const sportLabel = sport?.label ?? athlete?.sport ?? "";
  const location = athlete ? place(athlete.city, athlete.province) : "";
  const reason = athlete ? athleteShare(athlete).reason : "";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // El retrato nítido va a la derecha; la misma foto difuminada tiñe el fondo
  // (mismo recurso que usa el hero del perfil) para que la card tenga la
  // energía de la foto sin tapar la cara del atleta con el texto.
  const portrait = await ogPhoto(athlete?.photo_url, { width: 560, height: 630 });
  const backdrop = portrait
    ? await ogPhoto(athlete?.photo_secondary_url ?? athlete?.photo_url, {
        width: 600,
        height: 315,
        blur: 18,
      })
    : null;

  return ogJpeg(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: INK,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Fondo: foto difuminada + velo azul para que el texto respire */}
        {backdrop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backdrop} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: backdrop
              ? "linear-gradient(100deg, rgba(10,26,47,0.97) 0%, rgba(10,26,47,0.95) 42%, rgba(10,26,47,0.80) 70%, rgba(10,26,47,0.70) 100%)"
              : INK,
          }}
        />

        {/* Retrato nítido a la derecha, fundido hacia el texto */}
        {portrait && (
          <div style={{ position: "absolute", top: 0, right: 0, width: 560, height: 630, display: "flex" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt="" width={560} height={630} style={{ width: 560, height: 630, objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: 240, height: 630, background: "linear-gradient(90deg, rgba(10,26,47,0.98), rgba(10,26,47,0))" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 560, height: 200, background: "linear-gradient(0deg, rgba(10,26,47,0.85), rgba(10,26,47,0))" }} />
          </div>
        )}

        {/* Monograma cuando el atleta todavía no cargó foto */}
        {!portrait && (
          <div
            style={{
              position: "absolute",
              right: 90,
              top: 200,
              width: 230,
              height: 230,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 40,
              background: `${color}22`,
              border: `4px solid ${color}`,
              color,
              fontSize: 96,
              fontWeight: 800,
            }}
          >
            {initials}
          </div>
        )}

        {/* Franja de 5 colores arriba (siempre por encima de la foto) */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 12, display: "flex" }}>
          {FLAG.map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>

        {/* Columna de texto */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 56px 56px",
            width: portrait ? 700 : 1200,
            height: 630,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#ffffff", fontSize: 38, fontWeight: 800, letterSpacing: 2 }}>GRANIT</span>
            <span style={{ color: GOLD, fontSize: 38, fontWeight: 800, letterSpacing: 2 }}>O</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {sportLabel && (
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  background: color,
                  color: "#ffffff",
                  fontSize: 22,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  padding: "6px 16px",
                  borderRadius: 6,
                  marginBottom: 18,
                }}
              >
                {sportLabel}
              </div>
            )}
            <div style={{ display: "flex", color: "#ffffff", fontSize: 66, fontWeight: 800, lineHeight: 1.02, textTransform: "uppercase" }}>
              {name}
            </div>
            {location && (
              <div style={{ display: "flex", color: "rgba(255,255,255,0.6)", fontSize: 26, marginTop: 12 }}>{location}</div>
            )}

            {/* El porqué del apoyo: es lo que convierte la card en una historia */}
            {reason && (
              <div style={{ display: "flex", marginTop: 24 }}>
                <div style={{ display: "flex", width: 4, borderRadius: 4, background: GOLD, marginRight: 18 }} />
                <div style={{ display: "flex", color: "rgba(255,255,255,0.82)", fontSize: 25, lineHeight: 1.35, maxWidth: 520 }}>
                  {reason}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", background: GOLD, color: INK, fontSize: 26, fontWeight: 800, padding: "14px 28px", borderRadius: 10 }}>
              Apoyá su camino
            </div>
            <div style={{ display: "flex", color: "rgba(255,255,255,0.55)", fontSize: 23, marginLeft: 22 }}>somosgranito.com</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
