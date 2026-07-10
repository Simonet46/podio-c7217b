import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Campañas de equipos (crowdfunding de misiones).
 * Lee la vista `public_teams`: solo equipos aprobados y con Mercado Pago
 * conectado, con el total RECAUDADO agregado. El aporte se cobra al instante
 * y va directo al equipo (igual que un atleta); el objetivo es solo una
 * referencia visual: el dinero se entrega aunque no se llegue.
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
  photo_url: string | null;
  photo_secondary_url: string | null;
  raised_amount: number;
  donor_count: number;
}

function normalize(row: Record<string, unknown>): TeamCampaign {
  return {
    ...(row as unknown as TeamCampaign),
    // numeric de Postgres llega como string por la API.
    goal_amount: Number(row.goal_amount) || 0,
    raised_amount: Number(row.raised_amount) || 0,
    donor_count: Number(row.donor_count) || 0,
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

/** Novedad publicada de una campaña de equipo (mismo shape que las de atleta,
 *  así reusamos el componente de timeline). */
export interface TeamUpdate {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  created_at: string;
}

/** Novedades APROBADAS de un equipo. Vacío si no hay Supabase. */
export async function getTeamUpdates(teamId: string): Promise<TeamUpdate[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("team_updates")
    .select("id,title,body,image_url,created_at")
    .eq("team_id", teamId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return (data as TeamUpdate[]) ?? [];
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
