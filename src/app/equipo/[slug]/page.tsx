import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Monogram } from "@/components/Monogram";
import { Reveal } from "@/components/Reveal";
import { getTeams, getTeamBySlug, getTeamMembers } from "@/lib/data/athletes";
import { SEED_TEAMS } from "@/lib/data/teams";
import { getSport } from "@/config/sports";
import { asset, SITE } from "@/config/site";
import { formatMoney } from "@/lib/money";

export async function generateStaticParams() {
  const teams = await getTeams();
  if (teams.length > 0) return teams.map((t) => ({ slug: t.slug }));
  return SEED_TEAMS.map((t) => ({ slug: t.slug }));
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
    description: `Apoyá a los jugadores de ${team.name}, la ${team.discipline}. Tu aporte va directo a cada uno.`,
  };
}

export default async function TeamPage({
  params,
}: {
  params: { slug: string };
}) {
  const team = await getTeamBySlug(params.slug);
  if (!team || !team.verified) notFound();

  const sport = getSport(team.sport);
  const color = team.color ?? sport?.color ?? "#1B7A4B";
  const members = await getTeamMembers(team);

  return (
    <>
      <Header />
      <main className="overflow-x-hidden bg-ink text-white">

        {/* ── Hero card ── */}
        <section className="mx-auto max-w-[1440px] px-6 pb-0 pt-10">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-[18px]"
              style={{
                background: "#0d2238",
                border: "1px solid rgba(255,255,255,.08)",
                boxShadow: "0 40px 90px rgba(0,0,0,.55)",
              }}
            >
              <div className="grid lg:grid-cols-[1.1fr_.9fr]">
                {/* Izquierda: info */}
                <div className="relative z-[2] p-10 lg:p-12">
                  <div className="mb-5 flex items-center gap-4">
                    <div
                      className="flex h-[62px] w-[62px] flex-none items-center justify-center overflow-hidden rounded-xl"
                      style={{ border: "2px solid rgba(255,255,255,.16)", background: color }}
                    >
                      <span className="font-display text-2xl font-700 text-white">
                        {team.name.replace(/^(Los|Las|La|El)\s/i, "").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[11px] font-600 uppercase tracking-[.1em] text-white"
                      style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)" }}
                    >
                      🇦🇷 Selección Argentina
                    </span>
                  </div>

                  <h1 className="font-display text-[48px] font-700 uppercase leading-[.9] tracking-tight lg:text-[60px]">
                    {team.name}
                  </h1>
                  <p className="mt-2 font-display text-[14px] font-600 uppercase tracking-[.06em]" style={{ color }}>
                    {team.discipline}
                  </p>
                  <p className="mt-4 max-w-[440px] text-[17px] leading-relaxed text-white/74">
                    {team.bio}
                  </p>

                  {/* Stats reales */}
                  <div className="mt-7 flex gap-9">
                    <div>
                      <div className="font-display text-[38px] font-700 leading-none">
                        {members.length}
                      </div>
                      <div className="mt-0.5 text-[13px] text-white/55">
                        {members.length === 1 ? "jugador en GRANITO" : "jugadores en GRANITO"}
                      </div>
                    </div>
                    {team.raised_amount > 0 && (
                      <div>
                        <div className="font-display text-[38px] font-700 leading-none text-gold">
                          {formatMoney(team.raised_amount)}
                        </div>
                        <div className="mt-0.5 text-[13px] text-white/55">recaudado entre todos</div>
                      </div>
                    )}
                  </div>

                  {members.length > 0 && (
                    <div className="mt-7">
                      <a
                        href="#plantel"
                        className="inline-block rounded-md bg-gold px-7 py-4 font-display text-base font-700 uppercase tracking-[.04em] text-ink transition-transform hover:-translate-y-0.5"
                      >
                        Elegí a quién bancar
                      </a>
                    </div>
                  )}
                </div>

                {/* Derecha: foto del equipo */}
                <div className="relative min-h-[320px]">
                  {team.photo_url ? (
                    <Image
                      src={asset(team.photo_url)}
                      alt={team.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ background: color, opacity: 0.4 }} />
                  )}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "linear-gradient(90deg,#0d2238 0%,rgba(13,34,56,.3) 30%,transparent 60%)" }}
                    aria-hidden
                  />
                  <div className="absolute left-0 top-[34px] flex flex-col" aria-hidden>
                    <span className="h-[38px] w-[7px]" style={{ background: "#0072CE" }} />
                    <span className="h-[38px] w-[7px]" style={{ background: "#F4C300" }} />
                    <span className="h-[38px] w-[7px]" style={{ background: "#009F3D" }} />
                    <span className="h-[38px] w-[7px]" style={{ background: "#DF0024" }} />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Cómo se apoya (honesto) ── */}
        <section className="mx-auto max-w-[1440px] px-6 pt-5">
          <Reveal>
            <div
              className="flex items-center gap-4 rounded-[14px] p-5 sm:p-6"
              style={{ background: "linear-gradient(135deg,#102a44,#0b1f34)", border: "1px solid rgba(201,162,39,.22)" }}
            >
              <div
                className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full text-[22px]"
                style={{ background: "rgba(201,162,39,.16)" }}
              >
                🎯
              </div>
              <div>
                <div className="font-display text-[16px] font-600 uppercase sm:text-[18px]">
                  Bancás directo a los jugadores
                </div>
                <p className="mt-0.5 text-[14px] leading-[1.55] text-white/65">
                  Elegí a cualquiera del plantel y tu aporte llega directo a su Mercado Pago —
                  el 93% es para el jugador. Apoyar a varios es apoyar a la selección.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Plantel ── */}
        <section id="plantel" className="mx-auto max-w-[1440px] px-6 pb-20 pt-8">
          {members.length === 0 ? (
            <Reveal>
              <div
                className="rounded-[16px] p-10 text-center"
                style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}
              >
                <div className="mb-3 text-[38px]">🇦🇷</div>
                <h2 className="font-display text-[26px] font-700 uppercase leading-tight">
                  Todavía no hay jugadores de {team.name} en GRANITO
                </h2>
                <p className="mx-auto mt-3 max-w-[480px] text-[15px] leading-relaxed text-white/60">
                  Estamos sumando a los primeros. Si sos jugador/a de la selección o conocés a
                  alguien, la postulación está abierta.
                </p>
                <Link
                  href="/para-atletas"
                  className="mt-6 inline-block rounded-md bg-gold px-7 py-3.5 font-display text-[15px] font-700 uppercase tracking-wide text-ink"
                >
                  Postulate
                </Link>
              </div>
            </Reveal>
          ) : (
            <>
              <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="eyebrow mb-2.5 text-gold">El plantel en GRANITO</div>
                  <h2 className="font-display text-[40px] font-700 uppercase leading-[.95] tracking-tight">
                    {members.length === 1 ? "Su jugador" : `Los ${members.length} que podés bancar`}
                  </h2>
                </div>
                <span className="text-[14px] text-white/50">
                  Tocá una tarjeta para apoyar a ese jugador
                </span>
              </Reveal>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {members.map((m, i) => (
                  <Reveal key={m.id} delay={(i % 4) * 60}>
                    <Link
                      href={`/atleta/${m.slug}`}
                      className="group block overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-1"
                      style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.06)" }}
                    >
                      <div className="relative h-[200px] sm:h-[230px]">
                        {m.photo_url ? (
                          <Image
                            src={asset(m.photo_url)}
                            alt={m.full_name}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <Monogram name={m.full_name} color={color} className="h-full w-full" />
                        )}
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{ background: "linear-gradient(180deg,transparent 42%,rgba(13,34,56,.96))" }}
                          aria-hidden
                        />
                        <div className="absolute bottom-3 left-3.5 right-3.5">
                          <div className="font-display text-[17px] font-600 uppercase leading-none sm:text-[19px]">
                            {m.full_name}
                          </div>
                          {m.role && <div className="mt-0.5 text-[11px] text-white/65">{m.role}</div>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-3.5 py-3">
                        <span className="text-[12px] text-white/55">
                          <strong className="font-display text-[14px] font-600 text-gold">
                            {formatMoney(m.raised_amount)}
                          </strong>{" "}
                          aportados
                        </span>
                        <span className="font-display text-[12px] font-600 uppercase tracking-[.04em] text-gold">
                          Apoyar →
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </section>

      </main>
      <Footer />
    </>
  );
}
