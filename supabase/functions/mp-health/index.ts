// Edge Function: mp-health (cron diario, 11:30 UTC)
// Salud de las conexiones de Mercado Pago de atletas y equipos:
//   1. Renueva los tokens OAuth que vencen en menos de 30 días (MP los emite
//      por 180 días; sin esto, los cobros empiezan a fallar en silencio).
//   2. Pregunta a MP si cada cuenta puede cobrar (status.sell.allow). Si no
//      puede, pasa al atleta a "Sin cobros" (mp_connected=false) y guarda el
//      motivo; cuando MP la vuelve a habilitar, la re-publica sola (solo si el
//      bloqueo lo puso esta función, nunca los "Sin cobros" puestos a mano).
//   3. Avisa a hola@ con lo que cambió o falló.
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY, MP_CLIENT_ID, MP_CLIENT_SECRET, RESEND_API_KEY.
// Lo llama pg_cron con el service_role (ver migración 20261021150000).
import { json, serviceClient, ADMIN_URL } from "../_shared/util.ts";

const ADMIN_INBOX = "hola@somosgranito.com";
const FROM = "GRANITO <no-reply@somosgranito.com>";
const RENEW_BEFORE_DAYS = 30;

type Account = {
  key: string;            // athlete_id | team_id
  table: "athlete_mp_accounts" | "team_mp_accounts";
  idCol: "athlete_id" | "team_id";
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
};

type Finding = { quien: string; que: string; ok: boolean };

