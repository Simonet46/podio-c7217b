// Edge Function: mp-oauth-callback
// MP redirige acá tras la autorización (?code=...&state=...). El `state` firmado
// puede ser de un ATLETA (kind "mp-connect") o de una POSTULACIÓN (kind
// "mp-connect-app", cuando el atleta conecta su MP durante el registro).
// Intercambia el code por el token y lo guarda en la tabla que corresponda.
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
    application_id?: string;
    kind: string;
  }>(state);
  const okKind =
    payload && (payload.kind === "mp-connect" || payload.kind === "mp-connect-app");
  if (!code || !payload || !okKind) {
    const reason = !code ? "sin_code" : "link_invalido_o_vencido";
    return redirect(`${SITE_URL}/?mp=error&reason=${encodeURIComponent(reason)}`);
  }

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
    return redirect(`${SITE_URL}/?mp=error&reason=${encodeURIComponent("mp:" + detail.slice(0, 220))}`);
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
  let upErr: { message: string } | null = null;

  if (payload.kind === "mp-connect-app") {
    // Conexión durante el registro: se ata a la POSTULACIÓN.
    const r = await supa
      .from("application_mp_accounts")
      .upsert({ application_id: payload.application_id, ...row });
    upErr = r.error;
    if (!upErr) {
      await supa
        .from("athlete_applications")
        .update({ mp_connected: true })
        .eq("id", payload.application_id);
      return redirect(`${SITE_URL}/?mp=ok&ctx=postulacion`);
    }
  } else {
    // Conexión de un atleta ya dado de alta.
    const r = await supa
      .from("athlete_mp_accounts")
      .upsert({ athlete_id: payload.athlete_id, ...row });
    upErr = r.error;
    if (!upErr) {
      await supa
        .from("athletes")
        .update({ mp_connected: true })
        .eq("id", payload.athlete_id);
      return redirect(`${SITE_URL}/?mp=ok`);
    }
  }

  console.error("No se pudo guardar el token:", upErr?.message);
  return redirect(
    `${SITE_URL}/?mp=error&reason=${encodeURIComponent("db:" + (upErr?.message ?? "").slice(0, 150))}`,
  );
});
