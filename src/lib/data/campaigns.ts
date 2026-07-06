import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Campañas de equipos (crowdfunding de misiones).
 * Lee la vista `public_teams`: solo equipos aprobados, sin datos de contacto,
 * con el total COMPROMETIDO agregado. El dinero no se cobra al aportar:
 * queda en standby hasta que GRANITO valida la campaña al finalizar.
 */
export interface TeamCampaign {
  id: string;
  slug: string;
  team_name: string;
  sport: string;
  competition: string | null;
  goal_amount: number;
  goal_purpose: string | null;
  fundraising_start: string | null;
  fundraising_end: string | null;
  active: boolean;
  pledged_amount: number;
  pledge_count: number;
}

function normalize(row: Record<string, unknown>): TeamCampaign {
  return {
    ...(row as unknown as TeamCampaign),
    // numeric de Postgres llega como string por la API.
    goal_amount: Number(row.goal_amount) || 0,
    pledged_amount: Number(row.pledged_amount) || 0,
    pledge_count: Number(row.pledge_count) || 0,
  };
}

/** Campañas activas para el home y las páginas estáticas. */
export async function getTeamCampaigns(): Promise<TeamCampaign[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("public_teams")
    .select("*")
    .eq("active", true)
    .order("fundraising_end", { ascending: true });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(normalize);
}

export async function getTeamCampaignBySlug(slug: string): Promise<TeamCampaign | null> {
  const all = await getTeamCampaigns();
  return all.find((t) => t.slug === slug) ?? null;
}

/** Días restantes de campaña (null si no tiene fecha de fin). */
export function campaignDaysLeft(c: TeamCampaign): number | null {
  if (!c.fundraising_end) return null;
  const end = new Date(c.fundraising_end + "T23:59:59");
  return Math.ceil((end.getTime() - Date.now()) / 86400000);
}

/** ¿La campaña ya cerró? (pasó la fecha de fin) */
export function campaignEnded(c: TeamCampaign): boolean {
  const days = campaignDaysLeft(c);
  return days !== null && days < 0;
}
