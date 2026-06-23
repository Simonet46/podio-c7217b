/**
 * Seeder one-off: carga en Supabase los atletas "otros" y los jugadores de
 * equipos, replicando la lógica de src/lib/data/seed.ts.
 *
 * Uso:  node --env-file=.env.local scripts/seed-supabase.mjs
 *
 * Usa la service_role key (bypassa RLS). Idempotente: upsert por slug.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const PLAYER_GOAL = 5000;
const SPORT_LABEL = { handball: "handball", hockey: "hockey", voley: "vóley" };

// ── Otros atletas (fuera del foco LA 2028) ──────────────────────────────
const otros = [
  {
    slug: "benja-ortiz", full_name: "Benjamín Ortiz", first_name: "Benja",
    sport: "futbol", discipline: "Delantero · 16 años", city: "González Catán", province: "Buenos Aires",
    bio: "Juega de 9 en el club del barrio y la rompe. Lo fueron a ver de un par de clubes grandes, pero la familia no puede apoyar los viajes a las pruebas ni los botines. Sueña con ser profesional y darle una mano a los suyos.",
    goal_amount: 4000, raised_amount: 1300,
    stats: [["16", "Años"], ["⚽", "Delantero"], ["Club del barrio", "Hoy"]],
    fund_items: [
      ["Pruebas en clubes", "Viajes para mostrarse en inferiores de clubes grandes."],
      ["Botines y equipo", "Indumentaria básica para competir."],
      ["Nutrición", "Una alimentación acorde a lo que entrena."],
    ],
  },
  {
    slug: "sol-gimenez", full_name: "Sol Giménez", first_name: "Sol",
    sport: "tenis", discipline: "Singles · 15 años", city: "Mendoza", province: "Mendoza",
    bio: "Promesa del tenis mendocino, número uno en su categoría en la provincia. Cada torneo nacional son cientos de kilómetros, hotel y un encordado nuevo. Entrena de mañana antes del colegio.",
    goal_amount: 5000, raised_amount: 2100,
    stats: [["15", "Años"], ["#1", "Provincial"], ["6", "Días de entreno/sem"]],
    fund_items: [
      ["Torneos nacionales", "Viajes, inscripción y estadía del circuito juvenil."],
      ["Raquetas y encordado", "Material que se desgasta cada pocas semanas."],
      ["Entrenador", "Horas de cancha con su coach."],
    ],
  },
  {
    slug: "ciro-medina-atl", full_name: "Ciro Medina", first_name: "Ciro",
    sport: "atletismo", discipline: "800m · 17 años", city: "Resistencia", province: "Chaco",
    bio: "Campeón provincial de 800m. Entrena en una pista de tierra, con zapatillas que ya dieron todo. No va a ningún Juego Olímpico mañana, pero es un fenómeno y merece la chance de competir en serio.",
    goal_amount: 4000, raised_amount: 900,
    stats: [["17", "Años"], ["800m", "Prueba"], ["Oro", "Provincial"]],
    fund_items: [
      ["Viajes a nacionales", "Para correr contra los mejores de su edad."],
      ["Zapatillas de pista", "Spikes que hoy no puede comprar."],
      ["Preparación", "Plan de entrenamiento y nutrición."],
    ],
  },
].map((a) => ({
  ...a, photo_url: null, verified: true, stripe_account_id: null,
  scope: "otros", team: null, role: null, created_at: "2026-02-10T10:00:00Z",
}));

// ── Jugadores de equipos ────────────────────────────────────────────────
// [slug, nombre, posición, ciudad, provincia, recaudado]
const rosters = {
  "handball-arg": ["handball", [
    ["bruno-vidal", "Bruno Vidal", "Pivote", "Buenos Aires", "Buenos Aires", 2100],
    ["lautaro-gomez", "Lautaro Gómez", "Lateral izquierdo", "Córdoba", "Córdoba", 3400],
    ["nicolas-funes", "Nicolás Funes", "Arquero", "Mendoza", "Mendoza", 1800],
    ["inaki-perez", "Iñaki Pérez", "Extremo derecho", "Bahía Blanca", "Buenos Aires", 2600],
    ["santiago-rivas", "Santiago Rivas", "Central", "Rosario", "Santa Fe", 1500],
    ["matias-leiva", "Matías Leiva", "Lateral derecho", "La Plata", "Buenos Aires", 2800],
    ["joaquin-bravo", "Joaquín Bravo", "Pivote", "San Juan", "San Juan", 900],
    ["franco-medina", "Franco Medina", "Extremo izquierdo", "Santa Fe", "Santa Fe", 3200],
    ["agustin-ferreyra", "Agustín Ferreyra", "Lateral izquierdo", "Neuquén", "Neuquén", 1200],
    ["julian-castro", "Julián Castro", "Arquero", "Mar del Plata", "Buenos Aires", 2000],
    ["benjamin-roldan", "Benjamín Roldán", "Central", "Tucumán", "Tucumán", 1700],
    ["emiliano-paez", "Emiliano Páez", "Extremo derecho", "Salta", "Salta", 2400],
    ["valentin-sosa", "Valentín Sosa", "Lateral derecho", "Paraná", "Entre Ríos", 1000],
    ["gonzalo-ibarra", "Gonzalo Ibarra", "Pivote", "Posadas", "Misiones", 2900],
    ["lucas-moreno", "Lucas Moreno", "Lateral izquierdo", "Bariloche", "Río Negro", 1300],
    ["maximo-arce", "Máximo Arce", "Extremo izquierdo", "Corrientes", "Corrientes", 2200],
  ]],
  "hockey-arg": ["hockey", [
    ["delfina-castro", "Delfina Castro", "Volante", "Rosario", "Santa Fe", 3900],
    ["morena-ruiz", "Morena Ruiz", "Delantera", "La Plata", "Buenos Aires", 2700],
    ["abril-sosa", "Abril Sosa", "Arquera", "Mar del Plata", "Buenos Aires", 1500],
    ["juana-mendez", "Juana Méndez", "Defensora", "Tucumán", "Tucumán", 2300],
    ["catalina-vega", "Catalina Vega", "Delantera", "Córdoba", "Córdoba", 1800],
    ["martina-rios", "Martina Ríos", "Volante", "Mendoza", "Mendoza", 2600],
    ["valentina-cabrera", "Valentina Cabrera", "Defensora", "San Isidro", "Buenos Aires", 1100],
    ["paulina-acosta", "Paulina Acosta", "Volante", "Santa Fe", "Santa Fe", 2000],
    ["josefina-luna", "Josefina Luna", "Delantera", "Neuquén", "Neuquén", 900],
    ["renata-molina", "Renata Molina", "Defensora", "Bahía Blanca", "Buenos Aires", 3100],
    ["emma-herrera", "Emma Herrera", "Arquera", "Salta", "Salta", 1400],
    ["mia-dominguez", "Mía Domínguez", "Volante", "Paraná", "Entre Ríos", 2200],
    ["clara-ponce", "Clara Ponce", "Defensora", "Posadas", "Misiones", 1600],
    ["agostina-vera", "Agostina Vera", "Delantera", "Santa Rosa", "La Pampa", 2500],
    ["guadalupe-bravo", "Guadalupe Bravo", "Volante", "San Juan", "San Juan", 1900],
    ["olivia-figueroa", "Olivia Figueroa", "Defensora", "Mar del Plata", "Buenos Aires", 1300],
  ]],
  "voley-arg": ["voley", [
    ["ivan-torres", "Iván Torres", "Opuesto", "San Juan", "San Juan", 2900],
    ["facundo-ledesma", "Facundo Ledesma", "Central", "Santa Fe", "Santa Fe", 2200],
    ["bautista-rios", "Bautista Ríos", "Armador", "Neuquén", "Neuquén", 3100],
    ["thiago-paz", "Thiago Paz", "Punta receptor", "Salta", "Salta", 1700],
    ["mateo-silva", "Mateo Silva", "Central", "Córdoba", "Córdoba", 1500],
    ["lautaro-mendez", "Lautaro Méndez", "Punta receptor", "Rosario", "Santa Fe", 2400],
    ["nicolas-ferrari", "Nicolás Ferrari", "Líbero", "La Plata", "Buenos Aires", 1200],
    ["juan-cruz-vera", "Juan Cruz Vera", "Armador", "Mendoza", "Mendoza", 2000],
    ["valentin-rocha", "Valentín Rocha", "Opuesto", "Bahía Blanca", "Buenos Aires", 900],
    ["simon-aguirre", "Simón Aguirre", "Punta receptor", "Tucumán", "Tucumán", 2700],
    ["benicio-ramos", "Benicio Ramos", "Central", "San Luis", "San Luis", 1600],
    ["tobias-luna", "Tobías Luna", "Punta receptor", "Posadas", "Misiones", 1000],
    ["ciro-herrera", "Ciro Herrera", "Líbero", "Paraná", "Entre Ríos", 2300],
    ["dante-correa", "Dante Correa", "Central", "Neuquén", "Neuquén", 1400],
    ["bruno-medina", "Bruno Medina", "Punta receptor", "Salta", "Salta", 2100],
    ["felipe-aguero", "Felipe Agüero", "Punta receptor", "Mar del Plata", "Buenos Aires", 1800],
  ]],
};

const players = [];
for (const [team, [sport, rows]] of Object.entries(rosters)) {
  const sportLabel = SPORT_LABEL[sport] ?? sport;
  for (const [slug, full_name, role, city, province, raised] of rows) {
    const first_name = full_name.split(" ")[0];
    players.push({
      slug, full_name, first_name, sport, discipline: role, city, province,
      bio: `${first_name} es ${role.toLowerCase()} de la selección argentina de ${sportLabel}. Como gran parte del plantel, compite sin sponsors privados: la ayuda que recibe no alcanza para mucho y se costea buena parte del camino al Mundial.`,
      goal_amount: PLAYER_GOAL, raised_amount: raised, photo_url: null,
      stats: [[role, "Posición"], ["Selección", "Categoría"], ["Mundial", "Objetivo"]],
      fund_items: [
        ["Directo a los jugadores", "El cuerpo técnico cobra sueldo; el plantel no. Tu aporte llega a ellos."],
        ["Viajes y concentraciones", "Pasajes, estadía y comida que hoy salen de su bolsillo."],
        ["Equipamiento", "Indumentaria y material de competición."],
      ],
      verified: true, stripe_account_id: null, scope: "la2028",
      team, role, created_at: "2026-02-05T10:00:00Z",
    });
  }
}

const all = [...otros, ...players];
const { error, count } = await db
  .from("athletes")
  .upsert(all, { onConflict: "slug", ignoreDuplicates: true, count: "exact" });

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
console.log(`OK: upsert de ${all.length} atletas (otros=${otros.length}, jugadores=${players.length})`);