async function refreshToken(acct: Account, supa: ReturnType<typeof serviceClient>): Promise<{ ok: boolean; detail?: string }> {
  if (!acct.refresh_token) return { ok: false, detail: "sin refresh_token guardado (tiene que reconectar)" };
  const res = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: (Deno.env.get("MP_CLIENT_ID") ?? "").trim(),
      client_secret: (Deno.env.get("MP_CLIENT_SECRET") ?? "").trim(),
      grant_type: "refresh_token",
      refresh_token: acct.refresh_token,
    }),
  });
  if (!res.ok) return { ok: false, detail: `${res.status} ${(await res.text()).slice(0, 160)}` };
  const tok = await res.json();
  const expiresAt = tok.expires_in ? new Date(Date.now() + Number(tok.expires_in) * 1000).toISOString() : null;
  const { error } = await supa
    .from(acct.table)
    .update({
      access_token: tok.access_token,
      refresh_token: tok.refresh_token ?? acct.refresh_token,
      public_key: tok.public_key ?? undefined,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq(acct.idCol, acct.key);
  if (error) return { ok: false, detail: "no se pudo guardar el token nuevo: " + error.message };
  acct.access_token = tok.access_token;
  return { ok: true };
}

async function sellerStatus(token: string): Promise<{ allow: boolean | null; codes: string[]; detail?: string }> {
  const r = await fetch("https://api.mercadopago.com/users/me", { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return { allow: null, codes: [], detail: `${r.status}` };
  const u = await r.json();
  const allow = u?.status?.sell?.allow;
  const codes = [...(u?.status?.sell?.codes ?? []), ...(u?.status?.billing?.codes ?? [])];
  if (u?.status?.required_action) codes.push(`required_action:${u.status.required_action}`);
  return { allow: typeof allow === "boolean" ? allow : null, codes };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  const supa = serviceClient();
  const findings: Finding[] = [];
  const now = Date.now();
  const soon = now + RENEW_BEFORE_DAYS * 86_400_000;

  // ── Cuentas ──
  const [{ data: athAccts }, { data: teamAccts }, { data: athletes }, { data: teams }] = await Promise.all([
    supa.from("athlete_mp_accounts").select("athlete_id,access_token,refresh_token,token_expires_at"),
    supa.from("team_mp_accounts").select("team_id,access_token,refresh_token,token_expires_at"),
    supa.from("athletes").select("id,full_name,slug,mp_connected,mp_blocked_reason"),
    supa.from("team_applications").select("id,team_name,slug,mp_blocked_reason"),
  ]);
  const athName = (id: string) => athletes?.find((a) => a.id === id)?.full_name ?? id;
  const teamName = (id: string) => teams?.find((t) => t.id === id)?.team_name ?? id;

  const accounts: Account[] = [
    ...(athAccts ?? []).map((a) => ({ key: a.athlete_id, table: "athlete_mp_accounts" as const, idCol: "athlete_id" as const, access_token: a.access_token, refresh_token: a.refresh_token, token_expires_at: a.token_expires_at })),
    ...(teamAccts ?? []).map((t) => ({ key: t.team_id, table: "team_mp_accounts" as const, idCol: "team_id" as const, access_token: t.access_token, refresh_token: t.refresh_token, token_expires_at: t.token_expires_at })),
  ];

  let renovados = 0, bloqueados = 0, rehabilitados = 0;

  for (const acct of accounts) {
    const quien = acct.table === "athlete_mp_accounts" ? athName(acct.key) : `equipo ${teamName(acct.key)}`;
    if (!acct.access_token) continue;

    // 1. Renovación del token
    const exp = acct.token_expires_at ? new Date(acct.token_expires_at).getTime() : null;
    if (exp !== null && exp < soon) {
      const r = await refreshToken(acct, supa);
      if (r.ok) { renovados++; findings.push({ quien, que: "token de Mercado Pago renovado por 180 días", ok: true }); }
      else findings.push({ quien, que: `NO se pudo renovar el token (vence ${acct.token_expires_at?.slice(0, 10)}): ${r.detail}. Hay que pedirle que reconecte su Mercado Pago desde el admin.`, ok: false });
    }

    // 2. ¿Puede cobrar?
    const st = await sellerStatus(acct.access_token);
    const checkedAt = new Date().toISOString();
    if (acct.table === "athlete_mp_accounts") {
      const a = athletes?.find((x) => x.id === acct.key);
      if (!a) continue;
      if (st.allow === false) {
        const reason = st.codes.length ? st.codes.join(", ") : "Mercado Pago no permite cobrar a esta cuenta";
        if (a.mp_connected !== false || a.mp_blocked_reason !== reason) {
          await supa.from("athletes").update({ mp_connected: false, mp_blocked_reason: reason, mp_checked_at: checkedAt }).eq("id", a.id);
          if (a.mp_connected !== false) { bloqueados++; findings.push({ quien, que: `pasó a "Sin cobros": su cuenta de Mercado Pago no puede recibir pagos (${reason})`, ok: false }); }
        } else {
          await supa.from("athletes").update({ mp_checked_at: checkedAt }).eq("id", a.id);
        }
      } else if (st.allow === true) {
        if (a.mp_blocked_reason) {
          // Solo re-publicamos lo que bloqueó esta función.
          await supa.from("athletes").update({ mp_connected: true, mp_blocked_reason: null, mp_checked_at: checkedAt }).eq("id", a.id);
          rehabilitados++;
          findings.push({ quien, que: "Mercado Pago volvió a habilitar su cuenta: vuelve a recibir aportes", ok: true });
        } else {
          await supa.from("athletes").update({ mp_checked_at: checkedAt }).eq("id", a.id);
        }
      } else if (st.detail) {
        findings.push({ quien, que: `no se pudo consultar su cuenta en Mercado Pago (${st.detail}); si se repite, que reconecte`, ok: false });
      }
    } else {
      const t = teams?.find((x) => x.id === acct.key);
      if (!t) continue;
      if (st.allow === false) {
        const reason = st.codes.length ? st.codes.join(", ") : "Mercado Pago no permite cobrar a esta cuenta";
        if (t.mp_blocked_reason !== reason) {
          await supa.from("team_applications").update({ mp_blocked_reason: reason, mp_checked_at: checkedAt }).eq("id", t.id);
          bloqueados++;
          findings.push({ quien, que: `su cuenta de Mercado Pago no puede recibir pagos (${reason}): los aportes al proyecto van a fallar hasta que lo resuelvan`, ok: false });
        } else {
          await supa.from("team_applications").update({ mp_checked_at: checkedAt }).eq("id", t.id);
        }
      } else if (st.allow === true) {
        if (t.mp_blocked_reason) { rehabilitados++; findings.push({ quien, que: "Mercado Pago volvió a habilitar la cuenta del proyecto", ok: true }); }
        await supa.from("team_applications").update({ mp_blocked_reason: null, mp_checked_at: checkedAt }).eq("id", t.id);
      }
    }
  }

  // 3. Aviso al equipo, solo si pasó algo.
  const resendKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (resendKey && findings.length > 0) {
    const filas = findings
      .map((f) => `<li style="margin:6px 0;color:${f.ok ? "#1f7a3f" : "#b3261e"}"><strong>${f.quien}</strong>: ${f.que}</li>`)
      .join("");
    const malas = findings.filter((f) => !f.ok).length;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: FROM,
        to: [ADMIN_INBOX],
        subject: malas > 0 ? `Mercado Pago: ${malas} cuenta(s) con problemas` : `Mercado Pago: ${renovados} token(s) renovado(s)`,
        html: `<p style="font-family:Arial;font-size:14px">Chequeo diario de las cuentas de Mercado Pago de atletas y proyectos:</p>
<ul style="font-family:Arial;font-size:14px">${filas}</ul>
<p style="font-family:Arial;font-size:12px;color:#888">Los atletas bloqueados aparecen como "Sin cobros" en <a href="${ADMIN_URL}/backoffice/">el admin</a>; el botón "Ver datos" muestra el motivo exacto. Cuando Mercado Pago vuelva a habilitarlos, se publican solos. — mp-health</p>`,
      }),
    }).catch((e) => console.error("No se pudo mandar el aviso:", e));
  }

  console.log(`mp-health: ${accounts.length} cuentas, ${renovados} renovados, ${bloqueados} bloqueados, ${rehabilitados} rehabilitados`, findings);
  return json({ ok: true, cuentas: accounts.length, renovados, bloqueados, rehabilitados, findings });
});
