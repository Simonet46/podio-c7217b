// Edge Function: mp-create-preference
// La llama el widget de aporte. Crea una preferencia de Checkout Pro EN NOMBRE
// del atleta (con su access_token) y le mete marketplace_fee = 7%. MP reparte
// solo: 93% al atleta, 7% a GRANITO. Devuelve el init_point para redirigir.
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

  const { slug, amount, type, donorEmail } = await req.json().catch(() => ({}));
  const amt = Number(amount);
  if (!slug || !Number.isFinite(amt) || amt <= 0) {
    return json({ error: "Datos inválidos." }, 400);
  }

  const supa = serviceClient();
  const { data: athlete } = await supa
    .from("athletes")
    .select("id, full_name, slug")
    .eq("slug", slug)
    .single();
  if (!athlete) return json({ error: "Atleta no encontrado." }, 404);

  const { data: acct } = await supa
    .from("athlete_mp_accounts")
    .select("access_token")
    .eq("athlete_id", athlete.id)
    .single();
  if (!acct?.access_token) {
    return json({ error: "Este atleta todavía no conectó su Mercado Pago." }, 409);
  }

  const fee = Math.round(amt * PLATFORM_FEE_RATE * 100) / 100;
  const t = type === "monthly" ? "monthly" : "once";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

  const preference = {
    items: [
      {
        title: `Apoyo a ${athlete.full_name}`,
        quantity: 1,
        unit_price: amt,
        currency_id: Deno.env.get("MP_CURRENCY") ?? "ARS",
      },
    ],
    marketplace_fee: fee,
    ...(donorEmail ? { payer: { email: donorEmail } } : {}),
    back_urls: {
      success: `${SITE_URL}/gracias?kind=athlete&slug=${encodeURIComponent(slug)}&amount=${amt}&type=${t}&mp=ok`,
      pending: `${SITE_URL}/gracias?kind=athlete&slug=${encodeURIComponent(slug)}&amount=${amt}&type=${t}&mp=pending`,
      failure: `${SITE_URL}/atleta/${encodeURIComponent(slug)}?mp=error`,
    },
    auto_return: "approved",
    // Incluye el athlete_id para que el webhook sepa con qué token de
    // vendedor consultar el pago (el token de plataforma no puede leerlo).
    notification_url: `${supabaseUrl}/functions/v1/mp-webhook?athlete=${athlete.id}`,
    external_reference: `${athlete.id}:${t}`,
    metadata: { athlete_id: athlete.id, type: t, amount: amt, fee },
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
    console.error("MP preferencia falló:", res.status, detail);
    return json({ error: "Mercado Pago rechazó el pago.", detail }, 502);
  }

  const data = await res.json();
  return json({
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
    preference_id: data.id,
  });
});
