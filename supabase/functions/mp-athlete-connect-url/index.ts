// Edge Function: mp-athlete-connect-url
// El atleta (con su propio JWT) pide el link de conexión de MP para vincularse
// desde su dashboard. No requiere ser admin: verifica que el JWT pertenezca a
// un atleta registrado y emite el state firmado con su athlete_id.
//
// Secrets: MP_CLIENT_ID, MP_REDIRECT_URI, STATE_SECRET, SUPABASE_ANON_KEY.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json, signState } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: userErr } = await supa.auth.getUser();
  if (userErr || !user) return json({ error: "No autenticado." }, 401);

  // Buscar el atleta vinculado a este usuario.
  const { data: athlete } = await supa
    .from("athletes")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!athlete?.id) return json({ error: "No hay un atleta vinculado a tu cuenta." }, 404);

  const state = await signState({
    athlete_id: athlete.id,
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
