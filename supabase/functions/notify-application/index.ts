// Edge Function: notify-application
// La llama el formulario de postulación después de guardar. Manda 2 emails vía
// Resend: (1) aviso al equipo de GRANITO de que llegó una postulación, y
// (2) confirmación al atleta de que la recibimos.
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, (opcional) SITE_URL,
//          (opcional) TEAM_EMAILS (coma-separado; default appidisko@gmail.com).
// Deploy con --no-verify-jwt (lo llama el sitio público).
import { cors, json, serviceClient, signState, SITE_URL } from "../_shared/util.ts";

const FROM = "GRANITO <no-reply@somosgranito.com>";
const isEmail = (s: string | null | undefined) =>
  !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function esc(s: string): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendEmail(key: string, to: string[], subject: string, html: string) {
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error("Resend falló:", r.status, detail);
      return { ok: false, status: r.status, detail: detail.slice(0, 300) };
    }
    return { ok: true, status: r.status };
  } catch (e) {
    console.error("Error mandando email:", e);
    return { ok: false, status: 0, detail: String(e).slice(0, 300) };
  }
}

/** Confirmación al atleta (branding GRANITO). Si no conectó MP, incluye el botón. */
function applicantHtml(firstName: string, mpUrl: string | null): string {
  const mpBlock = mpUrl
    ? `<div style="margin:20px 0 4px;padding:16px;border:1px solid rgba(0,158,227,.35);border-radius:10px;background:rgba(0,158,227,.08)">
        <p style="color:rgba(255,255,255,.8);font-size:14px;line-height:1.55;margin:0 0 12px">
          <strong style="color:#fff">Un paso que podés adelantar:</strong> todavía no conectaste tu
          Mercado Pago. Es lo que te permite recibir los aportes directo en tu cuenta.
        </p>
        <a href="${mpUrl}" style="display:inline-block;background-color:#009ee3;color:#ffffff;font-weight:bold;font-size:14px;padding:12px 26px;border-radius:9px;text-decoration:none">
          Conectar mi Mercado Pago
        </a>
        <p style="color:rgba(255,255,255,.4);font-size:11px;line-height:1.5;margin:10px 0 0">
          Conexión oficial de MP: te logueás en TU cuenta y autorizás. GRANITO nunca ve tu contraseña.
        </p>
      </div>`
    : "";
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1A2F;padding:40px 16px;font-family:Arial,Helvetica,sans-serif">
  <tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
    <tr><td style="padding-bottom:22px">
      <span style="color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:1px">GRANIT</span><span style="color:#C9A227;font-size:26px;font-weight:bold;letter-spacing:1px">O</span>
      <div style="color:rgba(255,255,255,.45);font-size:10px;letter-spacing:3px;margin-top:4px">APOYO DIRECTO AL DEPORTE ARGENTINO</div>
    </td></tr>
    <tr><td style="background-color:#0d2238;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:32px 28px">
      <h1 style="color:#C9A227;font-size:24px;margin:0 0 12px">¡Recibimos tu postulación!</h1>
      <p style="color:rgba(255,255,255,.75);font-size:15px;line-height:1.6;margin:0 0 16px">
        Gracias por postularte, ${esc(firstName)}. Tu historia ya nos llegó y el equipo de GRANITO
        —tres atletas olímpicos— la va a revisar <strong style="color:#fff">a mano</strong>, una por una.
      </p>
      <p style="color:rgba(255,255,255,.75);font-size:15px;line-height:1.6;margin:0 0 8px">
        Te vamos a escribir a este mismo email en los próximos días. Si te aprobamos, te llega un
        link para activar tu cuenta y manejar tu perfil.
      </p>
      ${mpBlock}
      <p style="color:rgba(255,255,255,.4);font-size:12px;line-height:1.5;margin:22px 0 0">
        Cualquier duda, escribinos a hola@somosgranito.com.
      </p>
    </td></tr>
    <tr><td align="center" style="padding-top:20px">
      <p style="color:rgba(255,255,255,.3);font-size:11px;margin:0">© GRANITO — Hecho en Argentina.</p>
    </td></tr>
  </table></td></tr>
</table>`;
}

/** Aviso al equipo con los datos de la postulación. */
function teamHtml(a: Record<string, unknown>): string {
  const row = (label: string, value: unknown) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7a8c;font-size:13px">${label}</td><td style="padding:4px 0;color:#0A1A2F;font-size:13px;font-weight:600">${esc(String(value))}</td></tr>` : "";
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;padding:24px 16px;background:#f4f6f9">
  <tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e3e8ee;border-radius:12px;overflow:hidden">
    <tr><td style="height:5px;background:linear-gradient(90deg,#0072CE 0 20%,#F4C300 20% 40%,#111 40% 60%,#009F3D 60% 80%,#DF0024 80% 100%)"></td></tr>
    <tr><td style="padding:24px 26px">
      <div style="font-size:12px;letter-spacing:2px;color:#C9A227;font-weight:bold">NUEVA POSTULACIÓN</div>
      <h1 style="font-size:22px;margin:6px 0 16px;color:#0A1A2F">${esc(String(a.full_name ?? "Sin nombre"))}</h1>
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row("Email", a.email)}
        ${row("Teléfono", a.phone)}
        ${row("Deporte", a.sport)}
        ${row("Disciplina", a.discipline)}
        ${row("Edad", a.age)}
        ${row("Lugar", a.location)}
        ${row("Próxima competencia", a.next_competition)}
        ${row("Instagram", a.socials)}
        ${row("MP conectado", a.mp_connected ? "Sí ✓" : "No")}
      </table>
      <a href="${SITE_URL}/backoffice/" style="display:inline-block;margin-top:20px;background:#C9A227;color:#0A1A2F;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:9px;text-decoration:none">
        Revisar en el backoffice
      </a>
    </td></tr>
  </table></td></tr>
