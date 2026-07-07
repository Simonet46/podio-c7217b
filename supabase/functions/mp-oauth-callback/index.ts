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

/** Dispara la reconstrucción del sitio estático (para que el atleta recién
 *  publicado aparezca sin que un admin tenga que tocar "Publicar ahora"). */
async function triggerRebuild() {
  const token = Deno.env.get("GITHUB_TOKEN");
  if (!token) return;
  const repo = Deno.env.get("GITHUB_REPO") ?? "Simonet46/podio-c7217b";
  const workflow = Deno.env.get("GITHUB_WORKFLOW") ?? "deploy.yml";
  try {
    await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "granito-oauth",
        },
        body: JSON.stringify({ ref: "main" }),
      },
    );
  } catch (e) {
    console.error("No se pudo disparar el rebuild:", e);
  }
}

Deno.serve(async (req) => {
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state") ?? "";

  const payload = await verifyState<{
    athlete_id?: string;
    connect_token?: string;
    application_id?: string;
    team_id?: string;
    kind: string;
  }>(state);
  // Kinds: mp-connect (atleta desde su panel) · mp-connect-app (popup del form)
  //        mp-connect-app-direct (link enviado por email, atado a la postulación)
  //        mp-connect-team (equipo en campaña: cobra los compromisos validados)
  const okKind =
    payload &&
    (payload.kind === "mp-connect" ||
      payload.kind === "mp-connect-app" ||
      payload.kind === "mp-connect-app-direct" ||
      payload.kind === "mp-connect-team");
  const isApp = payload?.kind === "mp-connect-app";
  const isAppDirect = payload?.kind === "mp-connect-app-direct";
  const isTeam = payload?.kind === "mp-connect-team";
  if (!code || !payload || !okKind) {
    const base = isApp || isAppDirect ? `${SITE_URL}/mp-listo/` : `${SITE_URL}/`;
    const reason = !code ? "mp_no_devolvio_code" : "link_invalido_o_vencido";
    return redirect(`${base}?mp=error&reason=${encodeURIComponent(reason)}`);
  }

  // El flujo de postulación (y el de equipo, que llega por un link enviado
  // por el admin) vuelve a la página "listo" que se cierra sola.
  const usesDonePage = isApp || isAppDirect || isTeam;
  const okTarget = usesDonePage ? `${SITE_URL}/mp-listo/?mp=ok` : `${SITE_URL}/?mp=ok`;
  const errTarget = (reason: string) =>
    (usesDonePage ? `${SITE_URL}/mp-listo/?mp=error` : `${SITE_URL}/?mp=error`) +
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

  // Conexión del Mercado Pago de un EQUIPO en campaña.
  if (isTeam) {
    const teamId = payload.team_id!;
    const { error } = await supa.from("team_mp_accounts").upsert({
      team_id: teamId,
      ...row,
      connected_at: new Date().toISOString(),
    });
    if (error) {
      console.error("No se pudo guardar el token (equipo):", error.message);
      return redirect(errTarget("db:" + error.message.slice(0, 150)));
    }
    await supa.from("team_applications").update({ mp_connected: true }).eq("id", teamId);
    return redirect(okTarget);
  }

  // Conexión vía link de email: el token queda atado a la POSTULACIÓN.
  // Si la postulación ya fue aprobada (tiene atleta), lo migramos al toque.
  if (isAppDirect) {
    const appId = payload.application_id!;
    const { error } = await supa.from("application_mp_accounts").upsert({
      application_id: appId,
      mp_user_id: row.mp_user_id,
      access_token: row.access_token,
      refresh_token: row.refresh_token,
      public_key: row.public_key,
      token_expires_at: row.token_expires_at,
      live_mode: row.live_mode,
      connected_at: new Date().toISOString(),
      updated_at: row.updated_at,
    });
    if (error) {
      console.error("No se pudo guardar el token (app-direct):", error.message);
      return redirect(errTarget("db:" + error.message.slice(0, 150)));
    }
    await supa.from("athlete_applications").update({ mp_connected: true }).eq("id", appId);

    // ¿Ya existe el atleta? Migrar la conexión (tenemos el token en mano) y
    // publicarlo si es su primera conexión de MP.
    const { data: app } = await supa
      .from("athlete_applications")
      .select("athlete_id")
      .eq("id", appId)
      .maybeSingle();
    if (app?.athlete_id) {
      const { data: prev } = await supa
        .from("athletes")
        .select("mp_connected")
        .eq("id", app.athlete_id)
        .maybeSingle();
      const { error: e2 } = await supa
        .from("athlete_mp_accounts")
        .upsert({ athlete_id: app.athlete_id, ...row });
      if (!e2) {
        const publish = !prev?.mp_connected;
        const patch: Record<string, unknown> = { mp_connected: true };
        if (publish) patch.verified = true;
        await supa.from("athletes").update(patch).eq("id", app.athlete_id);
        await supa.from("application_mp_accounts").delete().eq("application_id", appId);
        if (publish) await triggerRebuild();
      }
    }
    return redirect(okTarget);
  }

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

  // Un atleta no se publica sin vía de cobro. La PRIMERA vez que conecta MP,
  // lo publicamos automáticamente. Si ya tenía MP (p.ej. reconexión de alguien
  // suspendido a mano), NO tocamos `verified` para no saltear la moderación.
  const { data: prev } = await supa
    .from("athletes")
    .select("mp_connected")
    .eq("id", payload.athlete_id)
    .maybeSingle();
  const firstConnection = !prev?.mp_connected;

  const patch: Record<string, unknown> = { mp_connected: true };
  if (firstConnection) patch.verified = true;
  await supa.from("athletes").update(patch).eq("id", payload.athlete_id);
  // Recién publicado → reconstruir el sitio para que aparezca en la web.
  if (firstConnection) await triggerRebuild();
  return redirect(okTarget);
});
