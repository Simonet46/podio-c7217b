// Edge Function: mp-create-team-preference
// La llama el widget de aporte de una campaña de equipo. Crea una preferencia
// de Checkout Pro EN NOMBRE del equipo (con su access_token OAuth) con
// marketplace_fee = 7%. MP reparte solo: 93% al equipo, 7% a GRANITO.
// El aporte se debita al instante y va directo al equipo — NO pasa por
// nosotros ni espera a llegar al objetivo (igual que un atleta).
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY, (opcional) SITE_URL, MP_CURRENCY.
// Deploy con --no-verify-jwt (lo llama el sitio público).
import {
  cors,
  json,
  serviceClient,
  SITE_URL,
  PLATFORM_FEE_RATE,
} from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const { slug, amount, donorEmail } = await req.json().catch(() => ({}));
  const amt = Number(amount);
  if (!slug || !Number.isFinite(amt) || amt <= 0) {
    return json({ error: "Datos inválidos." }, 400);
  }

  const supa = serviceClient();
  const { data: team } = await supa
    .from("team_applications")
    .select("id, team_name, slug, status, active")
    .eq("slug", slug)
    .maybeSingle();
  if (!team || team.status !== "approved" || !team.active) {
    return json({ error: "Campaña no encontrada o no disponible." }, 404);
  }

  const { data: acct } = await supa
    .from("team_mp_accounts")
    .select("access_token")
    .eq("team_id", team.id)
    .maybeSingle();
  if (!acct?.access_token) {
    return json({ error: "Este equipo todavía no conectó su Mercado Pago." }, 409);
  }

  const fee = Math.round(amt * PLATFORM_FEE_RATE * 100) / 100;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

  const preference = {
    items: [
      {
        title: `Aporte a ${team.team_name}`,
        quantity: 1,
        unit_price: amt,
        currency_id: Deno.env.get("MP_CURRENCY") ?? "ARS",
      },
    ],
    marketplace_fee: fee,
    ...(donorEmail ? { payer: { email: donorEmail } } : {}),
    back_urls: {
      success: `${SITE_URL}/gracias?kind=campaign&slug=${encodeURIComponent(team.slug)}&name=${encodeURIComponent(team.team_name)}&amount=${amt}&mp=ok`,
      pending: `${SITE_URL}/gracias?kind=campaign&slug=${encodeURIComponent(team.slug)}&name=${encodeURIComponent(team.team_name)}&amount=${amt}&mp=pending`,
      failure: `${SITE_URL}/equipos/${encodeURIComponent(team.slug)}/?mp=error`,
    },
    auto_return: "approved",
    // El webhook usa el team para saber con qué token leer el pago.
    notification_url: `${supabaseUrl}/functions/v1/mp-webhook?team=${team.id}`,
    external_reference: `teamdon:${team.id}`,
    metadata: { team_id: team.id, amount: amt, fee },
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
    const detail = await res.text();
    console.error("MP preferencia (equipo) falló:", res.status, detail);
    return json({ error: "Mercado Pago rechazó el pago.", detail }, 502);
  }

  const data = await res.json();
  return json({
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
    preference_id: data.id,
  });
});
