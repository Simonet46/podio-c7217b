import { getTeamCampaigns, getTeamCampaignBySlug } from "@/lib/data/campaigns";
import { sportColorForTeam } from "@/components/TeamCampaignCard";
import { ogPhoto } from "@/lib/og/photo";
import { ogJpeg } from "@/lib/og/render";
import { StoryCard, STORY, STORY_PHOTO_H } from "@/lib/og/story";
import { campaignShare } from "@/lib/share";

/** Pieza vertical del proyecto para historias de Instagram. Ver historia.jpg
 *  del atleta para el porqué de usar un route handler. */
export const dynamic = "force-static";

export async function generateStaticParams() {
  const campaigns = await getTeamCampaigns();
  const params = campaigns.map((c) => ({ slug: c.slug }));
  // output: export exige al menos un param (mismo caso que la card OG).
  return params.length ? params : [{ slug: "__none__" }];
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const c = await getTeamCampaignBySlug(params.slug);
  if (!c) return new Response("Not found", { status: 404 });

  const share = campaignShare(c);
  const photo = await ogPhoto(c.photo_url ?? c.photo_secondary_url, {
    width: STORY.width,
    height: STORY_PHOTO_H,
  });

  return ogJpeg(
    <StoryCard
      photo={photo}
      initials={c.team_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
      chip={c.sport}
      chipColor={sportColorForTeam(c.sport)}
      title={c.team_name}
      subtitle={c.competition ? `Quieren llegar a ${c.competition}` : undefined}
      reason={c.goal_purpose?.trim() ? share.reasonLong : undefined}
      cta="Sumá tu granito"
      url={`somosgranito.com/equipos/${c.slug}`}
    />,
    STORY,
  );
}
