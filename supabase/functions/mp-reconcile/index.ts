// Edge Function: mp-reconcile
// Red de seguridad contra webhooks perdidos: compara los pagos que existen en
// Mercado Pago (buscando por external_reference, cuenta por cuenta) contra lo
// registrado en `donations` y `team_pledges`. Lo que falta —o cambió de
// estado— se reinyecta llamando a mp-webhook, que es idempotente y hace todo
// el circuito (registro + email de agradecimiento). Si arregló algo, avisa
// por email al equipo.
//
// Por qué existe: el 04/08/2026 un redeploy dejó a mp-webhook exigiendo JWT y
// las notificaciones de MP rebotaron con 401 durante 9 días. Se perdieron 4
// donaciones reales que hubo que reconciliar a mano. Esto es esa
// reconciliación, todos los días, sola.
//
// La llama pg_cron una vez por día (con el service_role desde Vault) y
// también se puede disparar a mano desde el backoffice (JWT de admin).
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, RESEND_API_KEY.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json, serviceClient } from "../_shared/util.ts";

const FROM = "GRANITO <no-reply@somosgranito.com>";
const ADMIN_INBOX = "hola@somosgranito.com";

const STATUS_MAP: Record<string, string> = {
  approved: "completed",
  pending: "pending",
  in_process: "pending",
  rejected: "failed",
  cancelled: "failed",
  refunded: "refunded",
  charged_back: "refunded",
};

interface Hallazgo {
  quien: string;
  paymentId: string;
  amount: number;
  mpStatus: string;
  motivo: "faltaba" | "estado_distinto";
  reinyectado: boolean;
}

