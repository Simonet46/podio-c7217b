// Edge Function: mp-webhook
// MP nos notifica cada pago (topic=payment). El pago pertenece a la cuenta del
// VENDEDOR (el atleta), así que hay que consultarlo con SU access_token — el
// token de la plataforma no puede leerlo. La notification_url incluye
// ?athlete=<id> para saber qué token usar; si no viene, probamos plataforma y
// después todos los tokens conectados (escala MVP).
// Registra/actualiza el aporte en `donations`. Idempotente por mp_payment_id.
//
// Secrets: MP_ACCESS_TOKEN (token de la PLATAFORMA, fallback),
//          SUPABASE_SERVICE_ROLE_KEY.
// Deploy con --no-verify-jwt (lo llama Mercado Pago).
import { json, serviceClient, PLATFORM_FEE_RATE } from "../_shared/util.ts";

async function fetchPayment(paymentId: string, token: string) {
  const r = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!r.ok) return null;
  return await r.json();
}

Deno.serve(async (req) => {
  // MP manda la notificación por query (?type=payment&data.id=...) o por body.
  const u = new URL(req.url);
  let topic = u.searchParams.get("type") ?? u.searchParams.get("topic");
  let paymentId = u.searchParams.get("data.id") ?? u.searchParams.get("id");
  const athleteHint = u.searchParams.get("athlete");

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
  const platformToken = (Deno.env.get("MP_ACCESS_TOKEN") ?? "").trim();
  if (platformToken) tokens.push(platformToken);
  if (!athleteHint) {
    const { data } = await supa
      .from("athlete_mp_accounts")
      .select("access_token");
    for (const row of data ?? []) {
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

  // external_reference = "<athlete_id>:<type>"
  const [athleteId, refType] = String(p.external_reference ?? "").split(":");
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

  // Idempotente: si ya existe ese mp_payment_id, actualiza; si no, inserta.
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

  const { data: existing } = await supa
    .from("donations")
    .select("id")
    .eq("mp_payment_id", row.mp_payment_id)
    .maybeSingle();

  if (existing) {
    await supa.from("donations").update({ status: row.status }).eq("id", existing.id);
  } else {
    const { error } = await supa.from("donations").insert(row);
    if (error) console.error("No se pudo insertar la donación:", error.message);
  }

  return json({ ok: true });
});
