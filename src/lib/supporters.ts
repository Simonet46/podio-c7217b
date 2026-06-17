import type { DiplomaTier } from "@/config/site";
import { DIPLOMA_TIERS } from "@/config/site";

/**
 * "Los que bancan" — modelo estilo Patreon: el foco está en la gente que aporta,
 * no en una meta. Para la demo, la cantidad y los nombres se derivan de forma
 * DETERMINÍSTICA del slug y del monto (mismos datos en server y cliente → sin
 * mismatch de hidratación). Cuando entre Supabase, esto sale de `donations`.
 */

const POOL = [
  "Martín", "Sofía", "Juan", "Camila", "Nicolás", "Valentina", "Lucas",
  "Martina", "Mateo", "Julieta", "Tomás", "Florencia", "Santiago", "Agustina",
  "Joaquín", "Catalina", "Franco", "Delfina", "Benjamín", "Paula", "Federico",
  "Carla", "Diego", "Rocío", "Gonzalo", "Micaela", "Ramiro", "Brenda", "Iván",
  "Guadalupe", "Bruno", "Pilar", "Lautaro", "Abril", "Emiliano", "Renata",
];

const INITIALS = ["A", "B", "C", "D", "F", "G", "L", "M", "P", "R", "S", "T", "V"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface Supporter {
  name: string;
  tier: DiplomaTier;
}

/** Personas que bancan, derivado del monto recaudado (≈ aporte promedio $50). */
export function supporterCount(raised: number): number {
  return Math.max(3, Math.round(raised / 50));
}

/** Color del nivel del hincha (mismo que el diploma). */
export function tierColor(tier: DiplomaTier): string {
  return DIPLOMA_TIERS[tier].color;
}

/** Iniciales para el avatar (ej. "Martín G." → "MG"). */
export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Lista determinística de hinchas para mostrar (avatar + nombre + nivel). */
export function supportersFor(slug: string, take: number): Supporter[] {
  const h = hash(slug);
  const out: Supporter[] = [];
  for (let i = 0; i < take; i++) {
    const name = POOL[(h + i * 7) % POOL.length];
    const init = INITIALS[(h + i * 13) % INITIALS.length];
    const roll = (h + i * 5) % 12;
    const tier: DiplomaTier = roll === 0 ? "oro" : roll <= 3 ? "plata" : "bronce";
    out.push({ name: `${name} ${init}.`, tier });
  }
  return out;
}
