import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AthleteGrid } from "@/components/AthleteGrid";
import { CoverBand } from "@/components/CoverBand";
import { HomeHero, type HeroAthlete } from "@/components/HomeHero";
import { getAthletes, getTeams, getAllAthletes, getGlobalStats } from "@/lib/data/athletes";
import { getSport } from "@/config/sports";
import { formatMoney } from "@/lib/money";
import { Reveal } from "@/components/Reveal";

export default async function HomePage() {
  const athletes = await getAthletes();
  const allTeams = await getTeams();
  const allAth = await getAllAthletes();
  // En el home solo mostramos selecciones que ya tienen jugadores en GRANITO
  // (las vacías existen y son accesibles, pero no ensucian la portada).
  const teams = allTeams.filter((t) => allAth.some((a) => a.team === t.slug));
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
