import type { Team } from "./types";

/**
 * Campañas de equipos (deportes de equipo).
 * Se puede apoyar al equipo entero (se reparte entre el plantel) o a un jugador.
 * `member_slugs` apunta a atletas del seed con `team` igual a este slug.
 * goal/raised se recalculan en la capa de datos a partir de los jugadores.
 */
export const SEED_TEAMS: Team[] = [
  {
    id: "handball-arg",
    slug: "handball-arg",
    name: "Equipo Argentino de Handball",
    sport: "handball",
    discipline: "Selección masculina",
    city: "Buenos Aires",
    province: "Argentina",
    bio: "El handball argentino se ganó un lugar entre la elite a pura garra, casi siempre con menos recursos que sus rivales europeos. El cuerpo técnico cobra un sueldo; los jugadores, en su mayoría, no tienen sponsors privados y la ayuda que reciben no alcanza. Tu aporte se reparte en partes iguales entre los 16 jugadores del plantel.",
    goal_amount: 80000,
    raised_amount: 33000,
    photo_url: "/teams/handball-arg.webp",
    stats: [
      ["16", "Jugadores"],
      ["Mundial", "Objetivo"],
      ["#1", "Sudamérica"],
    ],
    fund_items: [
      ["Directo a los jugadores", "El cuerpo técnico cobra sueldo; el plantel no. Tu aporte va a ellos."],
      ["Viajes y concentraciones", "Pasajes, estadía y comida que hoy salen de su bolsillo."],
      ["Equipamiento", "Indumentaria y material de competición de cada jugador."],
    ],
    verified: true,
    member_slugs: [
      "bruno-vidal", "lautaro-gomez", "nicolas-funes", "inaki-perez",
      "santiago-rivas", "matias-leiva", "joaquin-bravo", "franco-medina",
      "agustin-ferreyra", "julian-castro", "benjamin-roldan", "emiliano-paez",
      "valentin-sosa", "gonzalo-ibarra", "lucas-moreno", "maximo-arce",
    ],
    created_at: "2026-02-05T10:00:00Z",
  },
  {
    id: "hockey-arg",
    slug: "hockey-arg",
    name: "Equipo Argentino de Hockey",
    sport: "hockey",
    discipline: "Selección femenina",
    city: "Buenos Aires",
    province: "Argentina",
    bio: "Una de las camadas más prometedoras del hockey argentino va por su lugar en el Mundial. Entrenan doble turno, estudian o trabajan en paralelo y se pagan buena parte de los viajes. Salvo el cuerpo técnico, casi ninguna tiene un sponsor que la respalde. Tu aporte se reparte en partes iguales entre las 16 jugadoras.",
    goal_amount: 80000,
    raised_amount: 32800,
    photo_url: "/teams/hockey-arg.webp",
    stats: [
      ["16", "Jugadoras"],
      ["Mundial", "Objetivo"],
      ["Oro", "Panamericano"],
    ],
    fund_items: [
      ["Directo a las jugadoras", "El cuerpo técnico cobra sueldo; el plantel no. Tu aporte va a ellas."],
      ["Viajes y concentraciones", "Pasajes y estadía de torneos que hoy se pagan solas."],
      ["Equipamiento", "Palos, protecciones e indumentaria de cada jugadora."],
    ],
    verified: true,
    member_slugs: [
      "delfina-castro", "morena-ruiz", "abril-sosa", "juana-mendez",
      "catalina-vega", "martina-rios", "valentina-cabrera", "paulina-acosta",
      "josefina-luna", "renata-molina", "emma-herrera", "mia-dominguez",
      "clara-ponce", "agostina-vera", "guadalupe-bravo", "olivia-figueroa",
    ],
    created_at: "2026-02-05T10:00:00Z",
  },
  {
    id: "voley-arg",
    slug: "voley-arg",
    name: "Equipo Argentino de Vóley",
    sport: "voley",
    discipline: "Selección masculina",
    city: "Buenos Aires",
    province: "Argentina",
    bio: "Con una mística que enamora, el vóley argentino sueña con repetir las grandes hazañas de su historia. El plantel es joven y, más allá del cuerpo técnico, casi nadie tiene un sponsor que lo sostenga. Tu aporte se reparte en partes iguales entre los 16 jugadores.",
    goal_amount: 80000,
    raised_amount: 30800,
    photo_url: "/teams/voley-arg.webp",
    stats: [
      ["16", "Jugadores"],
      ["Mundial", "Objetivo"],
      ["Top 8", "Ranking FIVB"],
    ],
    fund_items: [
      ["Directo a los jugadores", "El cuerpo técnico cobra sueldo; el plantel no. Tu aporte va a ellos."],
      ["Viajes y concentraciones", "Pasajes y estadía de la ventana internacional."],
      ["Equipamiento", "Indumentaria y material de competición de cada jugador."],
    ],
    verified: true,
    member_slugs: [
      "ivan-torres", "facundo-ledesma", "bautista-rios", "thiago-paz",
      "mateo-silva", "lautaro-mendez", "nicolas-ferrari", "juan-cruz-vera",
      "valentin-rocha", "simon-aguirre", "benicio-ramos", "tobias-luna",
      "ciro-herrera", "dante-correa", "bruno-medina", "felipe-aguero",
    ],
    created_at: "2026-02-05T10:00:00Z",
  },
];
