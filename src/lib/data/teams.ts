import type { Team } from "./types";

/** Datos estáticos de una selección por su slug (sin totales). Para badges. */
export function getTeamMeta(slug: string | undefined | null): Team | undefined {
  if (!slug) return undefined;
  return SEED_TEAMS.find((t) => t.slug === slug);
}

/**
 * Selecciones nacionales argentinas.
 * Los jugadores NO están hardcodeados: la membresía es dinámica — son los
 * atletas cuyo campo `team` coincide con el `slug` de la selección (se asignan
 * desde el backoffice). El recaudado del equipo es la suma real de sus
 * jugadores. No hay pago "al equipo": el aporte va directo a cada jugador
 * (Mercado Pago acredita a una sola cuenta por pago), y la página es el lugar
 * donde el hincha elige a quién bancar.
 */
export const SEED_TEAMS: Team[] = [
  {
    id: "los-gladiadores",
    slug: "los-gladiadores",
    name: "Los Gladiadores",
    sport: "handball",
    discipline: "Selección Argentina de Handball · Masculino",
    city: "Argentina",
    province: "Argentina",
    bio: "Se ganaron un lugar entre la elite mundial a pura garra, casi siempre con menos recursos que sus rivales europeos. Detrás de cada partido de Los Gladiadores hay jugadores que se pagan viajes, entrenan doble turno y sostienen su carrera como pueden.",
    goal_amount: 0,
    raised_amount: 0,
    photo_url: "/teams/handball-arg-2.jpg",
    stats: [],
    fund_items: [],
    verified: true,
    national: true,
    color: "#9C3B5A",
    created_at: "2026-07-04T10:00:00Z",
  },
  {
    id: "las-leonas",
    slug: "las-leonas",
    name: "Equipo de Hockey Argentina femenino",
    sport: "hockey",
    discipline: "Hockey Argentina · Femenino",
    city: "Argentina",
    province: "Argentina",
    bio: "Un símbolo del deporte argentino. El equipo femenino de hockey lleva décadas dejando el nombre del país en lo más alto del hockey mundial — muchas veces compaginando el alto rendimiento con el estudio, el trabajo y el esfuerzo económico propio.",
    goal_amount: 0,
    raised_amount: 0,
    photo_url: "/teams/hockey-arg.webp",
    stats: [],
    fund_items: [],
    verified: true,
    national: true,
    color: "#1B7A4B",
    created_at: "2026-07-04T10:00:00Z",
  },
  {
    id: "los-leones",
    slug: "los-leones",
    name: "Los Leones",
    sport: "hockey",
    discipline: "Selección Argentina de Hockey · Masculino",
    city: "Argentina",
    province: "Argentina",
    bio: "Campeones olímpicos y una de las potencias del hockey mundial. Los Leones representan a la Argentina en cada cancha del planeta, sosteniendo un nivel de elite que exige muchísimo más apoyo del que reciben.",
    goal_amount: 0,
    raised_amount: 0,
    photo_url: "/teams/hockey-arg.webp",
    stats: [],
    fund_items: [],
    verified: true,
    national: true,
    color: "#1B7A4B",
    created_at: "2026-07-04T10:00:00Z",
  },
  {
    id: "las-panteras",
    slug: "las-panteras",
    name: "Las Panteras",
    sport: "voley",
    discipline: "Selección Argentina de Vóley · Femenino",
    city: "Argentina",
    province: "Argentina",
    bio: "El vóley femenino argentino crece a fuerza de mística y sacrificio. Las Panteras pelean cada punto contra las mejores del mundo, con un plantel joven que casi nunca cuenta con el respaldo que su nivel merece.",
    goal_amount: 0,
    raised_amount: 0,
    photo_url: "/teams/voley-arg.webp",
    stats: [],
    fund_items: [],
    verified: true,
    national: true,
    color: "#B5882A",
    created_at: "2026-07-04T10:00:00Z",
  },
  {
    id: "seleccion-voley-masculina",
    slug: "seleccion-voley-masculina",
    name: "Selección de Vóley",
    sport: "voley",
    discipline: "Selección Argentina de Vóley · Masculino",
    city: "Argentina",
    province: "Argentina",
    bio: "Con una historia de hazañas que enamoró a generaciones, el vóley masculino argentino sigue soñando en grande. Un plantel que deja todo por la celeste y blanca y que necesita del hincha para sostener el camino.",
    goal_amount: 0,
    raised_amount: 0,
    photo_url: "/teams/voley-arg.webp",
    stats: [],
    fund_items: [],
    verified: true,
    national: true,
    color: "#B5882A",
    created_at: "2026-07-04T10:00:00Z",
  },
];
