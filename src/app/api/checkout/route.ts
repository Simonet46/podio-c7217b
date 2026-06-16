import { NextResponse } from "next/server";
import { getAthleteBySlug } from "@/lib/data/athletes";
import { getStripe } from "@/lib/stripe";
import { feeInCents } from "@/lib/money";
import { SITE, CURRENCY, PLATFORM_FEE_RATE } from "@/config/site";
import type { DonationType } from "@/lib/data/types";

export const runtime = "nodejs";

/**
 * Inicia el flujo de aporte.
 * - Stripe configurado + atleta con cuenta Connect → crea Checkout Session
 *   (pass-through con application_fee del 7% y transfer al atleta).
 * - Si no → "modo demo": devuelve la URL de la página de gracias.
 */
export async function POST(req: Request) {
  let body: { slug?: string; amount?: number; type?: DonationType };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const { slug, amount, type = "once" } = body;
  if (!slug || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "Falta el atleta o el monto es inválido." },
      { status: 400 },
    );
  }

  const athlete = await getAthleteBySlug(slug);
  if (!athlete) {
    return NextResponse.json({ error: "Atleta no encontrado." }, { status: 404 });
  }

  // Origen real del request (funciona en local, Netlify, cualquier host).
  // Cae a SITE.url solo si no se puede derivar.
  const origin =
    req.headers.get("origin") ??
    (() => {
      try {
        return new URL(req.url).origin;
      } catch {
        return SITE.url;
      }
    })();

  const demoUrl =
    `${origin}/gracias?slug=${encodeURIComponent(slug)}` +
    `&amount=${amount}&type=${type}`;

  const stripe = await getStripe();

  // Modo demo: sin Stripe o sin cuenta conectada del atleta.
  if (!stripe || !athlete.stripe_account_id) {
    return NextResponse.json({ url: demoUrl, demo: true });
  }

  const amountCents = Math.round(amount * 100);
  const successUrl =
    `${origin}/gracias?slug=${encodeURIComponent(slug)}` +
    `&amount=${amount}&type=${type}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/atleta/${slug}`;

  try {
    let session;

    if (type === "monthly") {
      // Suscripción: application_fee_percent + transfer al atleta.
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: CURRENCY.toLowerCase(),
              recurring: { interval: "month" },
              product_data: { name: `Aporte mensual a ${athlete.full_name}` },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          application_fee_percent: PLATFORM_FEE_RATE * 100,
          transfer_data: { destination: athlete.stripe_account_id },
          metadata: { athlete_id: athlete.id, type },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } else {
      // Pago único: application_fee_amount + transfer al atleta.
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: CURRENCY.toLowerCase(),
              product_data: { name: `Aporte único a ${athlete.full_name}` },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: feeInCents(amount),
          transfer_data: { destination: athlete.stripe_account_id },
          metadata: { athlete_id: athlete.id, type },
        },
        metadata: { athlete_id: athlete.id, type },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Intentá de nuevo." },
      { status: 502 },
    );
  }
}
