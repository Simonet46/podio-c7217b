import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AthleteGrid } from "@/components/AthleteGrid";
import { CoverBand } from "@/components/CoverBand";
import { HomeHero, type HeroAthlete } from "@/components/HomeHero";
import { getAthletes, getTeams, getAllAthletes, getGlobalStats } from "@/lib/data/athletes";
import { getTeamCampaigns } from "@/lib/data/campaigns";
import { TeamCampaignCard } from "@/components/TeamCampaignCard";
import { getSport } from "@/config/sports";
import { formatMoney } from "@/lib/money";
import { asset, SITE } from "@/config/site";
import { Reveal } from "@/components/Reveal";

export default async function HomePage() {
  const athletes = await getAthletes();
  const allTeams = await getTeams();
  const allAth = await getAllAthletes();
  // En el home solo mostramos selecciones que ya tienen jugadores en GRANITO
  // (las vacías existen y son accesibles, pero no ensucian la portada).
  const teams = allTeams.filter((t) => allAth.some((a) => a.team === t.slug));
  const campaigns = await getTeamCampaigns();
  const { athleteCount, sportCount, totalRaised } = await getGlobalStats();

  // Atletas destacados del hero: los 3 con más recaudado (con foto si tienen).
  const featured: HeroAthlete[] = [...athletes]
    .sort((a, b) => b.raised_amount - a.raised_amount)
    .slice(0, 6)
    .map((a) => ({
      slug: a.slug,
      name: a.full_name,
      firstName: a.first_name,
      sportLabel: getSport(a.sport)?.label ?? a.sport,
      color: getSport(a.sport)?.color ?? "#1E6E8C",
      location: `${a.city}, ${a.province}`,
      nextCompetition: a.next_competition ?? null,
      photo: a.photo_url,
    }));

  return (
    <>
      <Header />
      <main>
        {/* ───────── Hero inmersivo ───────── */}
        <HomeHero featured={featured} />

        {/* ───────── Franja: stats reales ───────── */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 sm:px-6">
            <div className="flex flex-wrap gap-8 border-t border-white/10 py-8 sm:gap-12">
              <Stat value={String(athleteCount)} label="Atletas en campaña" />
              <Stat value={String(sportCount)} label={sportCount === 1 ? "Deporte" : "Deportes"} />
              <Stat value={formatMoney(totalRaised)} label="Aportado a la fecha" />
              <Stat value="1" label="Empresas impulsoras" />
            </div>
          </div>
        </section>

        {/* ───────── Portada (camino solitario) ───────── */}
        <CoverBand />

        {/* ───────── Grid de atletas ───────── */}
        <section id="atletas" className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <div className="mb-8 text-center">
                <p className="eyebrow text-gold">Cada uno, una historia</p>
                <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-white sm:text-4xl">
                  Conocé a los atletas
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/60">
                  Entrá en su día a día, seguí su carrera y elegí a quién acompañar.
                </p>
              </div>
            </Reveal>
            <AthleteGrid athletes={athletes} teams={teams} />
          </div>
        </section>

        {/* ───────── Equipos en campaña (crowdfunding de misiones) ───────── */}
        {campaigns.length > 0 && (
          <section id="equipos" className="bg-ink text-white">
            <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
              <Reveal>
                <div className="mb-3 text-center">
                  <p className="eyebrow text-celeste">Una misión concreta</p>
                  <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-white sm:text-4xl">
                    Equipos en campaña
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-white/60">
                    Equipos que necesitan llegar a un torneo, viajar o equiparse.
                    Comprometé tu aporte hoy:{" "}
                    <strong className="text-white/80">
                      no se te cobra nada ahora
                    </strong>
                    . El aporte se hace efectivo recién cuando la campaña termina
                    y GRANITO la valida.
                  </p>
                </div>
              </Reveal>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((c, i) => (
                  <Reveal key={c.id} delay={i * 90}>
                    <TeamCampaignCard campaign={c} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ───────── Cómo funciona ───────── */}
        <section id="como-funciona" className="bg-ink text-white">
          <div className="mx-auto max-w-[1180px] px-4 py-20 sm:px-6">
            <Reveal>
              <div className="mb-14 text-center">
                <p className="eyebrow text-gold">Sin vueltas</p>
                <h2 className="mt-2 font-display text-4xl font-700 uppercase tracking-tight sm:text-5xl">
                  Cómo funciona
                </h2>
              </div>
            </Reveal>
            <div className="mb-16 grid gap-6 md:grid-cols-3">
              <Reveal delay={0}>
                <Step
                  n="01"
                  numColor="text-gold"
                  title="Elegí un atleta"
                  body="Buscá por deporte, mirá su historia y su próxima competencia. Cada atleta fue revisado y aprobado por nosotros."
                />
              </Reveal>
              <Reveal delay={110}>
                <Step
                  n="02"
                  numColor="text-celeste"
                  title="Aportá tu granito o apoyá todos los meses"
                  body="Un solo aporte o un aporte mensual. Sin metas ni barras: lo que importa es apoyarlo en el día a día."
                />
              </Reveal>
              <Reveal delay={220}>
                <Step
                  n="03"
                  numColor="text-[#009F3D]"
                  title="Directo al atleta"
                  body="El aporte no pasa por ninguna federación, comité olímpico o confederación. Va directo a la cuenta de Mercado Pago o PayPal."
                />
              </Reveal>
            </div>

            {/* Fundadores */}
            <Reveal>
              <div
                className="flex flex-col gap-10 rounded-2xl border border-gold/25 p-10 md:flex-row md:items-center"
                style={{ background: "linear-gradient(135deg,#0d2238,#0A1A2F)" }}
              >
                <div className="flex-1">
                  <p className="eyebrow text-gold">Fundada por atletas</p>
                  <h3 className="mt-3 font-display text-3xl font-700 uppercase leading-none">
                    De atletas para atletas.
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-white/70">
                    Somos atletas olímpicos y sabemos lo que cuesta. Por eso
                    revisamos cada postulación a mano, una por una. Nuestra misión
                    es tener una plataforma segura para los atletas y para quienes
                    quieran apoyarlos.
                  </p>
                </div>
                <div className="flex gap-7">
                  <Founder name="Diego Simonet" sport="Handball" />
                  <Founder name="Pablo Simonet" sport="Handball" />
                  <Founder name="Pilar Campoy" sport="Hockey" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── Empresas impulsoras ───────── */}
        <section id="empresas-impulsoras" style={{ background: "#f5f8fb" }}>
          <div className="mx-auto max-w-[1180px] px-4 py-20 sm:px-6">
            <Reveal>
              <div className="mb-12 text-center">
                <p className="eyebrow text-gold">Empresas impulsoras</p>
                <h2 className="mt-2 font-display text-4xl font-700 uppercase tracking-tight text-ink sm:text-5xl">
                  Marcas que juegan de local
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-ink/60">
                  Empresas que ponen el hombro para que los atletas argentinos
                  lleguen más lejos. Con el apoyo de las marcas, cada granito pesa
                  más.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Impulsora fundadora: DS Connect */}
              <Reveal>
                <div className="flex h-full flex-col rounded-2xl border border-gold/40 bg-white p-8 shadow-[0_10px_40px_rgba(10,26,47,.08)]">
                  <span className="self-start rounded-full bg-gold/15 px-3 py-1 font-display text-[11px] font-700 uppercase tracking-wide text-[#8a6e15]">
                    Impulsora fundadora
                  </span>
                  <div className="my-9 flex flex-1 items-center justify-center">
                    <Image
                      src={asset("/logos/ds-connect.png")}
                      alt="DS Connect"
                      width={300}
                      height={130}
                      className="h-auto w-[230px] object-contain"
                    />
                  </div>
                  <p className="text-[15px] leading-relaxed text-ink/70">
                    La primera empresa que impulsa al deporte argentino con{" "}
                    {SITE.brand}.
                  </p>
                </div>
              </Reveal>

              {/* Casilleros libres: "Tu marca acá" */}
              {[0, 1].map((i) => (
                <Reveal key={i} delay={(i + 1) * 100}>
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 p-8 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-ink/20 font-display text-2xl text-ink/30">
                      +
                    </div>
                    <p className="font-display text-lg font-700 uppercase tracking-wide text-ink/50">
                      Tu marca acá
                    </p>
                    <p className="mt-1.5 text-[13px] text-ink/40">Lugar disponible</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Cierre + CTA */}
            <Reveal>
              <div className="mt-12 flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
                <p className="font-display text-xl font-600 uppercase leading-tight text-ink sm:text-2xl">
                  El próximo lugar puede ser el de tu marca.
                </p>
                <Link
                  href="/empresas"
                  className="shrink-0 rounded-md bg-gold px-7 py-3.5 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
                >
                  Quiero impulsar el deporte
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-700 tabular-nums text-gold sm:text-4xl">
        {value}
      </div>
      <div className="eyebrow mt-1 text-white/55">{label}</div>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  numColor = "text-gold",
}: {
  n: string;
  title: string;
  body: string;
  numColor?: string;
}) {
  return (
    <div
      className="rounded-[10px] border border-white/10 p-8"
      style={{ background: "#0d2238" }}
    >
      <div className={`font-display text-[40px] font-700 leading-none ${numColor}`}>{n}</div>
      <h3 className="mt-3.5 font-display text-xl font-600 uppercase text-white">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-white/65">{body}</p>
    </div>
  );
}

function Founder({ name, sport }: { name: string; sport: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="text-center">
      <div className="mx-auto mb-2.5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-ink font-display text-xl font-700 text-white">
        {initials}
      </div>
      <div className="font-display text-[15px] font-600 uppercase leading-none text-white">
        {name}
      </div>
      <div className="mt-1 text-[12px] text-white/55">{sport}</div>
    </div>
  );
}
