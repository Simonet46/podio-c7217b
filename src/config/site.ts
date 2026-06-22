/**
 * Configuración central de PODIO.
 * Marca, comisión y fecha de LA 2028 viven SOLO acá (requisito del brief).
 * Cambiá estos valores y se propagan a toda la app.
 */

export const SITE = {
  /** Nombre de marca (placeholder — cambiar acá para renombrar todo el sitio). */
  brand: "PODIO",
  tagline: "Rumbo a LA 2028",
  description:
    "Bancá directo a los atletas argentinos en proceso de clasificación a Los Ángeles 2028.",
  /** URL canónica del sitio (usada por Stripe para callbacks). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/**
 * Prefijo de ruta del sitio (GitHub Pages lo sirve en /podio).
 * next/image NO antepone el basePath al src de imágenes de /public cuando
 * `unoptimized`, así que lo hacemos a mano con `asset()`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Antepone el basePath a una ruta de asset estático (imágenes de /public). */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}

/**
 * Postulación de atletas (gratis, sin backend).
 * Pegá tu access key de https://web3forms.com (gratis, te llega por mail en 30s)
 * y las postulaciones llegan a tu correo. Si está vacío, el formulario usa un
 * fallback `mailto:` a APPLICATIONS_EMAIL.
 */
export const WEB3FORMS_ACCESS_KEY = "";

/** Correo al que llegan las postulaciones (fallback mailto y referencia). */
export const APPLICATIONS_EMAIL = "appidisko@gmail.com";

/** Comisión de plataforma. 0.07 = 7%. El resto (93%) va al atleta. */
export const PLATFORM_FEE_RATE = 0.07;

/** Niveles del diploma de apoyo según el monto del aporte (USD). */
export type DiplomaTier = "bronce" | "plata" | "oro";

export const DIPLOMA_TIERS: Record<
  DiplomaTier,
  { label: string; min: number; color: string; accent: string }
> = {
  bronce: { label: "Bronce", min: 1, color: "#C17A3F", accent: "#E0A06A" },
  plata: { label: "Plata", min: 50, color: "#9AA6B2", accent: "#D7DEE6" },
  oro: { label: "Oro", min: 100, color: "#C9A227", accent: "#E4C76A" },
};

/** Devuelve el nivel de diploma para un monto. */
export function diplomaTier(amount: number): DiplomaTier {
  if (amount >= DIPLOMA_TIERS.oro.min) return "oro";
  if (amount >= DIPLOMA_TIERS.plata.min) return "plata";
  return "bronce";
}

/**
 * Ceremonia de LA 2028 (14 de julio de 2028).
 * Fecha en UTC para que el contador sea consistente entre cliente y servidor.
 */
export const LA2028_DATE = new Date("2028-07-14T00:00:00Z");

/** Moneda mostrada al donante internacional. */
export const CURRENCY = "USD" as const;

/** Montos preset del widget de donación. */
export const PRESET_AMOUNTS = {
  once: [25, 50, 100],
  monthly: [10, 25, 50],
} as const;

/** Disclaimer legal (footer). NO afiliación con COI/COA ni federaciones. */
export const LEGAL_DISCLAIMER =
  `${SITE.brand} es una plataforma independiente de financiamiento entre personas. ` +
  "No tiene afiliación, patrocinio ni respaldo del Comité Olímpico Internacional (COI), " +
  "del Comité Olímpico Argentino (COA), de LA28 ni de ninguna federación deportiva. " +
  '"Los Ángeles 2028" se usa únicamente de forma descriptiva.';
