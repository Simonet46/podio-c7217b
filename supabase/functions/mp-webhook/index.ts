// Edge Function: mp-webhook
// MP nos notifica cada pago (topic=payment). Consultamos el detalle del pago y
// registramos/actualizamos el aporte en `donations`. Idempotente por mp_payment_id.
//
// Secrets: MP_ACCESS_TOKEN (access token de prueba/prod de la PLATAFORMA, para
//          consultar pagos del marketplace), SUPABASE_SERVICE_ROLE_KEY.
// Deploy con --no-verify-jwt (lo llama Mercado Pago).
import { json, serviceClient, PLATFORM_FEE_RATE } from "../_shared/util.ts";

Deno.serve(async (req) => {
  // MP manda la notificación por query (?type=payment&data.id=...) o por body.
  const u = new URL(req.url);
  let topic = u.searchParams.get("type") ?? u.searchParams.get("topic");
  let paymentId = u.searchParams.get("data.id") ?? u.searchParams.get("id");

  if (!topic || !paymentId) {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    topic = topic ?? (body.type as string) ?? (body.topic as string);
    paymentId =
      paymentId ??
      ((body.data as { id?: string } | undefined)?.id ?? (body.id as string));
  }

  // Solo nos interesan los avisos de pago. El resto los confirmamos con 200.
  if (topic !== "payment" || !paymentId) return json({ ok: true, ignored: true });

  const platformToken = (Deno.env.get("MP_ACCESS_TOKEN") ?? "").trim();
  if (!platformToken) {
    console.error("Falta MP_ACCESS_TOKEN para consultar el pago.");
    return json({ ok: true });
  }

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${platformToken}` } },
  );
  if (!res.ok) {
    console.error("No se pudo leer el pago:", res.status, await res.text());
    return json({ ok: true });
  }

  const p = await res.json();
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

  const supa = serviceClient();
  // Idempotente: si ya existe ese mp_payment_id, actualiza; si no, inserta.
  const row = {
    athlete_id: athleteId,
    amount,
    type: refType === "monthly" ? "monthly" : "once",
    platform_fee: fee,
    net_amount: Math.round((amount - fee) * 100) / 100,
    donor_email: p?.payer?.email ?? null,
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
    await supa.from("donations").insert(row);
  }

  return json({ ok: true });
});
