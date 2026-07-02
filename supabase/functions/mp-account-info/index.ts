// Edge Function: mp-account-info
// El admin la llama para ver los datos del TITULAR de la cuenta de Mercado Pago
// conectada por un atleta (para verificar que la cuenta es suya). Usa el
// access_token del atleta para consultar /users/me en MP.
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json, serviceClient } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // Solo admin (con su propio JWT).
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: isAdmin, error: adminErr } = await userClient.rpc("is_admin");
  if (adminErr) return json({ error: "No se pudo validar el usuario." }, 401);
  if (isAdmin !== true) return json({ error: "No autorizado." }, 403);

  const { athlete_id } = await req.json().catch(() => ({}));
  if (!athlete_id) return json({ error: "Falta athlete_id." }, 400);

  const supa = serviceClient();
  const { data: acct } = await supa
    .from("athlete_mp_accounts")
    .select("access_token, mp_user_id")
    .eq("athlete_id", athlete_id)
    .single();
  if (!acct?.access_token) {
    return json({ error: "Este atleta no tiene Mercado Pago conectado." }, 404);
  }

  const r = await fetch("https://api.mercadopago.com/users/me", {
    headers: { Authorization: `Bearer ${acct.access_token}` },
  });
  if (!r.ok) {
    return json({ error: "MP no devolvió los datos: " + (await r.text()).slice(0, 200) }, 502);
  }
  const u = await r.json();
  return json({
    id: u.id,
    nickname: u.nickname ?? null,
    first_name: u.first_name ?? null,
    last_name: u.last_name ?? null,
    email: u.email ?? null,
    identification: u.identification ?? null, // { type, number } (DNI)
    site_id: u.site_id ?? null,
    live_mode: !u?.test_user,
  });
});
