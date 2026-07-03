import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationWidget } from "@/components/DonationWidget";
import { Monogram } from "@/components/Monogram";
import { Reveal } from "@/components/Reveal";
import { SupporterWall } from "@/components/SupporterWall";
import { SponsorLogo } from "@/components/SponsorLogo";
import { getSponsorForSlug } from "@/lib/data/sponsors";
import { getAthleteBySlug, getAllAthletes, getTeamBySlug, getAthleteUpdates } from "@/lib/data/athletes";
import { AthleteTimeline } from "@/components/AthleteTimeline";
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
    description: `Apoyá a ${athlete.full_name}, ${getSport(athlete.sport)?.label ?? athlete.sport} de ${athlete.city}.`,
  };
}

// Colores para las barras de "Tu aporte financia" (ciclo)
const FUND_COLORS = ["#0072CE", "#009F3D", "#DF0024", "#F4C300"];

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
  const updates = await getAthleteUpdates(athlete.slug);

  const hasCover = Boolean(athlete.photo_secondary_url);
  const hasPortrait = Boolean(athlete.photo_url);

  return (
    <>
      <Header />
      <main className="bg-ink text-white">

        {/* ── Hero ── */}
        <section className="relative">

          {/* Cover foto */}
          <div className="relative h-[260px] overflow-hidden sm:h-[380px] lg:h-[420px]">
            {hasCover ? (
              <Image
                src={asset(athlete.photo_secondary_url!)}
                alt={`${athlete.full_name} en acción`}
                fill
                priority
                className="object-cover object-top"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg,${color}55 0%,#0A1A2F 70%)`,
                }}
              />
            )}
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg,rgba(10,26,47,.1) 0%,transparent 30%,rgba(10,26,47,.55) 70%,rgba(10,26,47,.95) 100%)",
              }}
              aria-hidden
            />
            {/* Cinta vertical 4 colores */}
            <div className="absolute left-0 top-8 flex flex-col" aria-hidden>
              {["#0072CE","#F4C300","#009F3D","#DF0024"].map((c) => (
                <span key={c} className="w-[7px] h-10" style={{ background: c }} />
              ))}
            </div>
            {/* Sponsor badge */}
            {sponsor && (
              <div className="absolute right-5 top-5 hidden sm:flex items-center gap-3 rounded-xl border border-white/[.14] px-4 py-2.5"
                style={{ background: "rgba(8,19,31,.78)", backdropFilter: "blur(8px)" }}>
                <span className="eyebrow text-white/60">Con el apoyo de</span>
                <SponsorLogo sponsor={sponsor} />
              </div>
            )}
            {/* Próxima competencia floating pill */}
            {athlete.next_competition && (
              <div
                className="podio-float absolute bottom-7 right-5 sm:right-9 inline-flex items-center gap-2.5 rounded-full px-4 py-2 shadow-[0_14px_36px_rgba(201,162,39,.4)]"
                style={{ background: "#C9A227" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
                <span className="font-display text-[12px] font-600 uppercase tracking-wide text-ink">
                  Próxima: {athlete.next_competition}
                </span>
              </div>
            )}
          </div>

          {/* Fila de perfil: retrato + nombre + stats */}
          <div className="mx-auto max-w-container px-4 sm:px-6">
            <div className="relative z-10 -mt-12 flex flex-wrap items-end gap-5 sm:-mt-[58px]">
              {/* Retrato superpuesto */}
              <div
                className="h-[110px] w-[110px] shrink-0 overflow-hidden rounded-[14px] border-[3px] border-ink shadow-[0_22px_50px_rgba(0,0,0,.5)] sm:h-[150px] sm:w-[150px] sm:rounded-[16px]"
              >
                {hasPortrait ? (
                  <Image
                    src={asset(athlete.photo_url!)}
                    alt={athlete.full_name}
                    width={150}
                    height={150}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Monogram name={athlete.full_name} color={color} className="h-full w-full" />
                )}
              </div>

              {/* Nombre + deporte */}
              <div className="flex-1 pb-2 min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2.5">
                  <span
                    className="font-display text-[11px] font-600 uppercase tracking-[.12em] text-white rounded-[3px] px-3 py-[5px]"
                    style={{ background: color }}
                  >
                    {sport?.label ?? athlete.sport}
                  </span>
                  <span className="text-[14px] text-white/62">
                    {athlete.city}, {athlete.province}
                  </span>
                  {team && (
                    <Link
                      href={`/equipo/${team.slug}`}
                      className="font-display text-[11px] font-600 uppercase tracking-wide text-white/60 hover:text-white transition"
                    >
                      ← {team.name}
                    </Link>
                  )}
                </div>
                <h1 className="font-display text-4xl font-700 uppercase leading-[.9] tracking-tight sm:text-[56px] lg:text-[62px]">
                  {athlete.full_name}
                </h1>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex gap-7 pb-3.5">
                <div className="text-right">
                  <div className="font-display text-[32px] font-700 leading-none sm:text-[34px]">
                    {backers}
                  </div>
                  <div className="text-[12px] text-white/55">la apoyan</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-[32px] font-700 leading-none text-gold sm:text-[34px]">
                    {formatMoney(athlete.raised_amount)}
                  </div>
                  <div className="text-[12px] text-white/55">recaudados</div>
                </div>
              </div>
            </div>

            {/* Stats mobile */}
            <div className="mt-4 flex gap-6 sm:hidden">
              <div>
                <div className="font-display text-2xl font-700 text-white">{backers}</div>
                <div className="text-[12px] text-white/55">la apoyan</div>
              </div>
              <div>
                <div className="font-display text-2xl font-700 text-gold">{formatMoney(athlete.raised_amount)}</div>
                <div className="text-[12px] text-white/55">recaudados</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cuerpo: 2 columnas ── */}
        <section className="mx-auto max-w-container px-4 pb-20 pt-12 sm:px-6 lg:pt-14">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">

            {/* ── Columna izquierda ── */}
            <div className="min-w-0 space-y-14">

              {/* La historia */}
              <Reveal>
                <p className="eyebrow mb-3 text-gold">La historia</p>
                {athlete.stats.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {athlete.stats.map(([val, lbl], i) => (
                      <span
                        key={i}
                        className="rounded-md border border-white/[.1] px-3 py-1.5 text-center"
                        style={{ background: "#0d2238" }}
                      >
                        <span className="block font-display text-xl font-700 leading-none text-white">
                          {val}
                        </span>
                        <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-white/55">
                          {lbl}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
                <p className="max-w-[620px] text-[17px] leading-[1.7] text-white/74">
                  {athlete.bio}
                </p>
              </Reveal>

              {/* Foto secundaria inline (si existe y hay cover también, acá va en acción) */}
              {hasCover && athlete.photo_url && athlete.photo_secondary_url && (
                <Reveal>
                  <div className="overflow-hidden rounded-2xl border border-white/[.07] shadow-[0_30px_70px_rgba(0,0,0,.5)]">
                    <Image
                      src={asset(athlete.photo_secondary_url)}
                      alt={`${athlete.first_name} en acción`}
                      width={1200}
                      height={600}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </Reveal>
              )}

              {/* El camino: novedades del atleta (moderadas) */}
              {updates.length > 0 && (
                <Reveal>
                  <AthleteTimeline updates={updates} firstName={athlete.first_name} />
                </Reveal>
              )}

              {/* Tu aporte financia */}
              {athlete.fund_items.length > 0 && (
                <Reveal>
                  <p className="eyebrow mb-3 text-gold">A dónde va tu plata</p>
                  <h2 className="mb-6 font-display text-[28px] font-700 uppercase leading-none sm:text-[32px]">
                    Tu aporte financia
                  </h2>
                  <div className="max-w-[620px] space-y-3">
                    {athlete.fund_items.map(([title, desc], i) => {
                      const c = FUND_COLORS[i % FUND_COLORS.length];
                      return (
                        <div
                          key={i}
                          className="rounded-[10px] border border-white/[.07] px-5 py-[18px]"
                          style={{ background: "#0d2238", borderLeft: `3px solid ${c}` }}
                        >
                          <div className="font-display text-[18px] font-600 uppercase text-white">
                            {title}
                          </div>
                          <p className="mt-2 text-[13px] leading-relaxed text-white/60">{desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </Reveal>
              )}

              {/* Muro de hinchas */}
              <Reveal>
                <SupporterWall
                  slug={athlete.slug}
                  count={backers}
                  label={athlete.first_name}
                  dark
                />
              </Reveal>
            </div>

            {/* ── Columna derecha: widget sticky ── */}
            <aside className="lg:sticky lg:top-24">
              <DonationWidget
                target={{
                  kind: "athlete",
                  slug: athlete.slug,
                  title: `Apoyá a ${athlete.first_name}`,
                }}
              />

              {/* Nota de confianza */}
              <div
                className="mt-4 flex items-start gap-3 rounded-xl border border-white/[.07] p-4"
                style={{ background: "#0d2238" }}
              >
                <span className="mt-0.5 shrink-0 text-[22px]">🤝</span>
                <p className="text-[13px] leading-relaxed text-white/70">
                  El caso de {athlete.first_name} fue{" "}
                  <strong className="text-white">revisado a mano</strong> por los fundadores
                  de GRANITO, atletas como ellos.
                </p>
              </div>

              {/* Stats mobile — widget también los muestra */}
              {athlete.next_competition && (
                <div
                  className="mt-4 flex items-center gap-3 rounded-xl border border-white/[.07] p-4 lg:hidden"
                  style={{ background: "#0d2238" }}
                >
                  <span className="shrink-0 text-xl">📅</span>
                  <div>
                    <p className="eyebrow text-gold">Próxima competencia</p>
                    <p className="mt-0.5 text-sm text-white/80">{athlete.next_competition}</p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
