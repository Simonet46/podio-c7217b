import { CURRENCY, PLATFORM_FEE_RATE } from "@/config/site";

/** Formatea un monto en pesos argentinos (es-AR: $ 25.000). */
export function formatMoney(amount: number, opts?: { cents?: boolean }): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: opts?.cents ? 2 : 0,
    maximumFractionDigits: opts?.cents ? 2 : 0,
  }).format(amount);
}

/**
 * Desglose transparente de un aporte.
 * fee = comisión de plataforma (7%), net = lo que recibe el atleta (93%).
 */
export function breakdown(amount: number) {
  const safe = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const fee = Math.round(safe * PLATFORM_FEE_RATE * 100) / 100;
  const net = Math.round((safe - fee) * 100) / 100;
  return { amount: safe, fee, net };
}

/** Porcentaje de avance hacia la meta (0–100, recortado). */
export function progressPct(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}
