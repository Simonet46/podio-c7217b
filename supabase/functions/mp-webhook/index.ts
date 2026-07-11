// Edge Function: mp-webhook
// MP nos notifica cada pago (topic=payment). El pago pertenece a la cuenta del
// VENDEDOR (el atleta), así que hay que consultarlo con SU access_token — el
// token de la plataforma no puede leerlo. La notification_url incluye
// ?athlete=<id> para saber qué token usar; si no viene, probamos plataforma y
// después todos los tokens conectados (escala MVP).
// Registra/actualiza el aporte en `donations` (idempotente por mp_payment_id)
// y, cuando un aporte queda COMPLETADO, le manda al donante un email de
// agradecimiento con el mensaje personal del atleta (supporter_message).
//
// Secrets: MP_ACCESS_TOKEN (token de la PLATAFORMA, fallback),
//          SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, (opcional) SITE_URL.
// Deploy con --no-verify-jwt (lo llama Mercado Pago).
import { json, serviceClient, SITE_URL } from "../_shared/util.ts";

const PLATFORM_FEE_RATE = 0.07;

async function fetchPayment(paymentId: string, token: string) {
  const r = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!r.ok) return null;
  return await r.json();
}

function pesos(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Email de agradecimiento al donante, con branding GRANITO. */
function thankYouHtml(opts: {
  athleteName: string;
  athleteSlug: string;
  amount: number;
  message: string | null;
  monthly: boolean;
  /** URL del perfil a linkear (default: perfil de atleta por slug). */
  profileUrl?: string;
}): string {
  const { athleteName, athleteSlug, amount, message, monthly } = opts;
  const profileUrl = opts.profileUrl ?? `${SITE_URL}/atleta/${encodeURIComponent(athleteSlug)}/`;
  const firstName = athleteName.split(" ")[0];

  const quote = message
    ? `<tr>
        <td style="padding:0 28px 24px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="border-left:3px solid #C9A227;padding:12px 16px;background:rgba(201,162,39,.07);border-radius:0 10px 10px 0">
                <p style="color:rgba(255,255,255,.85);font-size:15px;line-height:1.65;font-style:italic;margin:0">
                  “${esc(message)}”
                </p>
                <p style="color:#C9A227;font-size:13px;font-weight:bold;margin:10px 0 0">— ${esc(athleteName)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1A2F;padding:40px 16px;font-family:Arial,Helvetica,sans-serif">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
        <tr>
          <td align="center" style="padding-bottom:22px">
            <span style="color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:1px">GRANIT</span><span style="color:#C9A227;font-size:26px;font-weight:bold;letter-spacing:1px">O</span>
            <div style="color:rgba(255,255,255,.45);font-size:10px;letter-spacing:3px;margin-top:4px">APOYO DIRECTO AL DEPORTE ARGENTINO</div>
          </td>
        </tr>
        <tr>
          <td style="background-color:#0d2238;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="height:5px;background:linear-gradient(90deg,#0072CE 0%,#0072CE 20%,#F4C300 20%,#F4C300 40%,#111 40%,#111 60%,#009F3D 60%,#009F3D 80%,#DF0024 80%,#DF0024 100%)"></td>
              </tr>
              <tr>
                <td align="center" style="padding:34px 28px 8px">
                  <h1 style="color:#C9A227;font-size:34px;letter-spacing:1px;margin:0">¡GRACIAS!</h1>
                  <p style="color:rgba(255,255,255,.8);font-size:16px;line-height:1.6;margin:10px 0 0">
                    Tu granito ya está con <strong style="color:#fff">${esc(athleteName)}</strong>.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:22px 28px">
                  <table cellpadding="0" cellspacing="0" style="background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.35);border-radius:12px">
                    <tr>
                      <td align="center" style="padding:16px 34px">
                        <div style="color:#C9A227;font-size:30px;font-weight:bold">${pesos(amount)}</div>
                        <div style="color:rgba(255,255,255,.55);font-size:12px;margin-top:4px">${monthly ? "aporte mensual" : "aporte único"} · el 93% va directo a ${esc(firstName)}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${quote}
              <tr>
                <td align="center" style="padding:0 28px 30px">
                  <a href="${profileUrl}"
                     style="display:inline-block;background-color:#C9A227;color:#0A1A2F;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none">
                    Seguí el camino de ${esc(firstName)}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:20px">
            <p style="color:rgba(255,255,255,.35);font-size:11px;line-height:1.6;margin:0">
              GRANITO — Hecho en Argentina. Recibís este email porque hiciste un aporte en somosgranito.com.<br>
              GRANITO es una plataforma privada e independiente.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

/** Manda el email de gracias vía Resend. Nunca hace fallar el webhook. */
async function sendThankYou(opts: {
  to: string;
  athleteName: string;
  athleteSlug: string;
  amount: number;
  message: string | null;
  monthly: boolean;
  profileUrl?: string;
}) {
  const key = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!key) {
    console.error("Falta RESEND_API_KEY: no se manda el email de gracias.");
    return;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from: "GRANITO <no-reply@somosgranito.com>",
        to: [opts.to],
        subject: `¡Gracias por tu granito! ${opts.athleteName} recibió tu aporte 🥇`,
        html: thankYouHtml(opts),
      }),
    });
    if (!r.ok) console.error("Resend falló:", r.status, await r.text());
  } catch (e) {
    console.error("Error mandando email de gracias:", e);
  }
}

Deno.serve(async (req) => {
  // MP manda la notificación por query (?type=payment&data.id=...) o por body.
  const u = new URL(req.url);
  let topic = u.searchParams.get("type") ?? u.searchParams.get("topic");
  let paymentId = u.searchParams.get("data.id") ?? u.searchParams.get("id");
  const athleteHint = u.searchParams.get("athlete");
  const teamHint = u.searchParams.get("team");

  if (!topic || !paymentId) {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    topic = topic ?? (body.type as string) ?? (body.topic as string);
    paymentId =
      paymentId ??
      ((body.data as { id?: string } | undefined)?.id ?? (body.id as string));
  }

  // Solo nos interesan los avisos de pago. El resto los confirmamos con 200.
  if (topic !== "payment" || !paymentId) return json({ ok: true, ignored: true });

  const supa = serviceClient();

  // Armar la lista de tokens a probar, en orden de probabilidad.
  const tokens: string[] = [];
  if (athleteHint) {
    const { data } = await supa
      .from("athlete_mp_accounts")
      .select("access_token")
      .eq("athlete_id", athleteHint)
      .maybeSingle();
    if (data?.access_token) tokens.push(data.access_token);
  }
  if (teamHint) {
    const { data } = await supa
      .from("team_mp_accounts")
      .select("access_token")
      .eq("team_id", teamHint)
      .maybeSingle();
    if (data?.access_token) tokens.push(data.access_token);
  }
  const platformToken = (Deno.env.get("MP_ACCESS_TOKEN") ?? "").trim();
  if (platformToken) tokens.push(platformToken);
  if (!athleteHint && !teamHint) {
    const { data } = await supa
      .from("athlete_mp_accounts")
      .select("access_token");
    for (const row of data ?? []) {
      if (row.access_token && !tokens.includes(row.access_token)) {
        tokens.push(row.access_token);
      }
    }
    const { data: teamAccts } = await supa
      .from("team_mp_accounts")
      .select("access_token");
    for (const row of teamAccts ?? []) {
      if (row.access_token && !tokens.includes(row.access_token)) {
        tokens.push(row.access_token);
      }
    }
  }

  let p: Record<string, unknown> | null = null;
  for (const t of tokens) {
    p = await fetchPayment(paymentId, t);
    if (p) break;
  }
  if (!p) {
    console.error("No se pudo leer el pago con ningún token:", paymentId);
    return json({ ok: true, error: "pago_no_encontrado" });
  }

  const extRef = String(p.external_reference ?? "");

  // ── Aporte DIRECTO a un equipo: external_reference = "teamdon:<team_id>" ──
  // El dinero se debitó y fue directo a la cuenta MP del equipo (split 93/7).
  // Registramos la donación en team_pledges (idempotente por mp_payment_id) y,
  // cuando queda completada, agradecemos al donante.
  if (extRef.startsWith("teamdon:")) {
    const teamId = extRef.slice("teamdon:".length);
    const amount = Number(p.transaction_amount ?? 0);
    const payer = p.payer as { email?: string } | undefined;
    const statusMap: Record<string, string> = {
      approved: "completed", pending: "pending", in_process: "pending",
      rejected: "failed", cancelled: "failed", refunded: "refunded", charged_back: "refunded",
    };
    const status = statusMap[p.status as string] ?? "pending";

    const { data: existing } = await supa
      .from("team_pledges")
      .select("id, status")
      .eq("mp_payment_id", String(p.id))
      .maybeSingle();

    let justCompleted = false;
    if (existing) {
      if (existing.status !== status) {
        await supa.from("team_pledges").update({ status, paid_at: status === "completed" ? new Date().toISOString() : null }).eq("id", existing.id);
        justCompleted = existing.status !== "completed" && status === "completed";
      }
    } else {
      const { error } = await supa.from("team_pledges").insert({
        team_id: teamId,
        donor_email: payer?.email ?? "sin-email@granito",
        amount,
        status,
        mp_payment_id: String(p.id),
        paid_at: status === "completed" ? new Date().toISOString() : null,
      });
      if (error) console.error("Insert donación de equipo falló (¿duplicado?):", error.message);
      else justCompleted = status === "completed";
    }

    if (justCompleted && payer?.email) {
      const { data: team } = await supa
        .from("team_applications")
        .select("team_name, slug")
        .eq("id", teamId)
        .maybeSingle();
      if (team) {
        await sendThankYou({
          to: payer.email,
          athleteName: team.team_name,
          athleteSlug: team.slug ?? "",
          profileUrl: `${SITE_URL}/equipos/${encodeURIComponent(team.slug ?? "")}/`,
          amount,
          message: null,
          monthly: false,
        });
      }
    }
    return json({ ok: true, team_donation: teamId, status });
  }

  // external_reference = "<athlete_id>:<type>"
  const [athleteId, refType] = extRef.split(":");
  if (!athleteId) return json({ ok: true, ignored: "sin external_reference" });

  const amount = Number(p.transaction_amount ?? 0);
  const fee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
  const statusMap: Record<string, string> = {
    approved: "completed",
    pending: "pending",
    in_process: "pending",
    rejected: "failed",
    cancelled: "failed",
    refunded: "refunded",
    charged_back: "refunded",
  };

  const payer = p.payer as { email?: string } | undefined;
  const row = {
    athlete_id: athleteId,
    amount,
    type: refType === "monthly" ? "monthly" : "once",
    platform_fee: fee,
    net_amount: Math.round((amount - fee) * 100) / 100,
    donor_email: payer?.email ?? null,
    provider: "mercadopago",
    mp_payment_id: String(p.id),
    status: statusMap[p.status as string] ?? "pending",
  };

  // Idempotente: si ya existe ese mp_payment_id, actualiza; si no, inserta.
  // (El índice único donations_mp_payment_id_key evita duplicados por carrera.)
  const { data: existing } = await supa
    .from("donations")
    .select("id, status")
    .eq("mp_payment_id", row.mp_payment_id)
    .maybeSingle();

  // El email de gracias sale UNA sola vez: cuando el aporte queda completado
  // (insert ya aprobado, o transición pending → completed).
  let justCompleted = false;

  if (existing) {
    if (existing.status !== row.status) {
      await supa.from("donations").update({ status: row.status }).eq("id", existing.id);
      justCompleted = existing.status !== "completed" && row.status === "completed";
    }
  } else {
    const { error } = await supa.from("donations").insert(row);
    if (error) {
      // Carrera entre notificaciones simultáneas: otro insert ganó. No es un error real.
      console.error("Insert de donación falló (probable duplicado):", error.message);
    } else {
      justCompleted = row.status === "completed";
    }
  }

  if (justCompleted && row.donor_email) {
    const { data: athlete } = await supa
      .from("athletes")
      .select("full_name, slug, supporter_message")
      .eq("id", athleteId)
      .maybeSingle();
    if (athlete) {
      await sendThankYou({
        to: row.donor_email,
        athleteName: athlete.full_name,
        athleteSlug: athlete.slug,
        amount,
        message: athlete.supporter_message ?? null,
        monthly: row.type === "monthly",
      });
    }
  }

  return json({ ok: true });
});
