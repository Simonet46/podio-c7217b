// Edge Function: track
// Medidor propio de visitas del sitio público. El navegador manda un beacon
// por vista de página (y por los eventos del embudo de aporte) y acá se guarda
// en `page_views` SIN cookies ni datos personales: ruta, tipo de página,
// dispositivo (por user-agent), origen (por referrer / utm_source), idioma y
// un hash diario de ip+navegador para contar visitantes únicos aproximados.
//
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Deploy con --no-verify-jwt: lo llama el sitio público con sendBeacon, que no
// puede mandar headers (por eso el body viaja como text/plain con JSON adentro).
import { cors, json, serviceClient } from "../_shared/util.ts";

const EVENTS = new Set(["pageview", "apoyar_click", "checkout", "gracias"]);
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pingdom/i;

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "";
}

function device(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|silk|kindle|playbook/i.test(ua)) return "tablet";
  if (/android(?!.*mobile)/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|windows phone|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

/** Clasifica la página por su ruta. Devuelve kind + slug (atleta/equipo). */
function classify(pathname: string): { kind: string; slug: string | null } {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/") return { kind: "home", slug: null };
  let m = p.match(/^\/atleta\/([^/]+)$/);
  if (m) return { kind: "atleta", slug: decodeURIComponent(m[1]) };
  m = p.match(/^\/equipos?\/([^/]+)$/);
  if (m) return { kind: "equipo", slug: decodeURIComponent(m[1]) };
  if (/^\/(postulate|para-atletas|para-equipos)/.test(p)) return { kind: "postulacion", slug: null };
  if (/^\/empresas/.test(p)) return { kind: "empresas", slug: null };
  if (/^\/(legal|terminos|privacidad|verificacion|transparencia)/.test(p)) return { kind: "legal", slug: null };
  if (/^\/gracias/.test(p)) return { kind: "gracias", slug: null };
  if (/^\/(quienes-somos|como-funciona|faq|atletas|equipos)$/.test(p)) return { kind: "info", slug: null };
  return { kind: "otro", slug: null };
}

/** De dónde llegó: utm_source gana; si no, el host del referrer. */
function source(utm: string | null, refHost: string | null): string {
  const u = (utm ?? "").toLowerCase();
  const h = (refHost ?? "").toLowerCase();
  const t = u || h;
  if (!t) return "directo";
  if (/instagram|^ig$/.test(t)) return "instagram";
  if (/whatsapp|wa\.me/.test(t)) return "whatsapp";
  if (/facebook|fb\.me|^fb$/.test(t)) return "facebook";
  if (/google/.test(t)) return "google";
  if (/tiktok/.test(t)) return "tiktok";
  if (/twitter|t\.co|^x\.com$|^x$/.test(t)) return "x";
  if (/linkedin|lnkd/.test(t)) return "linkedin";
  if (/somosgranito\.com$/.test(h)) return "directo"; // navegación interna
  return "otro";
}

async function visitorHash(ip: string, ua: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${ip}|${ua}|${day}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  // sendBeacon manda text/plain; fetch manda application/json. Aceptamos ambos.
  let body: Record<string, unknown> | null = null;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }
  if (!body) return json({ error: "JSON inválido." }, 400);

  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new Response(null, { status: 204, headers: cors });

  const event = typeof body.event === "string" && EVENTS.has(body.event) ? body.event : "pageview";
  const rawPath = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
  let pathname = rawPath;
  let utm: string | null = null;
  try {
    const u = new URL(rawPath, "https://somosgranito.com");
    pathname = u.pathname;
    utm = u.searchParams.get("utm_source");
  } catch { /* ruta rara: se guarda tal cual */ }

  // No medimos el admin ni el panel del atleta.
  if (/^\/(backoffice|mi-perfil)/.test(pathname)) return new Response(null, { status: 204, headers: cors });

  let refHost: string | null = null;
  if (typeof body.ref === "string" && body.ref) {
    try { refHost = new URL(body.ref).hostname.replace(/^www\./, ""); } catch { refHost = null; }
  }

  const { kind, slug } = classify(pathname);
  const row = {
    event,
    path: pathname,
    kind,
    slug,
    device: device(ua),
    source: source(utm, refHost),
    referrer_host: refHost,
    lang: typeof body.lang === "string" ? body.lang.slice(0, 16) : null,
    visitor: await visitorHash(clientIp(req), ua),
  };

  const supa = serviceClient();
  const { error } = await supa.from("page_views").insert(row);
  if (error) console.error("page_views insert falló:", error.message);

  return new Response(null, { status: 204, headers: cors });
});
