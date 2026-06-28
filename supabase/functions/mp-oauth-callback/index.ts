// Edge Function: mp-oauth-callback
// MP redirige acá tras la autorización del atleta (?code=...&state=...).
// Verifica el state firmado, intercambia el code por el access_token del atleta
// y lo guarda en athlete_mp_accounts (tabla blindada). Marca athletes.mp_connected.
//
// Secrets: MP_CLIENT_ID, MP_CLIENT_SECRET, MP_REDIRECT_URI, STATE_SECRET,
//          SUPABASE_SERVICE_ROLE_KEY, (opcional) SITE_URL.
// Deploy con --no-verify-jwt (lo llama el navegador del atleta, sin JWT de Supabase).
import { verifyState, serviceClient, SITE_URL } from "../_shared/util.ts";

function redirect(to: string) {
  return new Response(null, { status: 302, headers: { Location: to } });
}

Deno.serve(async (req) => {
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state") ?? "";

  const payload = await verifyState<{ athlete_id: string; kind: string }>(state);
  if (!code || !payload || payload.kind !== "mp-connect") {
    return redirect(`${SITE_URL}/?mp=error`);
  }

  // Intercambiar el code por tokens del atleta (vendedor).
  const res = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: (Deno.env.get("MP_CLIENT_ID") ?? "").trim(),
      client_secret: (Deno.env.get("MP_CLIENT_SECRET") ?? "").trim(),
      code,
      grant_type: "authorization_code",
      redirect_uri: (Deno.env.get("MP_REDIRECT_URI") ?? "").trim(),
    }),
  });

  if (!res.ok) {
    console.error("MP token exchange falló:", res.status, await res.text());
    return redirect(`${SITE_URL}/?mp=error`);
  }

  const tok = await res.json();
  // tok: { access_token, refresh_token, user_id, public_key, expires_in, live_mode }
  const expiresAt = tok.expires_in
    ? new Date(Date.now() + Number(tok.expires_in) * 1000).toISOString()
    : null;

  const supa = serviceClient();
  const { error: upErr } = await supa.from("athlete_mp_accounts").upsert({
    athlete_id: payload.athlete_id,
    mp_user_id: String(tok.user_id ?? ""),
    access_token: tok.access_token,
    refresh_token: tok.refresh_token ?? null,
    public_key: tok.public_key ?? null,
    token_expires_at: expiresAt,
    live_mode: Boolean(tok.live_mode),
    updated_at: new Date().toISOString(),
  });

  if (upErr) {
    console.error("No se pudo guardar el token:", upErr.message);
    return redirect(`${SITE_URL}/?mp=error`);
  }

  await supa
    .from("athletes")
    .update({ mp_connected: true })
    .eq("id", payload.athlete_id);

  return redirect(`${SITE_URL}/?mp=ok`);
});
