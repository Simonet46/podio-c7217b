import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationWidget } from "@/components/DonationWidget";
import { Monogram } from "@/components/Monogram";
import { Reveal } from "@/components/Reveal";
import { SupporterStack } from "@/components/SupporterStack";
import { SupporterWall } from "@/components/SupporterWall";
import { SponsorLogo } from "@/components/SponsorLogo";
import { getSponsorForSlug } from "@/lib/data/sponsors";
import { getAthleteBySlug, getAllAthletes, getTeamBySlug } from "@/lib/data/athletes";
import { getSport } from "@/config/sports";
import { formatMoney } from "@/lib/money";
import { supporterCount } from "@/lib/supporters";
import { SITE, asset } from "@/config/site";

export async function generateStaticParams() {
  const athletes = await getAllAthletes();
  return athletes.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const athlete = await getAthleteBySlug(params.slug);
  if (!athlete) return { title: SITE.brand };
  return {
    title: `${athlete.full_name} — ${SITE.brand}`,
    description: `Apoyá a ${athlete.full_name}, ${getSport(athlete.sport)?.label ?? athlete.sport} de ${athlete.city}, rumbo a LA 2028.`,
  };
}

export default async function AthletePage({
  params,
}: {
  params: { slug: string };
}) {
  const athlete = await getAthleteBySlug(params.slug);
  if (!athlete) notFound();

  const sport = getSport(athlete.sport);
  const color = sport?.color ?? "#1E6E8C";
  const backers = supporterCount(athlete.raised_amount);
  const team = athlete.team ? await getTeamBySlug(athlete.team) : null;
  const sponsor = getSponsorForSlug(athlete.slug);

  return (
    <>
      <Header />
      <main>
        {/* ───────── Hero del atleta (color del deporte) ───────── */}
        <section className="relative text-white" style={{ backgroundColor: color }}>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(10,26,47,0.15), rgba(10,26,47,0.55))" }}
            aria-hidden
          />
          <div className="relative mx-auto flex max-w-container flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16 md:flex-row md:items-end">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-white/30 sm:h-36 sm:w-36">
              {athlete.photo_url ? (
                <Image
                  src={asset(athlete.photo_url)}
                  alt={athlete.full_name}
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Monogram name={athlete.full_name} color={color} className="h-full w-full" />
              )}
            </div>
            <div>
              <p className="eyebrow text-white/80">
                {sport?.label ?? athlete.sport} · {athlete.discipline}
              </p>
              <h1 className="mt-2 font-display text-4xl font-700 uppercase leading-none tracking-tight sm:text-6xl">
                {athlete.full_name}
              </h1>
              <p className="mt-2 text-white/85">
                {athlete.city}, {athlete.province}
              </p>
              {team && (
                <Link
                  href={`/equipo/${team.slug}`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-display text-xs font-600 uppercase tracking-wide text-white transition-colors hover:bg-white/25"
                >
                  ← Parte de {team.name}
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ───────── Sponsor oficial (si tiene) ───────── */}
        {sponsor && (
          <div className="border-b border-line bg-paper">
            <div className="mx-auto flex max-w-container flex-col items-center justify-center gap-2 px-4 py-4 sm:flex-row sm:gap-4 sm:px-6">
              <span className="eyebrow text-steel">
                Sponsor oficial de {athlete.first_name}
              </span>
              <SponsorLogo sponsor={sponsor} />
            </div>
          </div>
        )}

        {/* ───────── Cuerpo ───────── */}
        <section className="bg-ice">
          <div className="mx-auto grid max-w-container gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
            {/* Columna izquierda */}
            <div>
              {/* Fila de stats */}
              <div className="grid grid-cols-3 gap-3">
                {athlete.stats.map(([value, label], i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-line bg-paper p-4 text-center"
                  >
                    <div className="font-display text-2xl font-700 text-ink sm:text-3xl">
                      {value}
                    </div>
                    <div className="eyebrow mt-1 text-steel">{label}</div>
                  </div>
                ))}
              </div>

              {/* Quiénes apoyan (estilo Patreon: la gente, no la meta). */}
              <div className="mt-6 rounded-xl border border-line bg-paper p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-3xl font-700 text-celeste-deep sm:text-4xl">
                      {backers}
                    </div>
                    <div className="eyebrow mt-1 text-steel">personas apoyando</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl font-700 text-ink sm:text-4xl">
                      {formatMoney(athlete.raised_amount)}
                    </div>
                    <div className="eyebrow mt-1 text-steel">recaudados</div>
                  </div>
                </div>
                <div className="mt-4 border-t border-line pt-4">
                  <SupporterStack slug={athlete.slug} count={backers} max={9} />
                </div>
              </div>

              {/* La historia */}
              <Reveal className="mt-8">
                <h2 className="font-display text-2xl font-600 uppercase tracking-wide text-ink">
                  La historia
                </h2>
                <p className="mt-3 leading-relaxed text-steel">{athlete.bio}</p>
              </Reveal>

              {/* Tu aporte financia */}
              <Reveal className="mt-8">
                <h2 className="font-display text-2xl font-600 uppercase tracking-wide text-ink">
                  Tu aporte financia
                </h2>
                <ul className="mt-4 space-y-3">
                  {athlete.fund_items.map(([title, desc], i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-xl border border-line bg-paper p-4"
                    >
                      <span
                        className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                      <div>
                        <div className="font-display font-600 uppercase tracking-wide text-ink">
                          {title}
                        </div>
                        <p className="text-sm text-steel">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* Los que apoyan (muro de hinchas) */}
              <Reveal className="mt-10">
                <SupporterWall
                  slug={athlete.slug}
                  count={backers}
                  label={athlete.first_name}
                />
              </Reveal>
            </div>

            {/* Columna derecha: widget sticky */}
            <aside className="lg:relative">
              <div className="lg:sticky lg:top-24">
                <DonationWidget
                  target={{
                    kind: "athlete",
                    slug: athlete.slug,
                    title: `Apoyá a ${athlete.first_name}`,
                  }}
                />
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
