import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationWidget } from "@/components/DonationWidget";
import { Monogram } from "@/components/Monogram";
import { Reveal } from "@/components/Reveal";
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
    description: `Apoyá al ${team.name} o a sus jugadores directo, sin intermediarios.`,
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
                  {/* Escudo + sport badge */}
                  <div className="mb-5 flex items-center gap-4">
                    <div
                      className="flex h-[62px] w-[62px] flex-none items-center justify-center overflow-hidden rounded-xl"
                      style={{
                        border: "2px solid rgba(255,255,255,.16)",
                        background: color,
                      }}
                    >
                      <span className="font-display text-2xl font-700 text-white">
                        {team.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span
                      className="inline-block rounded-[3px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[.12em] text-white"
                      style={{ background: color }}
                    >
                      {sport?.label ?? team.sport}
                    </span>
                  </div>

                  <h1 className="font-display text-[48px] font-700 uppercase leading-[.9] tracking-tight lg:text-[60px]">
                    {team.name}
                  </h1>
                  <p className="mt-4 max-w-[440px] text-[17px] leading-relaxed text-white/74">
                    {team.bio}
                  </p>

                  {/* Stats */}
                  <div className="mt-7 flex gap-9">
                    <div>
                      <div className="font-display text-[38px] font-700 leading-none">
                        {members.length}
                      </div>
                      <div className="mt-0.5 text-[13px] text-white/55">jugadores</div>
                    </div>
                    <div>
                      <div className="font-display text-[38px] font-700 leading-none">
                        {backers.toLocaleString("es-AR")}
                      </div>
                      <div className="mt-0.5 text-[13px] text-white/55">los apoyan</div>
                    </div>
                    <div>
                      <div className="font-display text-[38px] font-700 leading-none text-gold">
                        {formatMoney(team.raised_amount)}
                      </div>
                      <div className="mt-0.5 text-[13px] text-white/55">por mes</div>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href="#apoyar"
                      className="rounded-md bg-gold px-7 py-4 font-display text-base font-700 uppercase tracking-[.04em] text-ink transition-transform hover:-translate-y-0.5"
                    >
                      Apoyar al equipo
                    </a>
                    <a
                      href="#plantel"
                      className="rounded-md border border-white/25 px-7 py-4 font-display text-base font-500 uppercase tracking-[.04em] text-white transition-all hover:border-white hover:-translate-y-0.5"
                    >
                      Elegir un jugador
                    </a>
                  </div>
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
                  {/* Gradiente izq → transparente */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg,#0d2238 0%,rgba(13,34,56,.3) 30%,transparent 60%)",
                    }}
                    aria-hidden
                  />
                  {/* Franjas verticales de 4 colores */}
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

        {/* ── Reparto explainer ── */}
        <section className="mx-auto max-w-[1440px] px-6 pt-5">
          <Reveal>
            <div
              className="flex items-center gap-4 rounded-[14px] p-5 sm:p-6"
              style={{
                background: "linear-gradient(135deg,#102a44,#0b1f34)",
                border: "1px solid rgba(201,162,39,.22)",
              }}
            >
              <div
                className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full text-[22px]"
                style={{ background: "rgba(201,162,39,.16)" }}
              >
                ⚖️
              </div>
              <div>
                <div className="font-display text-[16px] font-600 uppercase sm:text-[18px]">
                  Apoyás al equipo entero — lo reparten entre los jugadores inscriptos
                </div>
                <p className="mt-0.5 text-[14px] leading-[1.55] text-white/65">
                  Tu aporte se divide en partes iguales entre todo el plantel.
                  ¿Preferís apoyar a alguien puntual? Elegí su tarjeta abajo.
                  El 93% siempre va a los jugadores.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Widget de aporte ── */}
        <section id="apoyar" className="mx-auto max-w-[680px] px-6 py-10">
          <DonationWidget
            target={{
              kind: "team",
              slug: team.slug,
              title: `Apoyá a ${team.name}`,
              splitCount: members.length,
            }}
          />
          <p className="mt-3 text-center text-xs text-white/45">
            Tu aporte se reparte en partes iguales entre los {members.length} jugadores de la campaña.
          </p>
        </section>

        {/* ── Plantel ── */}
        <section
          id="plantel"
          className="mx-auto max-w-[1440px] px-6 pb-20 pt-4"
        >
          <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="eyebrow mb-2.5 text-gold">El plantel</div>
              <h2 className="font-display text-[40px] font-700 uppercase leading-[.95] tracking-tight">
                {members.length} que dejan todo
              </h2>
            </div>
            <span className="text-[14px] text-white/50">
              Tocá una tarjeta para apoyar a ese jugador
            </span>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {members.map((m, i) => {
              const msupport = supporterCount(m.raised_amount);
              return (
                <Reveal key={m.id} delay={(i % 4) * 60}>
                  <Link
                    href={`/atleta/${m.slug}`}
                    className="group block overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-1"
                    style={{
                      background: "#0d2238",
                      border: "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    {/* Foto */}
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
                        <Monogram
                          name={m.full_name}
                          color={color}
                          className="h-full w-full"
                        />
                      )}
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg,transparent 42%,rgba(13,34,56,.96))",
                        }}
                        aria-hidden
                      />
                      {/* Número de camiseta / índice */}
                      <div
                        className="absolute left-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-[7px] font-display text-[15px] font-700 text-gold"
                        style={{
                          background: "rgba(8,19,31,.7)",
                          backdropFilter: "blur(4px)",
                          border: "1px solid rgba(255,255,255,.18)",
                        }}
                      >
                        {i + 1}
                      </div>
                      {/* Nombre + posición */}
                      <div className="absolute bottom-3 left-3.5 right-3.5">
                        <div className="font-display text-[17px] font-600 uppercase leading-none sm:text-[19px]">
                          {m.full_name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-white/65">{m.role}</div>
                      </div>
                    </div>

                    {/* Footer: supporters + CTA */}
                    <div className="flex items-center justify-between px-3.5 py-3">
                      <span className="text-[12px] text-white/55">
                        <strong className="font-display text-[15px] font-600 text-white">
                          {msupport}
                        </strong>{" "}
                        apoyando
                      </span>
                      <span className="font-display text-[12px] font-600 uppercase tracking-[.04em] text-gold">
                        Apoyar →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
