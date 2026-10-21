// Edge Function: weekly-digest (cron, lunes 12:00 UTC = 09:00 AR)
// Resumen semanal a hola@ (llega a los tres socios): aportes de la semana,
// donantes nuevos, atletas que más recaudaron, proyectos que cierran pronto,
// postulaciones pendientes y tráfico (desde dashboard_traffic, 7 días).
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.
// Lo llama pg_cron con el service_role (ver migración 20261021150000).
import { json, serviceClient, ADMIN_URL, SITE_URL } from "../_shared/util.ts";

const ADMIN_INBOX = "hola@somosgranito.com";
const FROM = "GRANITO <no-reply@somosgranito.com>";

function pesos(n: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}
function num(n: number): string {
  return new Intl.NumberFormat("es-AR").format(n);
}
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  const supa = serviceClient();
  const now = new Date();
  const from = new Date(now.getTime() - 7 * 86_400_000);
  const fromPrev = new Date(now.getTime() - 14 * 86_400_000);

  const [{ data: dons }, { data: athletes }, { data: teams }, { data: pledges }, { data: pending }, { data: traffic }] = await Promise.all([
    supa.from("donations").select("athlete_id,amount,net_amount,donor_email,status,created_at").gte("created_at", fromPrev.toISOString()),
    supa.from("athletes").select("id,full_name,slug,verified,mp_connected,mp_blocked_reason"),
    supa.from("team_applications").select("id,team_name,slug,status,active,goal_amount,fundraising_end").eq("status", "approved"),
    supa.from("team_pledges").select("team_id,amount,status,created_at").gte("created_at", fromPrev.toISOString()),
    supa.from("athlete_applications").select("id").eq("status", "pending"),
    supa.rpc("dashboard_traffic", { p_days: 7 }),
  ]);

  const completed = (dons ?? []).filter((d) => d.status === "completed");
  const week = completed.filter((d) => new Date(d.created_at) >= from);
  const prev = completed.filter((d) => new Date(d.created_at) < from);
  const sum = (xs: { amount: number }[]) => xs.reduce((s, d) => s + Number(d.amount), 0);
  const total = sum(week), totalPrev = sum(prev);
  const donantes = new Set(week.map((d) => d.donor_email).filter(Boolean)).size;

  const byAthlete = new Map<string, { count: number; amount: number }>();
  week.forEach((d) => { const c = byAthlete.get(d.athlete_id) ?? { count: 0, amount: 0 }; byAthlete.set(d.athlete_id, { count: c.count + 1, amount: c.amount + Number(d.amount) }); });
  const topAth = [...byAthlete.entries()]
    .map(([id, v]) => ({ name: athletes?.find((a) => a.id === id)?.full_name ?? "—", ...v }))
    .sort((a, b) => b.amount - a.amount).slice(0, 5);

  const teamWeek = (pledges ?? []).filter((p) => p.status !== "rejected" && new Date(p.created_at) >= from);
  const teamTotal = sum(teamWeek);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const closing = (teams ?? [])
    .filter((t) => t.active && t.fundraising_end)
    .map((t) => ({ ...t, days: Math.ceil((new Date(t.fundraising_end + "T00:00:00").getTime() - today.getTime()) / 86_400_000) }))
    .filter((t) => t.days >= 0 && t.days <= 14)
    .sort((a, b) => a.days - b.days);

  const sinCobros = (athletes ?? []).filter((a) => a.verified && a.mp_connected === false);
  const bloqueados = (athletes ?? []).filter((a) => a.mp_blocked_reason);

  const t = (traffic as { totals?: { views: number; visitors: number; mobile: number; desktop: number; tablet: number }; athletes?: { slug: string; views: number }[]; sources?: { source: string; views: number }[] } | null)?.totals;
  const topViews = ((traffic as { athletes?: { slug: string; views: number }[] } | null)?.athletes ?? []).slice(0, 5)
    .map((v) => ({ name: athletes?.find((a) => a.slug === v.slug)?.full_name ?? v.slug, views: v.views }));
  const sources = ((traffic as { sources?: { source: string; views: number }[] } | null)?.sources ?? []).slice(0, 4);
  const devTotal = t ? t.mobile + t.desktop + t.tablet : 0;

  const delta = totalPrev > 0 ? `${total >= totalPrev ? "+" : ""}${Math.round(((total - totalPrev) / totalPrev) * 100)}% vs. la semana anterior` : prev.length === 0 && total > 0 ? "primera semana con aportes" : "";

  const li = (s: string) => `<li style="margin:4px 0">${s}</li>`;
  const h2 = (s: string) => `<h2 style="font-size:15px;margin:22px 0 8px;color:#0A1A2F">${s}</h2>`;

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;max-width:560px">
<p style="font-size:12px;letter-spacing:2px;color:#C9A227;margin:0">GRANITO · RESUMEN SEMANAL</p>
<h1 style="font-size:22px;margin:6px 0 16px;color:#0A1A2F">Semana del ${from.toLocaleDateString("es-AR")} al ${now.toLocaleDateString("es-AR")}</h1>

