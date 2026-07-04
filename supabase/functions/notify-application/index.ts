// Edge Function: notify-application
// La llama el formulario de postulación después de guardar. Manda 2 emails vía
// Resend: (1) aviso al equipo de GRANITO de que llegó una postulación, y
// (2) confirmación al atleta de que la recibimos.
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, (opcional) SITE_URL,
//          (opcional) TEAM_EMAILS (coma-separado; default appidisko@gmail.com).
// Deploy con --no-verify-jwt (lo llama el sitio público).
import { cors, json, serviceClient, SITE_URL } from "../_shared/util.ts";

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
    if (!r.ok) console.error("Resend falló:", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("Error mandando email:", e);
    return false;
  }
}

/** Confirmación al atleta (branding GRANITO). */
function applicantHtml(firstName: string): string {
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
        link para activar tu cuenta y conectar tu Mercado Pago.
      </p>
      <p style="color:rgba(255,255,255,.4);font-size:12px;line-height:1.5;margin:22px 0 0">
        No necesitás hacer nada más por ahora. Cualquier duda, escribinos a hola@somosgranito.com.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const key = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!key) return json({ ok: false, error: "Falta RESEND_API_KEY" });

  const { application_id } = await req.json().catch(() => ({}));
  if (!application_id) return json({ error: "Falta application_id." }, 400);

  const supa = serviceClient();
  const { data: app } = await supa
    .from("athlete_applications")
    .select("full_name, email, sport, discipline, age, location, next_competition, socials, mp_connected")
    .eq("id", application_id)
    .maybeSingle();
  if (!app) return json({ ok: false, error: "Postulación no encontrada." }, 404);

  // 1) Aviso al equipo (siempre).
  const team = (Deno.env.get("TEAM_EMAILS") ?? "appidisko@gmail.com")
    .split(",").map((s) => s.trim()).filter(isEmail);
  if (team.length) {
    await sendEmail(key, team, `Nueva postulación — ${app.full_name ?? "atleta"}`, teamHtml(app));
  }

  // 2) Confirmación al atleta (solo si el email es válido).
  if (isEmail(app.email as string)) {
    const firstName = String(app.full_name ?? "").split(" ")[0] || "crack";
    await sendEmail(key, [app.email as string], "Recibimos tu postulación a GRANITO 🥇", applicantHtml(firstName));
  }

  return json({ ok: true });
});
