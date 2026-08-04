import type { MetadataRoute } from "next";
import { getAllAthletes, getTeams } from "@/lib/data/athletes";
import { getTeamCampaigns } from "@/lib/data/campaigns";
import { SITE } from "@/config/site";

export const dynamic = "force-static";

/** Sitemap estático: se genera en cada build con los perfiles del momento. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [athletes, teams, campaigns] = await Promise.all([
    getAllAthletes(),
    getTeams(),
    getTeamCampaigns(),
  ]);
  const fijas = ["", "para-atletas", "para-equipos", "empresas", "transparencia", "quienes-somos", "faq", "hinchas", "postulate"]
    .map((p) => ({ url: `${SITE.url}/${p ? `${p}/` : ""}` }));
  return [
    ...fijas,
    ...athletes.map((a) => ({ url: `${SITE.url}/atleta/${a.slug}/` })),
    ...teams.map((t) => ({ url: `${SITE.url}/equipo/${t.slug}/` })),
    ...campaigns.map((c) => ({ url: `${SITE.url}/equipos/${c.slug}/` })),
  ];
}
