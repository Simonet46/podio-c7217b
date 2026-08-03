import { getAllAthletes, getAthleteBySlug } from "@/lib/data/athletes";
import { getSport } from "@/config/sports";
import { ogPhoto } from "@/lib/og/photo";
import { ogJpeg } from "@/lib/og/render";
import { StoryCard, STORY, STORY_PHOTO_H } from "@/lib/og/story";
import { athleteShare, place } from "@/lib/share";

/**
 * Pieza vertical del atleta para historias de Instagram.
 *
 * Es un route handler y no una imagen de metadata porque necesitamos una URL
 * que termine en .jpg: así el teléfono la reconoce como foto al descargarla o
 * al mandarla al menú de compartir. Se genera en el build (output: export).
 */
export const dynamic = "force-static";

export async function generateStaticParams() {
  const athletes = await getAllAthletes();
  return athletes.map((a) => ({ slug: a.slug }));
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const athlete = await getAthleteBySlug(params.slug);
  if (!athlete) return new Response("Not found", { status: 404 });

  const sport = getSport(athlete.sport);
  const share = athleteShare(athlete);
  const photo = await ogPhoto(athlete.photo_url, {
    width: STORY.width,
    height: STORY_PHOTO_H,
  });

  return ogJpeg(
    <StoryCard
      photo={photo}
      initials={athlete.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
      chip={sport?.label ?? athlete.sport}
      chipColor={sport?.color ?? "#6CB4E4"}
      title={athlete.full_name}
      subtitle={place(athlete.city, athlete.province)}
      reason={share.reasonLong}
      cta="Apoyá su camino"
      url={`somosgranito.com/atleta/${athlete.slug}`}
    />,
    STORY,
  );
}
