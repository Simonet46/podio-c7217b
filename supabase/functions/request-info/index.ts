// Edge Function: request-info
// El admin la llama desde el backoffice para pedirle algo a un postulante SIN
// salir de la pantalla (nada de mailto). Manda un email vía Resend con el
// mensaje del admin y, si el postulante no conectó su Mercado Pago, un botón
// con un link firmado para conectarlo directo (queda atado a su postulación).
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, RESEND_API_KEY,
//          MP_CLIENT_ID, MP_REDIRECT_URI, STATE_SECRET.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json, serviceClient, signState } from "../_shared/util.ts";

const FROM = "GRANITO <no-reply@somosgranito.com>";
const isEmail = (s: string | null | undefined) =>
  !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function esc(s: string): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function emailHtml(firstName: string, message: string, mpUrl: string | null): string {
  const mpBlock = mpUrl
    ? `<tr><td align="center" style="padding:6px 28px 26px">
        <a href="${mpUrl}" style="display:inline-block;background-color:#009ee3;color:#ffffff;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none">
          Conectar mi Mercado Pago
        </a>
        <p style="color:rgba(255,255,255,.4);font-size:12px;line-height:1.5;margin:12px 0 0">
          Es la conexión oficial de Mercado Pago: te logueás en TU cuenta y autorizás.
          GRANITO nunca ve tu contraseña. El link vale por 30 días.
        </p>
      </td></tr>`
    : "";
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1A2F;padding:40px 16px;font-family:Arial,Helvetica,sans-serif">
  <tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
    <tr><td style="padding-bottom:22px">
      <span style="color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:1px">GRANIT</span><span style="color:#C9A227;font-size:26px;font-weight:bold;letter-spacing:1px">O</span>
      <div style="color:rgba(255,255,255,.45);font-size:10px;letter-spacing:3px;margin-top:4px">APOYO DIRECTO AL DEPORTE ARGENTINO</div>
    </td></tr>
    <tr><td style="background-color:#0d2238;border:1px solid rgba(255,255,255,.1);border-radius:14px;overflow:hidden">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="height:5px;background:linear-gradient(90deg,#0072CE 0 20%,#F4C300 20% 40%,#111 40% 60%,#009F3D 60% 80%,#DF0024 80% 100%)"></td></tr>
        <tr><td style="padding:30px 28px 8px">
          <h1 style="color:#C9A227;font-size:22px;margin:0 0 12px">Nos falta algo para avanzar</h1>
          <p style="color:rgba(255,255,255,.75);font-size:15px;line-height:1.6;margin:0 0 16px">
            Hola ${esc(firstName)}, estuvimos revisando tu postulación y necesitamos una mano tuya:
          </p>
          <div style="border-left:3px solid #C9A227;background:rgba(201,162,39,.07);border-radius:0 10px 10px 0;padding:12px 16px;margin:0 0 20px">
            <p style="color:rgba(255,255,255,.85);font-size:15px;line-height:1.65;margin:0;white-space:pre-line">${esc(message)}</p>
            <p style="color:#C9A227;font-size:13px;font-weight:bold;margin:10px 0 0">— El equipo de GRANITO</p>
          </div>
        </td></tr>
        ${mpBlock}
      </table>
    </td></tr>
    <tr><td align="center" style="padding-top:20px">
      <p style="color:rgba(255,255,255,.35);font-size:11px;line-height:1.6;margin:0">
        Podés responder este email o escribirnos a hola@somosgranito.com.<br>© GRANITO — Hecho en Argentina.
      </p>
    </td></tr>
  </table></td></tr>
</table>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // Solo admin.
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: isAdmin } = await userClient.rpc("is_admin");
  if (isAdmin !== true) return json({ error: "No autorizado." }, 403);

  const key = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!key) return json({ error: "Falta RESEND_API_KEY." }, 500);

  const { application_id, message, include_mp_link } = await req.json().catch(() => ({}));
  if (!application_id || !message?.trim()) {
    return json({ error: "Faltan application_id o message." }, 400);
  }

  const supa = serviceClient();
  const { data: app } = await supa
    .from("athlete_applications")
    .select("full_name, email, mp_connected")
    .eq("id", application_id)
    .maybeSingle();
  if (!app) return json({ error: "Postulación no encontrada." }, 404);
  if (!isEmail(app.email)) return json({ error: "La postulación no tiene un email válido." }, 422);

  // Link de conexión de MP (firmado, atado a la postulación, 30 días).
  let mpUrl: string | null = null;
  if (include_mp_link && !app.mp_connected) {
    const state = await signState({
      application_id,
      kind: "mp-connect-app-direct",
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
    });
    const clientId = (Deno.env.get("MP_CLIENT_ID") ?? "").trim();
    const redirectUri = (Deno.env.get("MP_REDIRECT_URI") ?? "").trim();
    mpUrl =
      `https://auth.mercadopago.com/authorization?client_id=${encodeURIComponent(clientId)}` +
      `&response_type=code&platform_id=mp&state=${encodeURIComponent(state)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  const firstName = String(app.full_name ?? "").split(" ")[0] || "crack";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: FROM,
      to: [app.email],
      reply_to: "hola@somosgranito.com",
      subject: "Tu postulación a GRANITO — nos falta un dato",
      html: emailHtml(firstName, String(message).trim(), mpUrl),
    }),
  });
  if (!r.ok) {
    const detail = await r.text();
    console.error("Resend falló:", r.status, detail);
    return json({ error: "No se pudo enviar el email." }, 502);
  }
  return json({ ok: true, mp_link_included: !!mpUrl });
});
