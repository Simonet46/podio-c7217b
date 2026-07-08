import { ImageResponse } from "next/og";
import { getAllAthletes, getAthleteBySlug } from "@/lib/data/athletes";
import { getSport } from "@/config/sports";

// Tarjeta de previsualización (WhatsApp / Instagram / Twitter) por atleta.
// Se genera como PNG estático en el build (compatible con output: export).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const athletes = await getAllAthletes();
  return athletes.map((a) => ({ slug: a.slug }));
}

// satori (motor de next/og) solo entiende JPEG y PNG. Un WebP/AVIF/otro lo
// hace crashear ("a is not iterable"), así que esos caen a iniciales.
const OG_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

/** Baja la foto a un data URL si es JPEG/PNG. Devuelve null ante cualquier
 *  problema (URL rota, formato no soportado) para caer al bloque de iniciales —
 *  así ninguna foto rompe el build. */
async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!OG_IMAGE_TYPES.includes(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const athlete = await getAthleteBySlug(params.slug);
  const sport = athlete ? getSport(athlete.sport) : undefined;
  const color = sport?.color ?? "#6CB4E4";
  const name = athlete?.full_name ?? "GRANITO";
  const sportLabel = sport?.label ?? athlete?.sport ?? "";
  const location = athlete
    ? [...new Set([athlete.city, athlete.province].filter(Boolean))].join(", ")
    : "";
  const rawPhoto = athlete?.photo_url && /^https?:\/\//.test(athlete.photo_url) ? athlete.photo_url : null;
  const photo = rawPhoto ? await fetchAsDataUrl(rawPhoto) : null;
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0A1A2F",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Franja de 5 colores arriba */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, display: "flex" }}>
          {["#0072CE", "#F4C300", "#111111", "#009F3D", "#DF0024"].map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>

        {/* Columna de texto */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px", width: photo ? 660 : 1200 }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#ffffff", fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>GRANIT</span>
            <span style={{ color: "#C9A227", fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>O</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {sportLabel && (
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  background: color,
                  color: "#ffffff",
                  fontSize: 24,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  padding: "6px 16px",
                  borderRadius: 6,
                  marginBottom: 20,
                }}
              >
                {sportLabel}
              </div>
            )}
            <div style={{ display: "flex", color: "#ffffff", fontSize: photo ? 68 : 88, fontWeight: 800, lineHeight: 1.02, textTransform: "uppercase" }}>
              {name}
            </div>
            {location && (
              <div style={{ display: "flex", color: "rgba(255,255,255,0.6)", fontSize: 30, marginTop: 16 }}>{location}</div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", background: "#C9A227", color: "#0A1A2F", fontSize: 26, fontWeight: 800, padding: "14px 28px", borderRadius: 10 }}>
              Apoyá su camino
            </div>
            <div style={{ display: "flex", color: "rgba(255,255,255,0.5)", fontSize: 24, marginLeft: 22 }}>somosgranito.com</div>
          </div>
        </div>

        {/* Foto (si es URL absoluta) o bloque con iniciales */}
        {photo ? (
          <div style={{ display: "flex", width: 540, height: "100%", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" width={540} height={630} style={{ width: 540, height: 630, objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: 160, height: "100%", background: "linear-gradient(90deg,#0A1A2F,transparent)" }} />
          </div>
        ) : null}

        {!photo && (
          <div
            style={{
              position: "absolute",
              right: 64,
              top: 200,
              width: 230,
              height: 230,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 40,
              background: `${color}22`,
              border: `4px solid ${color}`,
              color: color,
              fontSize: 96,
              fontWeight: 800,
            }}
          >
            {initials}
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