async function searchByRef(
  token: string,
  ref: string,
): Promise<Record<string, unknown>[]> {
  const q = new URLSearchParams({ external_reference: ref, limit: "50" });
  const r = await fetch(`https://api.mercadopago.com/v1/payments/search?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return [];
  const data = await r.json();
  return (data.results as Record<string, unknown>[]) ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // Auth: el cron manda el service_role; un admin del backoffice, su JWT.
  // El gateway (verify_jwt=true, fijado en config.toml) ya validó la firma
  // del token, así que acá alcanza con leer el claim `role` del payload.
  const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  let autorizado = false;
  try {
    const payload = JSON.parse(atob(bearer.split(".")[1] ?? ""));
    autorizado = payload?.role === "service_role";
  } catch { /* no era un JWT: sigue el chequeo de admin */ }
  if (!autorizado) {
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${bearer}` } } },
    );
    const { data: isAdmin } = await userClient.rpc("is_admin");
    autorizado = isAdmin === true;
  }
  if (!autorizado) return json({ error: "No autorizado." }, 403);

  const supa = serviceClient();
  const functionsBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;

  // ── 1. Lo ya registrado, con su estado (para detectar cambios perdidos) ──
  const { data: dons } = await supa
    .from("donations")
    .select("mp_payment_id,status");
  const { data: pledges } = await supa
    .from("team_pledges")
    .select("mp_payment_id,status");
  const registrado = new Map<string, string>();
  for (const d of dons ?? []) {
    if (d.mp_payment_id) registrado.set(String(d.mp_payment_id), d.status);
  }
  for (const p of pledges ?? []) {
    if (p.mp_payment_id) registrado.set(String(p.mp_payment_id), p.status);
  }

  // ── 2. Qué buscar en cada cuenta conectada ──
  const { data: atletas } = await supa
    .from("athletes")
    .select("id,full_name");
  const nombre = new Map((atletas ?? []).map((a) => [a.id, a.full_name]));
  const { data: cuentasAtleta } = await supa
    .from("athlete_mp_accounts")
    .select("athlete_id,access_token");
  const { data: equipos } = await supa
    .from("team_applications")
    .select("id,team_name");
  const nombreEquipo = new Map((equipos ?? []).map((t) => [t.id, t.team_name]));
  const { data: cuentasEquipo } = await supa
    .from("team_mp_accounts")
    .select("team_id,access_token");

  const hallazgos: Hallazgo[] = [];
  const errores: string[] = [];

  async function revisar(
    token: string,
    refs: string[],
    quien: string,
    hint: string, // "athlete=<id>" | "team=<id>"
  ) {
    for (const ref of refs) {
      let pagos: Record<string, unknown>[];
      try {
        pagos = await searchByRef(token, ref);
      } catch (e) {
        errores.push(`${quien}: no se pudo consultar MP (${e})`);
        continue;
      }
      for (const p of pagos) {
        const pid = String(p.id);
        const mpStatus = STATUS_MAP[String(p.status)] ?? "pending";
        const dbStatus = registrado.get(pid);
        const motivo = dbStatus === undefined
          ? "faltaba" as const
          : dbStatus !== mpStatus
            ? "estado_distinto" as const
            : null;
        if (!motivo) continue;
        // Reinyección por el mismo webhook: idempotente, y hace todo el
        // circuito (registro, split 93/7, email de agradecimiento).
        let ok = false;
        try {
          const r = await fetch(
            `${functionsBase}/mp-webhook?type=payment&data.id=${pid}&${hint}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
          );
          ok = r.ok;
        } catch (e) {
          errores.push(`${quien}: reinyección de ${pid} falló (${e})`);
        }
        hallazgos.push({
          quien,
          paymentId: pid,
          amount: Number(p.transaction_amount ?? 0),
          mpStatus,
          motivo,
          reinyectado: ok,
        });
      }
    }
  }

  for (const c of cuentasAtleta ?? []) {
    await revisar(
      c.access_token,
      [`${c.athlete_id}:once`, `${c.athlete_id}:monthly`],
      nombre.get(c.athlete_id) ?? c.athlete_id,
      `athlete=${c.athlete_id}`,
    );
  }
  for (const c of cuentasEquipo ?? []) {
    await revisar(
      c.access_token,
      [`teamdon:${c.team_id}`],
      `Equipo ${nombreEquipo.get(c.team_id) ?? c.team_id}`,
      `team=${c.team_id}`,
    );
  }
  // Links de pago de campañas de equipo (ext_ref "team:<pledge_id>"): solo
  // los pendientes de pago — los pagados ya están cubiertos por el mapa.
  const { data: pendientes } = await supa
    .from("team_pledges")
    .select("id,team_id,status")
    .in("status", ["validated", "pending"]);
  for (const pl of pendientes ?? []) {
    const acct = (cuentasEquipo ?? []).find((c) => c.team_id === pl.team_id);
    if (!acct) continue;
    await revisar(
      acct.access_token,
      [`team:${pl.id}`],
      `Equipo ${nombreEquipo.get(pl.team_id) ?? pl.team_id}`,
      `team=${pl.team_id}`,
    );
  }

  // ── 3. Si arregló algo (o algo falló), avisar al equipo ──
  const resendKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (resendKey && (hallazgos.length > 0 || errores.length > 0)) {
    const filas = hallazgos
      .map((h) =>
        `<tr><td style="padding:4px 10px 4px 0">${h.quien}</td><td style="padding:4px 10px 4px 0">$${h.amount}</td><td style="padding:4px 10px 4px 0">${h.mpStatus}</td><td style="padding:4px 10px 4px 0">${h.motivo === "faltaba" ? "no estaba registrado" : "cambió de estado"}</td><td style="padding:4px 0">${h.reinyectado ? "recuperado ✓" : "NO SE PUDO ✗"}</td></tr>`,
      )
      .join("");
    const errHtml = errores.length
      ? `<p style="color:#DF0024"><strong>Errores:</strong><br>${errores.join("<br>")}</p>`
      : "";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: FROM,
        to: [ADMIN_INBOX],
        subject: `Reconciliación MP: ${hallazgos.length} pago(s) recuperado(s)`,
        html: `<p>La reconciliación diaria contra Mercado Pago encontró pagos que no estaban bien registrados:</p>
<table cellpadding="0" cellspacing="0" style="font-family:Arial;font-size:14px">${filas}</table>
${errHtml}
<p style="color:#888;font-size:12px">Los recuperados ya están en la base y salen en la web con la próxima publicación. — mp-reconcile</p>`,
      }),
    }).catch((e) => console.error("No se pudo mandar el aviso:", e));
  }

  console.log(
    `reconcile: ${hallazgos.length} hallazgos, ${errores.length} errores`,
    hallazgos,
  );
  return json({
    ok: true,
    revisadas: (cuentasAtleta ?? []).length + (cuentasEquipo ?? []).length,
    hallazgos,
    errores,
  });
});
