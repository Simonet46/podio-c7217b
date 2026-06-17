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
import { getTeams, getTeamBySlug, getTeamMembers } from "@/lib/data/athletes";
import { getSport } from "@/config/sports";
import { asset, SITE } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { supporterCount } from "@/lib/supporters";

export async function generateStaticParams() {
  const teams = await getTeams();
  return teams.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const team = await getTeamBySlug(params.slug);
  if (!team) return { title: SITE.brand };
  return {
    title: `${team.name} — ${SITE.brand}`,
    description: `Bancá al ${team.name} o a sus jugadores, rumbo al Mundial.`,
  };
}

export default async function TeamPage({
  params,
}: {
  params: { slug: string };
}) {
  const team = await getTeamBySlug(params.slug);
  if (!team) notFound();

  const sport = getSport(team.sport);
  const color = sport?.color ?? "#1B7A4B";
  const backers = supporterCount(team.raised_amount);
  const members = await getTeamMembers(team);

  return (
    <>
      <Header />
      <main>
        {/* Hero del equipo */}
        <section className="relative text-white" style={{ backgroundColor: color }}>
          {team.photo_url && (
            <Image
              src={asset(team.photo_url)}
              alt={team.name}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35"
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(10,26,47,0.35), rgba(10,26,47,0.7))" }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-container px-4 py-14 sm:px-6 sm:py-20">
            <p className="eyebrow text-white/85">
              {sport?.label ?? team.sport} · {team.discipline}
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-700 uppercase leading-[1.02] tracking-tight sm:text-6xl">
              {team.name}
            </h1>
            <p className="mt-2 text-white/85">Rumbo al Mundial · {team.province}</p>
          </div>
        </section>

        {/* Cuerpo */}
        <section className="bg-ice">
          <div className="mx-auto grid max-w-container gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
            <div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {team.stats.map(([value, label], i) => (
                  <div key={i} className="rounded-xl border border-line bg-paper p-4 text-center">
                    <div className="font-display text-2xl font-700 text-ink sm:text-3xl">
                      {value}
                    </div>
                    <div className="eyebrow mt-1 text-steel">{label}</div>
                  </div>
                ))}
              </div>

              {/* Quiénes bancan al equipo */}
              <div className="mt-6 rounded-xl border border-line bg-paper p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-3xl font-700 text-celeste-deep sm:text-4xl">
                      {backers}
                    </div>
                    <div className="eyebrow mt-1 text-steel">personas bancando</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl font-700 text-ink sm:text-4xl">
                      {formatMoney(team.raised_amount)}
                    </div>
                    <div className="eyebrow mt-1 text-steel">recaudados</div>
                  </div>
                </div>
                <div className="mt-4 border-t border-line pt-4">
                  <SupporterStack slug={team.slug} count={backers} max={9} />
                </div>
              </div>

              {/* Historia */}
              <Reveal className="mt-8">
                <h2 className="font-display text-2xl font-600 uppercase tracking-wide text-ink">
                  La historia
                </h2>
                <p className="mt-3 leading-relaxed text-steel">{team.bio}</p>
              </Reveal>

              {/* Roster: jugadores individuales */}
              <Reveal className="mt-8">
                <h2 className="font-display text-2xl font-600 uppercase tracking-wide text-ink">
                  O bancá a un jugador
                </h2>
                <p className="mt-1 text-sm text-steel">
                  Cada jugador tiene su propia campaña. Elegí a quién bancar.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {members.map((m) => {
                    return (
                      <div
                        key={m.id}
                        className="flex gap-3 rounded-xl border border-line bg-paper p-3"
                      >
                        <Link
                          href={`/atleta/${m.slug}`}
                          className="h-16 w-16 shrink-0 overflow-hidden rounded-lg"
                          aria-label={`Ver a ${m.full_name}`}
                        >
                          {m.photo_url ? (
                            <Image
                              src={asset(m.photo_url)}
                              alt={m.full_name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Monogram name={m.full_name} color={color} className="h-full w-full" />
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/atleta/${m.slug}`}
                            className="font-display font-600 leading-tight text-ink hover:text-celeste-deep"
                          >
                            {m.full_name}
                          </Link>
                          <p className="text-xs text-steel">{m.role}</p>
                          <div className="mt-1.5 font-display text-xs text-steel">
                            <span className="font-700 text-celeste-deep">
                              {supporterCount(m.raised_amount)}
                            </span>{" "}
                            bancando ·{" "}
                            <span className="text-ink">{formatMoney(m.raised_amount)}</span>
                          </div>
                          <Link
                            href={`/atleta/${m.slug}`}
                            className="mt-1 inline-block font-display text-xs font-600 uppercase tracking-wide text-celeste-deep hover:underline"
                          >
                            Bancar a {m.first_name}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Reveal>

              {/* Tu aporte financia */}
              <Reveal className="mt-8">
                <h2 className="font-display text-2xl font-600 uppercase tracking-wide text-ink">
                  Tu aporte financia
                </h2>
                <ul className="mt-4 space-y-3">
                  {team.fund_items.map(([title, desc], i) => (
                    <li key={i} className="flex gap-3 rounded-xl border border-line bg-paper p-4">
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

              {/* Los que bancan al equipo */}
              <Reveal className="mt-10">
                <SupporterWall slug={team.slug} count={backers} label="todo el equipo" />
              </Reveal>
            </div>

            {/* Widget: bancar a todo el equipo (reparto entre jugadores) */}
            <aside className="lg:relative">
              <div className="lg:sticky lg:top-24">
                <DonationWidget
                  target={{
                    kind: "team",
                    slug: team.slug,
                    title: "Bancá a todo el equipo",
                    splitCount: members.length,
                  }}
                />
                <p className="mt-3 px-1 text-center text-xs text-steel">
                  Tu aporte se reparte en partes iguales entre los {members.length}{" "}
                  jugadores de la campaña.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
