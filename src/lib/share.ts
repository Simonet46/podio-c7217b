import type { Athlete, Team } from "@/lib/data/types";
import type { TeamCampaign } from "@/lib/data/campaigns";
import { getSport } from "@/config/sports";

/**
 * Textos de las tarjetas de compartir (WhatsApp, Instagram, X).
 *
 * Viven acá y no en cada página para que el título/bajada de la card y el
 * texto que va dibujado DENTRO de la imagen digan exactamente lo mismo.
 */

/** Recorta a `max` caracteres sin cortar palabras al medio. */
export function clamp(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).replace(/[.,;:]$/, "")}…`;
}

/** Ciudad + provincia sin repetir (Buenos Aires, Buenos Aires → Buenos Aires). */
export function place(city?: string | null, province?: string | null): string {
  return [...new Set([city, province].filter(Boolean))].join(", ");
}

export interface ShareCopy {
  /** og:title — lo que va en negrita arriba de la card. */
  title: string;
  /** og:description — el porqué del apoyo, en 1-2 renglones. */
  description: string;
  /** Misma idea que `description` pero más corta: va dibujada en la imagen. */
  reason: string;
  /** Versión larga del porqué, para la pieza vertical de historias (hay lugar). */
  reasonLong: string;
}

/**
 * La bio ya cuenta por qué el atleta necesita apoyo (es el campo que llenan en
 * la postulación), así que la usamos como bajada. Si está vacía, armamos una
 * línea con los datos que siempre existen.
 */
export function athleteShare(a: Athlete): ShareCopy {
  const sportLabel = getSport(a.sport)?.label ?? a.sport;
  const where = place(a.city, a.province);
  const fallback = `${sportLabel}${where ? ` de ${where}` : ""}. Entrena sin sponsors: tu aporte llega directo a su cuenta.`;
  const bio = a.bio?.trim();
  return {
    title: `Apoyá a ${a.full_name} — ${sportLabel}`,
    description: bio ? clamp(bio, 185) : fallback,
    reason: bio ? clamp(bio, 118) : clamp(fallback, 118),
    reasonLong: bio ? clamp(bio, 175) : clamp(fallback, 175),
  };
}

/** Selección nacional (hub de jugadores). */
export function teamShare(t: Team): ShareCopy {
  const bio = t.bio?.trim();
  const fallback = `${t.discipline}. Elegí a qué jugadora o jugador apoyar: tu aporte llega directo a su cuenta.`;
  return {
    title: `Apoyá a ${t.name}`,
    description: bio ? clamp(bio, 185) : fallback,
    reason: bio ? clamp(bio, 118) : clamp(fallback, 118),
    reasonLong: bio ? clamp(bio, 175) : clamp(fallback, 175),
  };
}

/** Campaña de equipo (proyecto con objetivo y fecha). */
export function campaignShare(c: TeamCampaign): ShareCopy {
  const purpose = c.goal_purpose?.trim();
  const fallback = c.competition
    ? `Están juntando para llegar a ${c.competition}. Sumá tu granito.`
    : "Sumá tu granito para que puedan llegar a su próxima competencia.";
  return {
    title: `Apoyá a ${c.team_name}${c.competition ? ` — ${c.competition}` : ""}`,
    description: purpose ? clamp(purpose, 185) : fallback,
    reason: purpose ? clamp(purpose, 118) : clamp(fallback, 118),
    reasonLong: purpose ? clamp(purpose, 175) : clamp(fallback, 175),
  };
}
