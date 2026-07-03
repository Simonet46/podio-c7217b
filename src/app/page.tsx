import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AthleteGrid } from "@/components/AthleteGrid";
import { CoverBand } from "@/components/CoverBand";
import { ActivityFeed } from "@/components/ActivityFeed";
import { LiveToast } from "@/components/LiveToast";
import { HomeHero, type HeroAthlete } from "@/components/HomeHero";
import { getAthletes, getOtherAthletes, getTeams, getGlobalStats } from "@/lib/data/athletes";
import { AthleteCard } from "@/components/AthleteCard";
import { getSport } from "@/config/sports";
import { formatMoney } from "@/lib/money";
import { topSupporters, supporterCount } from "@/lib/supporters";
import { PLATFORM_FEE_RATE, DIPLOMA_TIERS } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import Link from "next/link";

export default async function HomePage() {
  const athletes = await getAthletes();
  const otherAthletes = await getOtherAthletes();
  const teams = await getTeams();
  const { athleteCount, totalRaised, supporterTotal } = await getGlobalStats();
  const netPct = Math.round((1 - PLATFORM_FEE_RATE) * 100);
  const feePct = Math.round(PLATFORM_FEE_RATE * 100);

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
      backers: supporterCount(a.raised_amount),
    }));

  const topThree = topSupporters(3);
  const podiumColors = [
    DIPLOMA_TIERS.oro.color,
    DIPLOMA_TIERS.plata.color,
    DIPLOMA_TIERS.bronce.color,
  ];

  // Destinatarios posibles para el feed "en vivo" de aportes.
  const activityTargets = [
    ...athletes.map((a) => ({ label: a.full_name, href: `/atleta/${a.slug}` })),
    ...teams.map((t) => ({ label: t.name, href: `/equipo/${t.slug}` })),
    { label: "todos los atletas", href: "/apoyar-a-todos" },
  ];

  return (
    <>
      <Header />
      <main>
        {/* ───────── Hero inmersivo ───────── */}
        <HomeHero featured={featured} />

        {/* ───────── Franja: stats ───────── */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 sm:px-6">
            <div className="flex flex-wrap gap-8 border-t border-white/10 py-8 sm:gap-12">
              <Stat
                value={supporterTotal.toLocaleString("es-AR")}
                label="Personas apoyando"
              />
              <Stat value={String(athleteCount)} label="Atletas en campaña" />
              <Stat value={formatMoney(totalRaised)} label="Total recaudado" />
              <Stat value="93%" label="Va directo al atleta" />
            </div>
          </div>
        </section>

        {/* ───────── Portada (camino solitario) ───────── */}
        <CoverBand />

        {/* ───────── Grid de atletas ───────── */}
        <section id="atletas" className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            {/* Actividad en vivo */}
            <Reveal className="mb-10">
              <ActivityFeed targets={activityTargets} />
            </Reveal>

            <Reveal>
              <div className="mb-8 text-center">
                <p className="eyebrow text-gold">Más historias</p>
                <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-white sm:text-4xl">
                  Elegí a quién apoyar
                </h2>
              </div>
            </Reveal>
            <AthleteGrid athletes={athletes} teams={teams} />
          </div>
        </section>

        {/* ───────── Otros atletas argentinos ───────── */}
        <section id="otros-atletas" style={{ background: "#0d2238" }} className="text-white">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <div className="mb-2 flex items-center gap-3">
                <span className="ribbon ribbon-tall w-16 rounded-full" aria-hidden />
                <p className="eyebrow text-celeste">De la base a la elite</p>
              </div>
              <h2 className="font-display text-3xl font-700 uppercase tracking-tight text-white sm:text-4xl">
                Otros atletas argentinos
              </h2>
              <p className="mt-2 max-w-2xl text-white/60">
                Acá entra cualquiera que la pelee: un juvenil del barrio, una promesa
                del interior, un amateur que se paga todo. No van a un Juego Olímpico
                mañana, pero merecen la misma chance.
              </p>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherAthletes.map((a, i) => (
                <Reveal key={a.id} delay={(i % 3) * 90} className="h-full">
                  <div className="h-full [&>article]:h-full">
                    <AthleteCard athlete={a} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Apoyá a todos ───────── */}
        <section
          className="relative overflow-hidden border-t border-white/[.06] text-white"
          style={{ background: "linear-gradient(135deg,#0d2238,#0A1A2F)" }}
        >
          <div className="mx-auto max-w-[1100px] px-4 py-20 text-center sm:px-6">
            <Reveal>
              <div
                className="mx-auto mb-7 h-[18px] w-40 rounded-[4px]"
                style={{ background: "linear-gradient(90deg,#0072CE 0 20%,#F4C300 20% 40%,#1A1A1A 40% 60%,#009F3D 60% 80%,#DF0024 80% 100%)" }}
                aria-hidden
              />
              <h2 className="font-display text-4xl font-700 uppercase leading-[.95] tracking-tight sm:text-5xl">
                Apoyá a todo el deporte<br className="hidden sm:block" /> argentino de una
              </h2>
              <p className="mx-auto mt-5 max-w-[560px] text-lg leading-relaxed text-white/70">
                Distribuimos el 93% en partes iguales entre todos los atletas
                registrados. Vos elegís el monto, nosotros lo repartimos automáticamente.
              </p>
              <Link
                href="/apoyar-a-todos"
                className="mt-8 inline-block rounded-md bg-gold px-9 py-4 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
              >
                Sumate al apoyo colectivo
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ───────── Top hinchas (pódium 3D) ───────── */}
        <section className="bg-ice">
          <div className="mx-auto max-w-[1100px] px-4 py-20 sm:px-6">
            <Reveal>
              <div className="mb-16 text-center">
                <p className="eyebrow text-celeste-deep">Los que más empujan</p>
                <h2 className="mt-2 font-display text-4xl font-700 uppercase tracking-tight text-ink sm:text-5xl">
                  Top hinchas del mes
                </h2>
              </div>
            </Reveal>

            <Reveal>
              <div
                className="flex items-end justify-center gap-6"
                style={{ perspective: "1000px" }}
              >
                {/* Plata — 2° puesto */}
                <Podium
                  hincha={topThree[1]}
                  rank={2}
                  barH={150}
                  barStyle="linear-gradient(180deg,#C8D2DC,#A9B6C2)"
                  barShadow="0 18px 40px rgba(0,0,0,.18)"
                  avatarBorder="#B8C2CC"
                  numSize="text-4xl"
                  avatarSize="h-20 w-20"
                  nameSize="text-lg"
                />
                {/* Oro — 1° puesto */}
                <Podium
                  hincha={topThree[0]}
                  rank={1}
                  barH={210}
                  barStyle="linear-gradient(180deg,#E0C04A,#C9A227)"
                  barShadow="0 24px 50px rgba(201,162,39,.35)"
                  avatarBorder="#C9A227"
                  numSize="text-5xl"
                  avatarSize="h-24 w-24"
                  nameSize="text-xl"
                  champion
                />
                {/* Bronce — 3° puesto */}
                <Podium
                  hincha={topThree[2]}
                  rank={3}
                  barH={120}
                  barStyle="linear-gradient(180deg,#D6A179,#C0825A)"
                  barShadow="0 18px 40px rgba(0,0,0,.18)"
                  avatarBorder="#C8956A"
                  numSize="text-3xl"
                  avatarSize="h-20 w-20"
                  nameSize="text-lg"
                />
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-10 text-center">
                <Link
                  href="/hinchas"
                  className="font-display text-sm font-600 uppercase tracking-wide text-celeste-deep hover:underline"
                >
                  Ver ranking completo →
                </Link>
              </div>
            </Reveal>
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
                  body="Buscá por deporte, mirá su historia y su próxima competencia. Cada caso lo revisamos a mano."
                />
              </Reveal>
              <Reveal delay={110}>
                <Step
                  n="02"
                  numColor="text-celeste"
                  title="Apoyá todos los meses"
                  body="Un aporte mensual, como en Patreon. Sin metas ni barras: lo que importa es apoyarlo en el día a día."
                />
              </Reveal>
              <Reveal delay={220}>
                <Step
                  n="03"
                  numColor="text-[#009F3D]"
                  title={`El ${netPct}% va al atleta`}
                  body={`Retenemos solo el ${feePct}% para sostener la plataforma. El resto, directo a quien entrena.`}
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
                    No te vemos como un número
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-white/70">
                    Somos atletas y sabemos lo que cuesta. Por eso revisamos cada
                    postulación a mano, una por una.
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
      <LiveToast targets={activityTargets} />
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

type PodiumHincha = { rank: number; name: string; athletes: number; total: number };

function Podium({
  hincha,
  rank,
  barH,
  barStyle,
  barShadow,
  avatarBorder,
  numSize,
  avatarSize,
  nameSize,
  champion,
}: {
  hincha: PodiumHincha;
  rank: number;
  barH: number;
  barStyle: string;
  barShadow: string;
  avatarBorder: string;
  numSize: string;
  avatarSize: string;
  nameSize: string;
  champion?: boolean;
}) {
  const initial = hincha?.name?.[0] ?? String(rank);
  return (
    <div className={`text-center ${champion ? "w-[200px] sm:w-[220px]" : "w-[160px] sm:w-[200px]"}`}>
      {champion && <p className="eyebrow mb-2 text-gold">Hincha del mes</p>}
      <div
        className={`mx-auto mb-3.5 flex ${avatarSize} items-center justify-center rounded-full font-display font-700 text-white`}
        style={{ border: `3px solid ${avatarBorder}`, background: avatarBorder }}
      >
        {initial}
      </div>
      <div className={`font-display font-600 uppercase text-ink ${nameSize}`}>
        {hincha?.name ?? `Lugar ${rank}`}
      </div>
      <div className="mb-3.5 text-sm text-steel">
        {hincha ? `${hincha.athletes} atletas apoyados` : "—"}
      </div>
      <div
        className={`flex items-start justify-center rounded-t-lg ${champion ? "pt-[18px]" : "pt-3.5"}`}
        style={{
          height: barH,
          background: barStyle,
          transform: "rotateX(8deg)",
          transformOrigin: "bottom",
          boxShadow: barShadow,
        }}
      >
        <span className={`font-display font-700 text-white/85 ${numSize}`}>{rank}</span>
      </div>
    </div>
  );
}
