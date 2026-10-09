/**
 * Catálogo de deportes.
 * `team: true` → deporte de equipo (se puede apoyar al equipo o a jugadores).
 * Cada deporte tiene un color de panel para tarjetas y heroes.
 *
 * Criterios y razones de cada deporte: docs/ops/catalogo-deportes.md.
 * La base guarda `sport` como texto libre, así que sumar un deporte acá alcanza.
 */

export type SportKey =
  // individuales
  | "atletismo"
  | "badminton"
  | "bmx"
  | "boxeo"
  | "canotaje"
  | "ciclismo"
  | "equitacion"
  | "escalada"
  | "esgrima"
  | "gimnasia"
  | "golf"
  | "judo"
  | "lucha"
  | "natacion"
  | "pentatlon"
  | "pesas"
  | "remo"
  | "skate"
  | "squash"
  | "surf"
  | "taekwondo"
  | "tenis"
  | "tenis-de-mesa"
  | "tiro"
  | "tiro-con-arco"
  | "triatlon"
  | "vela"
  // de equipo
  | "basquet"
  | "beach-voley"
  | "futbol"
  | "handball"
  | "hockey"
  | "rugby"
  | "softbol"
  | "voley";

export interface Sport {
  key: SportKey;
  label: string;
  /** Color de panel (tarjeta + hero). */
  color: string;
  /** ¿Es deporte de equipo? */
  team?: boolean;
  /**
   * Si el deporte tiene pruebas/modalidades que cambian la historia del atleta,
   * el formulario pide "tu prueba" con este placeholder.
   */
  disciplineHint?: string;
}

export const SPORTS: Record<SportKey, Sport> = {
  // ── Individuales ──
  atletismo: {
    key: "atletismo",
    label: "Atletismo",
    color: "#7A4FB0",
    disciplineHint: "Ej: 400m con vallas, Salto en largo, Maratón…",
  },
  badminton: { key: "badminton", label: "Bádminton", color: "#5E8C3A" },
  bmx: {
    key: "bmx",
    label: "BMX",
    color: "#C24A3A",
    disciplineHint: "Ej: Racing, Freestyle park…",
  },
  boxeo: {
    key: "boxeo",
    label: "Boxeo",
    color: "#8C2F2F",
    disciplineHint: "Ej: 51 kg, 63,5 kg, 80 kg…",
  },
  canotaje: {
    key: "canotaje",
    label: "Canotaje",
    color: "#1E6E8C",
    disciplineHint: "Ej: K1 500m, C2 500m, Slalom K1…",
  },
  ciclismo: {
    key: "ciclismo",
    label: "Ciclismo",
    color: "#D9822B",
    disciplineHint: "Ej: Ruta, Pista (omnium), Mountain bike…",
  },
  equitacion: {
    key: "equitacion",
    label: "Equitación",
    color: "#6B4F2A",
    disciplineHint: "Ej: Salto, Adiestramiento, Concurso completo…",
  },
  escalada: {
    key: "escalada",
    label: "Escalada",
    color: "#B5532A",
    disciplineHint: "Ej: Boulder, Dificultad, Velocidad…",
  },
  esgrima: {
    key: "esgrima",
    label: "Esgrima",
    color: "#4A5A8C",
    disciplineHint: "Ej: Sable, Espada, Florete…",
  },
  gimnasia: {
    key: "gimnasia",
    label: "Gimnasia",
    color: "#B03A7A",
    disciplineHint: "Ej: Artística, Rítmica, Trampolín…",
  },
  golf: { key: "golf", label: "Golf", color: "#3A7A3A" },
  judo: {
    key: "judo",
    label: "Judo",
    color: "#3A4A5C",
    disciplineHint: "Ej: -57 kg, -73 kg, -100 kg…",
  },
  lucha: {
    key: "lucha",
    label: "Lucha",
    color: "#7A3A2A",
    disciplineHint: "Ej: Libre 62 kg, Grecorromana 77 kg…",
  },
  natacion: {
    key: "natacion",
    label: "Natación",
    color: "#1C7BB0",
    disciplineHint: "Ej: 100m mariposa, 400m libre, Aguas abiertas 10 km…",
  },
  pentatlon: { key: "pentatlon", label: "Pentatlón moderno", color: "#5A6E3A" },
  pesas: {
    key: "pesas",
    label: "Pesas",
    color: "#4A4A4A",
    disciplineHint: "Ej: 65 kg, 88 kg, +110 kg…",
  },
  remo: {
    key: "remo",
    label: "Remo",
    color: "#2C6E63",
    disciplineHint: "Ej: Single scull, Doble par peso ligero…",
  },
  skate: {
    key: "skate",
    label: "Skateboarding",
    color: "#8C6E2A",
    disciplineHint: "Ej: Street, Park…",
  },
  squash: { key: "squash", label: "Squash", color: "#2A6E8C" },
  surf: {
    key: "surf",
    label: "Surf",
    color: "#1C8CA0",
    disciplineHint: "Ej: Shortboard, Longboard…",
  },
  taekwondo: {
    key: "taekwondo",
    label: "Taekwondo",
    color: "#2A4A8C",
    disciplineHint: "Ej: -58 kg, -68 kg, +80 kg…",
  },
  tenis: { key: "tenis", label: "Tenis", color: "#A2B43A" },
  "tenis-de-mesa": { key: "tenis-de-mesa", label: "Tenis de mesa", color: "#8C3A5A" },
  tiro: {
    key: "tiro",
    label: "Tiro deportivo",
    color: "#5C5A3A",
    disciplineHint: "Ej: Skeet, Fosa olímpica, Rifle 10m, Pistola 25m…",
  },
  "tiro-con-arco": {
    key: "tiro-con-arco",
    label: "Tiro con arco",
    color: "#6E3A8C",
    disciplineHint: "Ej: Recurvo, Compuesto…",
  },
  triatlon: { key: "triatlon", label: "Triatlón", color: "#C2602A" },
  vela: {
    key: "vela",
    label: "Vela / Kite",
    color: "#0E8C7B",
    disciplineHint: "Ej: ILCA 7, 49er FX, Formula Kite, iQFOiL…",
  },

  // ── De equipo ──
  // Fútbol y básquet no llevan `team` a propósito: en el muro hoy solo hay
  // campañas individuales de esos deportes y el sello "EQUIPO" confundiría.
  basquet: { key: "basquet", label: "Básquet", color: "#C25A28" },
  "beach-voley": { key: "beach-voley", label: "Beach vóley", color: "#C2A23A", team: true },
  futbol: { key: "futbol", label: "Fútbol", color: "#2E7D32" },
  handball: { key: "handball", label: "Handball", color: "#9C3B5A", team: true },
  hockey: { key: "hockey", label: "Hockey", color: "#1B7A4B", team: true },
  rugby: { key: "rugby", label: "Rugby", color: "#1F4E79", team: true },
  softbol: { key: "softbol", label: "Sóftbol / Béisbol", color: "#8C4A2A", team: true },
  voley: { key: "voley", label: "Vóley", color: "#B5882A", team: true },
};

export const SPORT_LIST: Sport[] = Object.values(SPORTS);

/** Lista alfabética (para selectores donde hay que encontrar el propio deporte). */
export const SPORT_LIST_ALPHA: Sport[] = [...SPORT_LIST].sort((a, b) =>
  a.label.localeCompare(b.label, "es"),
);

export function getSport(key: string): Sport | undefined {
  return SPORTS[key as SportKey];
}