<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
  <tr>
    <td style="padding:12px;background:#f6f1df;border-radius:10px"><div style="font-size:11px;color:#888">RECAUDADO (ATLETAS)</div><div style="font-size:24px;font-weight:bold;color:#0A1A2F">${pesos(total)}</div><div style="font-size:12px;color:#666">${week.length} aporte(s) · ${donantes} donante(s)${delta ? " · " + delta : ""}</div></td>
    <td style="width:10px"></td>
    <td style="padding:12px;background:#eef4fa;border-radius:10px"><div style="font-size:11px;color:#888">VISITAS</div><div style="font-size:24px;font-weight:bold;color:#0A1A2F">${t ? num(t.views) : "—"}</div><div style="font-size:12px;color:#666">${t ? `${num(t.visitors)} visitantes · ${devTotal ? Math.round((t.mobile / devTotal) * 100) : 0}% desde celular` : "sin datos de tráfico"}</div></td>
  </tr>
</table>

${h2("Atletas que más recaudaron")}
<ul style="padding-left:18px;margin:0">${topAth.length ? topAth.map((a) => li(`<strong>${esc(a.name)}</strong>: ${pesos(a.amount)} (${a.count})`)).join("") : li("Sin aportes esta semana.")}</ul>

${h2("Perfiles más visitados")}
<ul style="padding-left:18px;margin:0">${topViews.length ? topViews.map((a) => li(`<strong>${esc(a.name)}</strong>: ${num(a.views)} visitas`)).join("") : li("Todavía sin datos.")}</ul>

${h2("Proyectos deportivos")}
<ul style="padding-left:18px;margin:0">
${li(`Comprometido esta semana: <strong>${pesos(teamTotal)}</strong> en ${teamWeek.length} apoyo(s)`)}
${closing.length ? closing.map((c) => li(`<strong>${esc(c.team_name)}</strong> cierra en ${c.days} día(s)${c.goal_amount ? ` · objetivo ${pesos(Number(c.goal_amount))}` : ""}`)).join("") : li("Ninguna campaña cierra en las próximas dos semanas.")}
</ul>

${h2("Para atender")}
<ul style="padding-left:18px;margin:0">
${li(`<strong>${(pending ?? []).length}</strong> postulación(es) pendiente(s) de revisar`)}
${li(`<strong>${sinCobros.length}</strong> atleta(s) publicado(s) sin poder cobrar${bloqueados.length ? ` (${bloqueados.length} bloqueado(s) por Mercado Pago: ${bloqueados.map((b) => esc(b.full_name)).join(", ")})` : ""}`)}
${sources.length ? li(`De dónde llegan: ${sources.map((s) => `${esc(s.source)} ${num(s.views)}`).join(" · ")}`) : ""}
</ul>

<p style="margin-top:22px"><a href="${ADMIN_URL}/backoffice/" style="display:inline-block;background:#C9A227;color:#0A1A2F;font-weight:bold;padding:10px 18px;border-radius:8px;text-decoration:none">Abrir el dashboard</a></p>
<p style="font-size:12px;color:#888">Los números de plata son aportes confirmados. El tráfico lo mide ${SITE_URL} sin cookies. — weekly-digest</p>
</div>`;

  const resendKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!resendKey) return json({ error: "Falta RESEND_API_KEY" }, 500);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({ from: FROM, to: [ADMIN_INBOX], subject: `Resumen semanal GRANITO: ${pesos(total)} recaudados · ${t ? num(t.views) : "—"} visitas`, html }),
  });
  if (!r.ok) return json({ error: "Resend falló: " + (await r.text()).slice(0, 200) }, 502);
  return json({ ok: true, total, aportes: week.length, visitas: t?.views ?? null });
});