</table>`;
}

/** Aviso al equipo con los datos de la postulación de un EQUIPO. */
function teamAppHtml(t: Record<string, unknown>): string {
  const row = (label: string, value: unknown) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7a8c;font-size:13px">${label}</td><td style="padding:4px 0;color:#0A1A2F;font-size:13px;font-weight:600">${esc(String(value))}</td></tr>` : "";
  const goal = Number(t.goal_amount) || 0;
  const periodo = [t.fundraising_start, t.fundraising_end].filter(Boolean).map(String).join(" → ");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;padding:24px 16px;background:#f4f6f9">
  <tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e3e8ee;border-radius:12px;overflow:hidden">
    <tr><td style="height:5px;background:linear-gradient(90deg,#0072CE 0 20%,#F4C300 20% 40%,#111 40% 60%,#009F3D 60% 80%,#DF0024 80% 100%)"></td></tr>
    <tr><td style="padding:24px 26px">
      <div style="font-size:12px;letter-spacing:2px;color:#C9A227;font-weight:bold">NUEVA POSTULACIÓN — EQUIPO</div>
      <h1 style="font-size:22px;margin:6px 0 16px;color:#0A1A2F">${esc(String(t.team_name ?? "Sin nombre"))}</h1>
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row("Email de contacto", t.email)}
        ${row("Contacto", t.contact_name)}
        ${row("Teléfono", t.phone)}
        ${row("Deporte", t.sport)}
        ${row("Competencia", t.competition)}
        ${row("Objetivo", goal ? `$${goal.toLocaleString("es-AR")}` : null)}
        ${row("¿Para qué?", t.goal_purpose)}
        ${row("Período de campaña", periodo)}
        ${row("Notas", t.notes)}
      </table>
      <a href="${SITE_URL}/backoffice/" style="display:inline-block;margin-top:20px;background:#C9A227;color:#0A1A2F;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:9px;text-decoration:none">
        Revisar en el backoffice
      </a>
    </td></tr>
  </table></td></tr>
</table>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const key = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!key) return json({ ok: false, error: "Falta RESEND_API_KEY" });

  const body = await req.json().catch(() => ({}));
  const { application_id, team_application_id } = body;
  if (!application_id && !team_application_id) {
    return json({ error: "Falta application_id o team_application_id." }, 400);
  }

  const supa = serviceClient();
  const team = (Deno.env.get("TEAM_EMAILS") ?? "appidisko@gmail.com")
    .split(",").map((s) => s.trim()).filter(isEmail);

  // ── Postulación de EQUIPO ──────────────────────────────────────────────
  if (team_application_id) {
    const { data: t } = await supa
      .from("team_applications")
      .select("team_name, email, contact_name, phone, sport, competition, goal_amount, goal_purpose, fundraising_start, fundraising_end, notes")
      .eq("id", team_application_id)
      .maybeSingle();
    if (!t) return json({ ok: false, error: "Postulación de equipo no encontrada." }, 404);

    const teamResult = team.length
      ? await sendEmail(key, team, `Nueva postulación de EQUIPO — ${t.team_name ?? "equipo"}`, teamAppHtml(t))
      : { ok: false, status: 0, detail: "TEAM_EMAILS vacío" };

    let contactResult: unknown = null;
    if (isEmail(t.email as string)) {
      const firstName = String(t.contact_name ?? t.team_name ?? "").split(" ")[0] || "crack";
      contactResult = await sendEmail(key, [t.email as string], "Recibimos la postulación de tu equipo a GRANITO 🥇", applicantHtml(firstName, null));
    }
    return json({ ok: true, kind: "team", recipients: team, teamResult, contactResult });
  }

  // ── Postulación de ATLETA ──────────────────────────────────────────────
  const { data: app } = await supa
    .from("athlete_applications")
    .select("full_name, email, phone, sport, discipline, age, location, next_competition, socials, mp_connected")
    .eq("id", application_id)
    .maybeSingle();
  if (!app) return json({ ok: false, error: "Postulación no encontrada." }, 404);

  // 1) Aviso al equipo (siempre).
  const teamResult = team.length
    ? await sendEmail(key, team, `Nueva postulación — ${app.full_name ?? "atleta"}`, teamHtml(app))
    : { ok: false, status: 0, detail: "TEAM_EMAILS vacío" };

  // 2) Confirmación al atleta (solo si el email es válido). Si no conectó MP,
  // incluimos el botón para hacerlo directo desde el email (link firmado, 30 días).
  let applicantResult: unknown = null;
  if (isEmail(app.email as string)) {
    let mpUrl: string | null = null;
    if (!app.mp_connected) {
      const state = await signState({
        application_id,
        kind: "mp-connect-app-direct",
        exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
      });
      const clientId = (Deno.env.get("MP_CLIENT_ID") ?? "").trim();
      const redirectUri = (Deno.env.get("MP_REDIRECT_URI") ?? "").trim();
      if (clientId && redirectUri) {
        mpUrl =
          `https://auth.mercadopago.com/authorization?client_id=${encodeURIComponent(clientId)}` +
          `&response_type=code&platform_id=mp&state=${encodeURIComponent(state)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}`;
      }
    }
    const firstName = String(app.full_name ?? "").split(" ")[0] || "crack";
    applicantResult = await sendEmail(key, [app.email as string], "Recibimos tu postulación a GRANITO 🥇", applicantHtml(firstName, mpUrl));
  }

  return json({ ok: true, kind: "athlete", recipients: team, teamResult, applicantResult });
});
