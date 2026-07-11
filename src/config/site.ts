/**
 * Configuración central de GRANITO.
 * Marca, comisión y fecha de LA 2028 viven SOLO acá (requisito del brief).
 * Cambiá estos valores y se propagan a toda la app.
 */

export const SITE = {
  /** Nombre de marca (cambiar acá para renombrar todo el sitio). */
  brand: "GRANITO",
  tagline: "Apoyo directo al deporte argentino",
  description:
    "Apoyá directo a los atletas argentinos: desde el alto rendimiento hasta el juvenil del barrio. El 93% va al atleta.",
  /** URL canónica del sitio (usada para callbacks de pago). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://somosgranito.com",
} as const;

/**
 * Prefijo de ruta del sitio (GitHub Pages lo sirve en /podio).
 * next/image NO antepone el basePath al src de imágenes de /public cuando
 * `unoptimized`, así que lo hacemos a mano con `asset()`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Antepone el basePath a una ruta de asset estático (imágenes de /public).
 *  Las URLs absolutas (http/https, ej. Supabase Storage) pasan sin tocar. */
export function asset(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
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

/** Niveles del diploma de apoyo según el monto del aporte (ARS). */
export type DiplomaTier = "bronce" | "plata" | "oro";

export const DIPLOMA_TIERS: Record<
  DiplomaTier,
  { label: string; min: number; color: string; accent: string }
> = {
  bronce: { label: "Bronce", min: 1, color: "#C17A3F", accent: "#E0A06A" },
  plata: { label: "Plata", min: 10000, color: "#9AA6B2", accent: "#D7DEE6" },
  oro: { label: "Oro", min: 25000, color: "#C9A227", accent: "#E4C76A" },
};

/** Devuelve el nivel de diploma para un monto. */
export function diplomaTier(amount: number): DiplomaTier {
  if (amount >= DIPLOMA_TIERS.oro.min) return "oro";
  if (amount >= DIPLOMA_TIERS.plata.min) return "plata";
  return "bronce";
}

/** Moneda de los aportes. Mercado Pago cobra en pesos argentinos. */
export const CURRENCY = "ARS" as const;

/** Montos preset del widget de donación (ARS). */
export const PRESET_AMOUNTS = {
  once: [5000, 10000, 25000],
  monthly: [3000, 5000, 10000],
} as const;

/** Disclaimer legal (footer). Plataforma privada, sin nombrar organismos. */
export const LEGAL_DISCLAIMER =
  `${SITE.brand} es una plataforma privada e independiente. No representa ni está ` +
  "afiliada a ninguna organización deportiva oficial, y no utiliza símbolos ni marcas de terceros.";
