// Edge Function: record-acceptance
// Registra la evidencia de una aceptación de documento(s) legal(es) en la tabla
// legal_acceptances, capturando IP y user-agent del request del lado del servidor
// (más confiable que confiar en el navegador). Kahale secc. 10: "conservar
// evidencia técnica adecuada: versión de los términos, fecha y hora, usuario,
// dirección IP, dispositivo o sesión, campaña…".
//
// La llama el sitio público después de que el usuario acepta (postulación de
// atleta/equipo, o donación). Acepta 1 o N documentos en una sola llamada.
//
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Deploy con --no-verify-jwt (lo llama el sitio público, sin sesión).
import { cors, json, serviceClient } from "../_shared/util.ts";

type ActorType = "atleta" | "donante" | "equipo";
type Context = "postulacion" | "alta" | "donacion" | "actualizacion";

interface AcceptedDoc {
  doc_type: string;
  doc_version: string;
}

interface Payload {
  actor_type: ActorType;
  context: Context;
  /** Uno o varios documentos aceptados en el mismo acto. */
  documents: AcceptedDoc[];
  email?: string | null;
  user_id?: string | null;
  /** id de la postulación / external_reference del pago / id del equipo. */
  related_id?: string | null;
  /** Extra: monto, campaña, prefijo telefónico, etc. */
  meta?: Record<string, unknown>;
}

const ACTOR_TYPES = new Set(["atleta", "donante", "equipo"]);
const CONTEXTS = new Set(["postulacion", "alta", "donacion", "actualizacion"]);

/** Primera IP de x-forwarded-for (la del cliente real detrás del proxy). */
function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim() || null;
  return req.headers.get("x-real-ip");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  const body = (await req.json().catch(() => null)) as Payload | null;
  if (!body) return json({ error: "JSON inválido." }, 400);

  const { actor_type, context, documents } = body;
  if (!ACTOR_TYPES.has(actor_type)) {
    return json({ error: "actor_type inválido (atleta | donante | equipo)." }, 400);
  }
  if (!CONTEXTS.has(context)) {
    return json({ error: "context inválido (postulacion | alta | donacion | actualizacion)." }, 400);
  }
  if (!Array.isArray(documents) || documents.length === 0) {
    return json({ error: "Falta la lista de documents aceptados." }, 400);
  }
  const valid = documents.filter(
    (d) => d && typeof d.doc_type === "string" && typeof d.doc_version === "string",
  );
  if (valid.length === 0) {
    return json({ error: "Ningún documento válido (doc_type + doc_version)." }, 400);
  }

  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent");
  const now = new Date().toISOString();

  const rows = valid.map((d) => ({
    doc_type: d.doc_type,
    doc_version: d.doc_version,
    actor_type,
    context,
    email: body.email ?? null,
    user_id: body.user_id ?? null,
    related_id: body.related_id ?? null,
    ip,
    user_agent: userAgent,
    meta: body.meta ?? {},
    created_at: now,
  }));

  const supa = serviceClient();
  const { error } = await supa.from("legal_acceptances").insert(rows);
  if (error) {
    console.error("record-acceptance insert falló:", error);
    return json({ ok: false, error: "No se pudo registrar la aceptación." }, 500);
  }

  return json({ ok: true, recorded: rows.length });
});
