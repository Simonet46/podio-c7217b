import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AthleteGrid } from "@/components/AthleteGrid";
import { CoverBand } from "@/components/CoverBand";
import { ActivityFeed } from "@/components/ActivityFeed";
import { LiveToast } from "@/components/LiveToast";
import { CountdownFull } from "@/components/Countdown";
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
    .slice(0, 3)
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

        {/* ───────── Franja: contador + stats ───────── */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 sm:px-6">
            <div className="flex flex-col gap-8 border-t border-white/10 py-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow mb-3 text-white/55">
                  Cuenta regresiva a la ceremonia
                </p>
                <CountdownFull />
              </div>
              <div className="flex flex-wrap gap-6 sm:gap-8">
                <Stat
                  value={supporterTotal.toLocaleString("es-AR")}
                  label="Personas apoyando"
                />
                <Stat value={String(athleteCount)} label="Atletas en campaña" />
                <Stat value={formatMoney(totalRaised)} label="Total recaudado" />
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Portada (camino solitario) ───────── */}
        <CoverBand />

        {/* ───────── Grid de atletas ───────── */}
        <section id="atletas" className="bg-ice">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            {/* Actividad en vivo */}
            <Reveal className="mb-10">
              <ActivityFeed targets={activityTargets} />
            </Reveal>

            <Reveal>
              <div className="mb-8">
                <p className="eyebrow text-celeste-deep">En campaña</p>
                <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                  Elegí a quién apoyar
                </h2>
              </div>
            </Reveal>
            <AthleteGrid athletes={athletes} teams={teams} />
          </div>
        </section>

        {/* ───────── Otros atletas argentinos ───────── */}
        <section id="otros-atletas" className="bg-paper">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <div className="mb-2 flex items-center gap-3">
                <span className="ribbon ribbon-tall w-16 rounded-full" aria-hidden />
                <p className="eyebrow text-celeste-deep">No solo LA 2028</p>
              </div>
              <h2 className="font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                Otros atletas argentinos
              </h2>
              <p className="mt-2 max-w-2xl text-steel">
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
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <div className="flex flex-col items-start gap-6 rounded-2xl border border-white/10 bg-ink-2 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <p className="eyebrow text-gold">¿No sabés a quién elegir?</p>
                  <h2 className="mt-3 font-display text-3xl font-700 uppercase leading-tight tracking-tight sm:text-4xl">
                    Apoyá a todos los atletas
                  </h2>
                  <p className="mt-3 text-white/75">
                    Poné el monto que quieras y se reparte en partes iguales entre
                    los {athleteCount} atletas y jugadores rumbo al Mundial. Una sola
                    vez o por mes.
                  </p>
                </div>
                <Link
                  href="/apoyar-a-todos"
                  className="shrink-0 rounded-md bg-gold px-7 py-3.5 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
                >
                  Apoyar a todos
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── Top hinchas (teaser) ───────── */}
        <section className="bg-ice">
          <div className="mx-auto max-w-container px-4 py-14 sm:px-6">
            <Reveal>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow text-celeste-deep">Comunidad</p>
                  <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                    Top hinchas del mes
                  </h2>
                  <p className="mt-2 text-steel">
                    Los que más están apoyando al deporte argentino.
                  </p>
                </div>
                <Link
                  href="/hinchas"
                  className="font-display text-sm font-600 uppercase tracking-wide text-celeste-deep hover:underline"
                >
                  Ver ranking completo →
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {topThree.map((s, i) => (
                  <div
                    key={s.rank}
                    className={`flex items-center gap-3 rounded-2xl border bg-paper p-4 ${
                      i === 0 ? "border-gold" : "border-line"
                    }`}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-base font-700 text-ink"
                      style={{ backgroundColor: podiumColors[i] }}
                    >
                      {s.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display font-700 uppercase tracking-wide text-ink">
                        {s.name}
                      </div>
                      <div className="text-xs text-steel">
                        apoya a {s.athletes} atletas
                      </div>
                    </div>
                    <span className="shrink-0 font-display font-700 text-celeste-deep">
                      {formatMoney(s.total)}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── Cómo funciona ───────── */}
        <section id="como-funciona" className="bg-paper">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <div className="mb-10">
                <p className="eyebrow text-celeste-deep">Simple y transparente</p>
                <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                  Cómo funciona
                </h2>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              <Reveal delay={0}>
                <Step
                  n="01"
                  title="Elegís un atleta"
                  body="Explorás los perfiles verificados de deportistas individuales en proceso de clasificación y elegís a quién querés apoyar."
                />
              </Reveal>
              <Reveal delay={110}>
                <Step
                  n="02"
                  title="Aportás una vez o por mes"
                  body="Donación única o mensual, con el monto que quieras. Ves en vivo cuánto recibe el atleta antes de confirmar."
                />
              </Reveal>
              <Reveal delay={220}>
                <Step
                  n="03"
                  title="La plata llega directo"
                  body={`El ${netPct}% va al atleta y el ${feePct}% sostiene la plataforma. Pago seguro vía Stripe Connect: nunca custodiamos los fondos.`}
                />
              </Reveal>
            </div>
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

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <div className="font-display text-5xl font-700 text-gold/30">{n}</div>
      <h3 className="mt-3 font-display text-xl font-600 uppercase tracking-wide text-ink">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-steel">{body}</p>
    </div>
  );
}
