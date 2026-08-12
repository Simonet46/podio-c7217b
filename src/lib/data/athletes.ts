import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { supporterCount } from "@/lib/supporters";
import { SEED_ATHLETES } from "./seed";
import { SEED_TEAMS } from "./teams";
import type { Athlete, Team } from "./types";

/** Novedad publicada por un atleta (aprobada) para su perfil público. */
export interface AthleteUpdate {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  created_at: string;
}

/** Novedades APROBADAS de un atleta (por slug). Vacío si no hay Supabase. */
export async function getAthleteUpdates(slug: string): Promise<AthleteUpdate[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!athlete?.id) return [];
  const { data } = await supabase
    .from("athlete_updates")
    .select("id,title,body,image_url,created_at")
    .eq("athlete_id", athlete.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return (data as AthleteUpdate[]) ?? [];
}

/**
 * Capa de acceso a datos.
 * En el sitio estático lee del seed local; si Supabase está configurado, de ahí.
 */

const ONLY_VERIFIED = true;

/**
 * Recaudado real por atleta, en NETO (lo que le queda después del 7%).
 *
 * NO usamos `athletes.raised_amount`: esa columna no la actualiza nadie (el
 * webhook de MP inserta la donación y no la toca), así que sólo está bien
 * mientras alguien la mantenga a mano. La verdad son las donaciones
 * acreditadas, agregadas en la vista `public_athlete_raised`.
 */
async function netRaisedByAthlete(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabase>>>,
): Promise<Map<string, number>> {
  const totals = new Map<string, number>();
  const { data, error } = await supabase
    .from("public_athlete_raised")
    .select("athlete_id,raised_net");
  if (error || !data) return totals;
  for (const row of data as { athlete_id: string; raised_net: number | string }[]) {
    totals.set(row.athlete_id, Number(row.raised_net) || 0);
  }
  return totals;
}

async function allAthletesRaw(): Promise<Athlete[]> {
  if (isSupabaseConfigured) {
    const supabase = await getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("verified", true)
        .order("created_at", { ascending: true });
      if (!error && data) {
        const net = await netRaisedByAthlete(supabase);
        // Sin donaciones acreditadas, 0. Nunca caemos a raised_amount: si la
        // vista fallara, mostrar un número viejo sería peor que mostrar cero.
        return (data as Athlete[]).map((a) => ({
          ...a,
          raised_amount: net.get(a.id) ?? 0,
        }));
      }
    }
  }
  return SEED_ATHLETES.filter((a) => !ONLY_VERIFIED || a.verified);
}

/** TODOS los atletas (individuales + jugadores de equipo). Para perfiles y conteos. */
export async function getAllAthletes(): Promise<Athlete[]> {
  return allAthletesRaw();
}

/** Atletas del grid principal del home. Los de selección nacional también
 *  aparecen acá: el atleta siempre es protagonista (la selección es un hub). */
export async function getAthletes(): Promise<Athlete[]> {
  const all = await allAthletesRaw();
  return all.filter((a) => a.scope !== "otros");
}

/** Otros atletas argentinos (juveniles, regionales, amateurs). */
export async function getOtherAthletes(): Promise<Athlete[]> {
  const all = await allAthletesRaw();
  return all.filter((a) => a.scope === "otros");
}

export async function getAthleteBySlug(slug: string): Promise<Athlete | null> {
  const all = await allAthletesRaw();
  return all.find((a) => a.slug === slug) ?? null;
}

/** Jugadores de un equipo: membresía dinámica por `athlete.team === team.slug`,
 *  con fallback a member_slugs (legacy/demo) si existieran. */
function teamMembers(team: Team, all: Athlete[]): Athlete[] {
  const byTeam = all.filter((a) => a.team === team.slug);
  if (byTeam.length > 0) return byTeam;
  if (team.member_slugs?.length) {
    return team.member_slugs
      .map((slug) => all.find((a) => a.slug === slug))
      .filter((a): a is Athlete => Boolean(a));
  }
  return [];
}

/** Recalcula el recaudado del equipo como la suma real de sus jugadores. */
function withTeamTotals(team: Team, all: Athlete[]): Team {
  const members = teamMembers(team, all);
  return {
    ...team,
    raised_amount: members.reduce((s, m) => s + m.raised_amount, 0),
  };
}

/** Selecciones: las del seed + las cargadas desde el backoffice (tabla
 *  `teams`). Si una fila de la base repite un slug del seed, la base gana —
 *  así una selección histórica se puede "adoptar" y editar desde el admin. */
async function allTeamsRaw(): Promise<Team[]> {
  const bySlug = new Map<string, Team>();
  for (const t of SEED_TEAMS) bySlug.set(t.slug, t);
  if (isSupabaseConfigured) {
    const supabase = await getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("verified", true)
        .order("created_at", { ascending: true });
      if (!error && data) {
        for (const row of data as Record<string, unknown>[]) {
          bySlug.set(row.slug as string, {
            member_slugs: [],
            fromDb: true,
            ...(row as unknown as Team),
            stats: (row.stats as Team["stats"]) ?? [],
            fund_items: (row.fund_items as Team["fund_items"]) ?? [],
            goal_amount: Number(row.goal_amount) || 0,
            raised_amount: Number(row.raised_amount) || 0,
          });
        }
      }
    }
  }
  return [...bySlug.values()];
}

/** Selecciones nacionales. */
export async function getTeams(): Promise<Team[]> {
  const [teams, all] = await Promise.all([allTeamsRaw(), allAthletesRaw()]);
  return teams.filter((t) => !ONLY_VERIFIED || t.verified).map((t) =>
    withTeamTotals(t, all),
  );
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const teams = await allTeamsRaw();
  const team = teams.find((t) => t.slug === slug);
  if (!team) return null;
  const all = await allAthletesRaw();
  return withTeamTotals(team, all);
}

/** Jugadores de un equipo (atletas asignados a esa selección). */
export async function getTeamMembers(team: Team): Promise<Athlete[]> {
  const all = await allAthletesRaw();
  return teamMembers(team, all);
}

/** Totales agregados del sitio (hoy sin uso directo; útil para stats). */
export async function getGlobalStats() {
  const athletes = await getAllAthletes();
  const teams = await getTeams();
  // Cada atleta (individual o jugador de equipo) cuenta una sola vez.
  // Las metas de equipo se derivan de los jugadores, así que NO se suman aparte.
  const totalRaised = athletes.reduce((s, a) => s + a.raised_amount, 0);
  // Personas apoyando: individuales + equipos (los jugadores rollupean en su equipo).
  const supporterTotal =
    athletes
      .filter((a) => !a.team)
      .reduce((s, a) => s + supporterCount(a.raised_amount), 0) +
    teams.reduce((s, t) => s + supporterCount(t.raised_amount), 0);
  // Deportes distintos representados (real, para las stats del home).
  const sportCount = new Set(athletes.map((a) => a.sport)).size;
  return {
    // Atletas individuales + todos los jugadores de equipos.
    athleteCount: athletes.length,
    // Campañas visibles en el home: individuales + equipos.
    campaignCount: athletes.filter((a) => !a.team).length + teams.length,
    teamCount: teams.length,
    sportCount,
    totalRaised,
    supporterTotal,
  };
}
