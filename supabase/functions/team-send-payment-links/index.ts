// Edge Function: team-send-payment-links
// La llama el backoffice (solo admin) al validar una campaña de equipo.
// Para cada compromiso pendiente crea una preferencia de Checkout Pro EN
// NOMBRE del equipo (con su access_token OAuth) con marketplace_fee = 7%,
// guarda el link en el compromiso (status → 'validated') y le manda al
// donante un email con el botón de pago. El webhook marca 'paid' al aprobarse.
//
// Los compromisos ya pagados se saltean; los validados sin pagar se re-envían
// (mismo link), así el botón sirve también para recordatorios.
//
// Secrets: SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
//          MP_CURRENCY (opcional), SITE_URL (opcional).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  cors,
  json,
  serviceClient,
  SITE_URL,
  PLATFORM_FEE_RATE,
} from "../_shared/util.ts";

const FROM = "GRANITO <no-reply@somosgranito.com>";

function esc(s: string): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function pesos(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Email al donante: la campaña se validó, llegó el momento de hacer efectivo el granito. */
function paymentHtml(opts: {
  donorName: string | null;
  teamName: string;
  teamSlug: string | null;
  competition: string | null;
  amount: number;
  payUrl: string;
}): string {
  const { donorName, teamName, teamSlug, competition, amount, payUrl } = opts;
  const hola = donorName ? `¡Hola, ${esc(donorName.split(" ")[0])}!` : "¡Hola!";
  const mision = competition
    ? `<p style="color:rgba(255,255,255,.6);font-size:13px;margin:6px 0 0">🎯 Misión: ${esc(competition)}</p>`
    : "";
  const campaignUrl = teamSlug ? `${SITE_URL}/equipos/${encodeURIComponent(teamSlug)}/` : SITE_URL;
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1A2F;padding:40px 16px;font-family:Arial,Helvetica,sans-serif">
  <tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
    <tr><td align="center" style="padding-bottom:22px">
      <span style="color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:1px">GRANIT</span><span style="color:#C9A227;font-size:26px;font-weight:bold;letter-spacing:1px">O</span>
      <div style="color:rgba(255,255,255,.45);font-size:10px;letter-spacing:3px;margin-top:4px">APOYO DIRECTO AL DEPORTE ARGENTINO</div>
    </td></tr>
    <tr><td style="background-color:#0d2238;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="height:5px;background:linear-gradient(90deg,#0072CE 0%,#0072CE 20%,#F4C300 20%,#F4C300 40%,#111 40%,#111 60%,#009F3D 60%,#009F3D 80%,#DF0024 80%,#DF0024 100%)"></td></tr>
        <tr><td align="center" style="padding:34px 28px 8px">
          <h1 style="color:#C9A227;font-size:26px;letter-spacing:.5px;margin:0">¡La campaña se validó!</h1>
          <p style="color:rgba(255,255,255,.8);font-size:15px;line-height:1.6;margin:12px 0 0">
            ${hola} La campaña de <strong style="color:#fff">${esc(teamName)}</strong> terminó y
            GRANITO la validó. Llegó el momento de hacer efectivo tu granito.
          </p>
          ${mision}
        </td></tr>
        <tr><td align="center" style="padding:22px 28px 8px">
          <table cellpadding="0" cellspacing="0" style="background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.35);border-radius:12px">
            <tr><td align="center" style="padding:16px 34px">
              <div style="color:#C9A227;font-size:30px;font-weight:bold">${pesos(amount)}</div>
              <div style="color:rgba(255,255,255,.55);font-size:12px;margin-top:4px">tu compromiso · el 93% va directo al equipo</div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:20px 28px 8px">
          <a href="${payUrl}" style="display:inline-block;background-color:#C9A227;color:#0A1A2F;font-weight:bold;font-size:16px;padding:15px 38px;border-radius:10px;text-decoration:none">
            Pagar mi aporte ahora
          </a>
        </td></tr>
        <tr><td align="center" style="padding:8px 28px 30px">
          <p style="color:rgba(255,255,255,.45);font-size:12px;line-height:1.6;margin:0">
            El pago se procesa de forma segura por Mercado Pago y llega directo a la cuenta del equipo.<br>
            <a href="${campaignUrl}" style="color:rgba(255,255,255,.55)">Ver la campaña</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding-top:20px">
      <p style="color:rgba(255,255,255,.35);font-size:11px;line-height:1.6;margin:0">
        GRANITO — Hecho en Argentina. Recibís este email porque comprometiste un aporte en somosgranito.com.<br>
        Si no querés hacerlo efectivo, simplemente ignorá este mensaje.
      </p>
    </td></tr>
  </table></td></tr>
</table>`;
}

async function sendEmail(key: string, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    if (!r.ok) console.error("Resend falló:", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("Error mandando email:", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // Solo un admin puede disparar el cobro.
  const authHeader = req.headers.get("Authorization") ?? "";
  const authed = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: isAdmin, error: authErr } = await authed.rpc("is_admin");
  if (authErr) return json({ error: "No se pudo validar el usuario." }, 401);
  if (isAdmin !== true) return json({ error: "No autorizado." }, 403);

  const { team_id } = await req.json().catch(() => ({}));
  if (!team_id) return json({ error: "Falta team_id." }, 400);

  const supa = serviceClient();

  const { data: team } = await supa
    .from("team_applications")
    .select("id, team_name, slug, competition, status")
    .eq("id", team_id)
    .maybeSingle();
  if (!team) return json({ error: "Equipo no encontrado." }, 404);
  if (team.status !== "approved") return json({ error: "El equipo no está aprobado." }, 409);

  const { data: acct } = await supa
    .from("team_mp_accounts")
    .select("access_token")
    .eq("team_id", team_id)
    .maybeSingle();
  if (!acct?.access_token) {
    return json({ error: "El equipo todavía no conectó su Mercado Pago. Conectalo primero (botón MP en la sección Equipos)." }, 409);
  }

  const resendKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!resendKey) return json({ error: "Falta RESEND_API_KEY: no se pueden enviar los emails." }, 500);

  // Compromisos a cobrar: los pendientes y los validados que aún no pagaron
  // (para estos se reusa el link ya creado → el email actúa de recordatorio).
  const { data: pledges } = await supa
    .from("team_pledges")
    .select("id, donor_name, donor_email, amount, status, payment_link")
    .eq("team_id", team_id)
    .in("status", ["pledged", "validated"]);

  if (!pledges || pledges.length === 0) {
    return json({ ok: true, sent: 0, failed: 0, message: "No hay compromisos pendientes de cobro." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const currency = Deno.env.get("MP_CURRENCY") ?? "ARS";
  let sent = 0;
  let failed = 0;

  for (const pledge of pledges) {
    const amt = Number(pledge.amount);
    let payUrl: string | null = pledge.payment_link;

    // Crear la preferencia solo si el compromiso todavía no tiene link.
    if (!payUrl) {
      const fee = Math.round(amt * PLATFORM_FEE_RATE * 100) / 100;
      const preference = {
        items: [
          {
            title: `Aporte a ${team.team_name}`,
            quantity: 1,
            unit_price: amt,
            currency_id: currency,
          },
        ],
        marketplace_fee: fee,
        payer: { email: pledge.donor_email },
        back_urls: {
          success: `${SITE_URL}/gracias?kind=team&slug=${encodeURIComponent(team.slug ?? "")}&amount=${amt}&mp=ok`,
          pending: `${SITE_URL}/gracias?kind=team&slug=${encodeURIComponent(team.slug ?? "")}&amount=${amt}&mp=pending`,
          failure: `${SITE_URL}/equipos/${encodeURIComponent(team.slug ?? "")}/?mp=error`,
        },
        auto_return: "approved",
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook?team=${team.id}`,
        external_reference: `team:${pledge.id}`,
        metadata: { team_id: team.id, pledge_id: pledge.id, amount: amt, fee },
      };
      const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${acct.access_token}`,
        },
        body: JSON.stringify(preference),
      });
      if (!res.ok) {
        console.error("MP preferencia falló:", res.status, await res.text());
        failed++;
        continue;
      }
      const data = await res.json();
      payUrl = data.init_point as string;
      await supa
        .from("team_pledges")
        .update({
          status: "validated",
          validated_at: new Date().toISOString(),
          payment_link: payUrl,
          mp_preference_id: String(data.id ?? ""),
        })
        .eq("id", pledge.id);
    }

    const ok = await sendEmail(
      resendKey,
      pledge.donor_email,
      `Tu granito para ${team.team_name} — ¡la campaña se validó! 🥇`,
      paymentHtml({
        donorName: pledge.donor_name,
        teamName: team.team_name,
        teamSlug: team.slug,
        competition: team.competition,
        amount: amt,
        payUrl: payUrl!,
      }),
    );
    if (ok) sent++;
    else failed++;
  }

  return json({ ok: true, sent, failed, total: pledges.length });
});
