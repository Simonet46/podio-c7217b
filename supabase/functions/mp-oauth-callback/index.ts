// Edge Function: mp-oauth-callback
// MP redirige acá tras la autorización (?code=...&state=...). El `state` firmado
// puede ser de un ATLETA (kind "mp-connect") o de una POSTULACIÓN (kind
// "mp-connect-app", cuando el atleta conecta su MP durante el registro, en popup).
//
// Secrets: MP_CLIENT_ID, MP_CLIENT_SECRET, MP_REDIRECT_URI, STATE_SECRET,
//          SUPABASE_SERVICE_ROLE_KEY, (opcional) SITE_URL.
// Deploy con --no-verify-jwt (lo llama el navegador, sin JWT de Supabase).
import { verifyState, serviceClient, SITE_URL } from "../_shared/util.ts";

function redirect(to: string) {
  return new Response(null, { status: 302, headers: { Location: to } });
}

Deno.serve(async (req) => {
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state") ?? "";

  const payload = await verifyState<{
    athlete_id?: string;
    connect_token?: string;
    kind: string;
  }>(state);
  const okKind =
    payload && (payload.kind === "mp-connect" || payload.kind === "mp-connect-app");
  const isApp = payload?.kind === "mp-connect-app";
  if (!code || !payload || !okKind) {
    const base = isApp ? `${SITE_URL}/mp-listo/` : `${SITE_URL}/`;
    const reason = !code ? "mp_no_devolvio_code" : "link_invalido_o_vencido";
    return redirect(`${base}?mp=error&reason=${encodeURIComponent(reason)}`);
  }

  // El flujo de postulación vuelve a una página "popup" que se cierra sola.
  const okTarget = isApp ? `${SITE_URL}/mp-listo/?mp=ok` : `${SITE_URL}/?mp=ok`;
  const errTarget = (reason: string) =>
    (isApp ? `${SITE_URL}/mp-listo/?mp=error` : `${SITE_URL}/?mp=error`) +
    `&reason=${encodeURIComponent(reason)}`;

  // Intercambiar el code por el token del vendedor.
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
    const detail = await res.text();
    console.error("MP token exchange falló:", res.status, detail);
    return redirect(errTarget("mp:" + detail.slice(0, 220)));
  }

  const tok = await res.json();
  const expiresAt = tok.expires_in
    ? new Date(Date.now() + Number(tok.expires_in) * 1000).toISOString()
    : null;

  const row = {
    mp_user_id: String(tok.user_id ?? ""),
    access_token: tok.access_token,
    refresh_token: tok.refresh_token ?? null,
    public_key: tok.public_key ?? null,
    token_expires_at: expiresAt,
    live_mode: Boolean(tok.live_mode),
    updated_at: new Date().toISOString(),
  };

  const supa = serviceClient();

  if (isApp) {
    // Conexión durante el registro: el token queda "en tránsito" atado al
    // connect_token (el form lo reclama al enviar la postulación).
    const { updated_at: _omit, ...pendRow } = row;
    const { error } = await supa
      .from("pending_mp_connections")
      .upsert({ connect_token: payload.connect_token, ...pendRow });
    if (error) {
      console.error("No se pudo guardar el token (pending):", error.message);
      return redirect(errTarget("db:" + error.message.slice(0, 150)));
    }
    return redirect(okTarget);
  }

  const { error } = await supa
    .from("athlete_mp_accounts")
    .upsert({ athlete_id: payload.athlete_id, ...row });
  if (error) {
    console.error("No se pudo guardar el token (atleta):", error.message);
    return redirect(errTarget("db:" + error.message.slice(0, 150)));
  }
  await supa
    .from("athletes")
    .update({ mp_connected: true })
    .eq("id", payload.athlete_id);
  return redirect(okTarget);
});
