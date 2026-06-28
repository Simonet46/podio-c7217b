// Edge Function: mp-connect-link
// El admin (backoffice) pide el link de conexión de Mercado Pago para un atleta.
// Devuelve la URL de autorización OAuth de MP con un `state` firmado que ata el
// athlete_id. Solo un admin puede emitirlo => nadie puede conectar SU MP a la
// cuenta de otro atleta.
//
// Secrets: MP_CLIENT_ID, MP_REDIRECT_URI, STATE_SECRET, SUPABASE_ANON_KEY.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json, signState } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // Verificar que quien llama es admin, usando su propio JWT.
  const authHeader = req.headers.get("Authorization") ?? "";
  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: isAdmin, error } = await supa.rpc("is_admin");
  if (error) return json({ error: "No se pudo validar el usuario." }, 401);
  if (isAdmin !== true) return json({ error: "No autorizado." }, 403);

  const { athlete_id } = await req.json().catch(() => ({}));
  if (!athlete_id) return json({ error: "Falta athlete_id." }, 400);

  // state firmado, válido 7 días.
  const state = await signState({
    athlete_id,
    kind: "mp-connect",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  const clientId = (Deno.env.get("MP_CLIENT_ID") ?? "").trim();
  const redirectUri = (Deno.env.get("MP_REDIRECT_URI") ?? "").trim();
  const authUrl =
    `https://auth.mercadopago.com/authorization?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code&platform_id=mp&state=${encodeURIComponent(state)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return json({ url: authUrl });
});
