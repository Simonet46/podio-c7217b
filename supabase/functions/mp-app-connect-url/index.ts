// Edge Function: mp-app-connect-url
// La llama el FORM de postulación (público) después de enviar, para que el
// atleta conecte su Mercado Pago como parte del registro. Verifica que la
// postulación exista y esté pendiente, firma un `state` con el application_id
// y devuelve la URL de autorización de MP.
//
// Secrets: MP_CLIENT_ID, MP_REDIRECT_URI, STATE_SECRET, SUPABASE_SERVICE_ROLE_KEY.
// Deploy con --no-verify-jwt (lo llama el sitio público).
import { cors, json, signState, serviceClient } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const { application_id } = await req.json().catch(() => ({}));
  if (!application_id) return json({ error: "Falta application_id." }, 400);

  // Anti-abuso básico: la postulación tiene que existir y estar pendiente.
  const supa = serviceClient();
  const { data: app } = await supa
    .from("athlete_applications")
    .select("id, status")
    .eq("id", application_id)
    .single();
  if (!app) return json({ error: "Postulación no encontrada." }, 404);
  if (app.status !== "pending") {
    return json({ error: "Esta postulación ya no admite conexión." }, 409);
  }

  const state = await signState({
    application_id,
    kind: "mp-connect-app",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 días
  });

  const clientId = (Deno.env.get("MP_CLIENT_ID") ?? "").trim();
  const redirectUri = (Deno.env.get("MP_REDIRECT_URI") ?? "").trim();
  const authUrl =
    `https://auth.mercadopago.com/authorization?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code&platform_id=mp&state=${encodeURIComponent(state)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return json({ url: authUrl });
});
