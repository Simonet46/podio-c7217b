/**
 * Catálogo de deportes.
 * `team: true` → deporte de equipo (se puede apoyar al equipo o a jugadores).
 * Cada deporte tiene un color de panel para tarjetas y heroes.
 */

export type SportKey =
  // individuales
  | "canotaje"
  | "escalada"
  | "natacion"
  | "atletismo"
  | "vela"
  | "judo"
  | "remo"
  | "bmx"
  // de equipo
  | "hockey"
  | "voley"
  | "handball"
  // otros / base (campañas individuales fuera del foco LA 2028)
  | "futbol"
  | "tenis"
  | "basquet";

export interface Sport {
  key: SportKey;
  label: string;
  /** Color de panel (tarjeta + hero). */
  color: string;
  /** ¿Es deporte de equipo? */
  team?: boolean;
}

export const SPORTS: Record<SportKey, Sport> = {
  canotaje: { key: "canotaje", label: "Canotaje", color: "#1E6E8C" },
  escalada: { key: "escalada", label: "Escalada", color: "#B5532A" },
  natacion: { key: "natacion", label: "Natación", color: "#1C7BB0" },
  atletismo: { key: "atletismo", label: "Atletismo", color: "#7A4FB0" },
  vela: { key: "vela", label: "Vela / Kite", color: "#0E8C7B" },
  judo: { key: "judo", label: "Judo", color: "#3A4A5C" },
  remo: { key: "remo", label: "Remo", color: "#2C6E63" },
  bmx: { key: "bmx", label: "BMX", color: "#C24A3A" },
  hockey: { key: "hockey", label: "Hockey", color: "#1B7A4B", team: true },
  voley: { key: "voley", label: "Vóley", color: "#B5882A", team: true },
  handball: { key: "handball", label: "Handball", color: "#9C3B5A", team: true },
  futbol: { key: "futbol", label: "Fútbol", color: "#2E7D32" },
  tenis: { key: "tenis", label: "Tenis", color: "#A2B43A" },
  basquet: { key: "basquet", label: "Básquet", color: "#C25A28" },
};

export const SPORT_LIST: Sport[] = Object.values(SPORTS);

export function getSport(key: string): Sport | undefined {
  return SPORTS[key as SportKey];
}
