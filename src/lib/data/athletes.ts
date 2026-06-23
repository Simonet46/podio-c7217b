import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { supporterCount } from "@/lib/supporters";
import { SEED_ATHLETES } from "./seed";
import { SEED_TEAMS } from "./teams";
import type { Athlete, Team } from "./types";

/**
 * Capa de acceso a datos.
 * En el sitio estático lee del seed local; si Supabase está configurado, de ahí.
 */

const ONLY_VERIFIED = true;

async function allAthletesRaw(): Promise<Athlete[]> {
  if (isSupabaseConfigured) {
    const supabase = await getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("verified", true)
        .order("created_at", { ascending: true });
      if (!error && data) return data as Athlete[];
    }
  }
  return SEED_ATHLETES.filter((a) => !ONLY_VERIFIED || a.verified);
}

/** TODOS los atletas (individuales + jugadores de equipo). Para perfiles y conteos. */
export async function getAllAthletes(): Promise<Athlete[]> {
  return allAthletesRaw();
}

/** Atletas individuales del foco LA 2028 (grid principal del home). */
export async function getAthletes(): Promise<Athlete[]> {
  const all = await allAthletesRaw();
  return all.filter((a) => !a.team && a.scope !== "otros");
}

/** Otros atletas argentinos (juveniles, regionales, amateurs). */
export async function getOtherAthletes(): Promise<Athlete[]> {
  const all = await allAthletesRaw();
  return all.filter((a) => !a.team && a.scope === "otros");
}

export async function getAthleteBySlug(slug: string): Promise<Athlete | null> {
  const all = await allAthletesRaw();
  return all.find((a) => a.slug === slug) ?? null;
}

/** Recalcula recaudado y meta del equipo como la suma de sus jugadores. */
function withTeamTotals(team: Team, all: Athlete[]): Team {
  const members = team.member_slugs
    .map((slug) => all.find((a) => a.slug === slug))
    .filter((a): a is Athlete => Boolean(a));
  return {
    ...team,
    raised_amount: members.reduce((s, m) => s + m.raised_amount, 0),
    goal_amount: members.reduce((s, m) => s + m.goal_amount, 0),
  };
}

/** Equipos (deportes de equipo). */
export async function getTeams(): Promise<Team[]> {
  const all = await allAthletesRaw();
  return SEED_TEAMS.filter((t) => !ONLY_VERIFIED || t.verified).map((t) =>
    withTeamTotals(t, all),
  );
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const team = SEED_TEAMS.find((t) => t.slug === slug);
  if (!team) return null;
  const all = await allAthletesRaw();
  return withTeamTotals(team, all);
}

/** Jugadores de un equipo, en el orden de member_slugs. */
export async function getTeamMembers(team: Team): Promise<Athlete[]> {
  const all = await allAthletesRaw();
  return team.member_slugs
    .map((slug) => all.find((a) => a.slug === slug))
    .filter((a): a is Athlete => Boolean(a));
}

/** Totales para el home y para el reparto de "Apoyá a todos". */
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
  return {
    // Atletas individuales + todos los jugadores de equipos.
    athleteCount: athletes.length,
    // Campañas visibles en el home: individuales + equipos.
    campaignCount: athletes.filter((a) => !a.team).length + teams.length,
    teamCount: teams.length,
    totalRaised,
    supporterTotal,
  };
}
