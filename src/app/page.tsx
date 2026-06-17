import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AthleteGrid } from "@/components/AthleteGrid";
import { CoverBand } from "@/components/CoverBand";
import { CountdownFull } from "@/components/Countdown";
import { getAthletes, getTeams, getGlobalStats } from "@/lib/data/athletes";
import { formatMoney } from "@/lib/money";
import { PLATFORM_FEE_RATE, asset } from "@/config/site";
import { Reveal } from "@/components/Reveal";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  const athletes = await getAthletes();
  const teams = await getTeams();
  const { athleteCount, totalRaised, supporterTotal } = await getGlobalStats();
  const netPct = Math.round((1 - PLATFORM_FEE_RATE) * 100);
  const feePct = Math.round(PLATFORM_FEE_RATE * 100);

  return (
    <>
      <Header />
      <main>
        {/* ───────── Hero ───────── */}
        <section className="relative overflow-hidden bg-ink text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(1200px 500px at 80% -10%, rgba(108,180,228,0.18), transparent), radial-gradient(800px 400px at 0% 110%, rgba(201,162,39,0.14), transparent)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-container px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              {/* Columna de texto */}
              <Reveal>
                <p className="eyebrow text-gold">
                  Financiamiento directo · Atletas argentinos
                </p>
                <h1 className="mt-4 max-w-2xl font-display text-4xl font-700 uppercase leading-[1.05] tracking-tight sm:text-6xl">
                  Bancá a los atletas argentinos rumbo a{" "}
                  <span className="text-gold">Los Ángeles 2028</span>
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
                  Muchos compiten al máximo nivel autofinanciándose: viajes,
                  entrenador, equipo. Tu aporte llega directo —{netPct}% para el
                  atleta, {feePct}% para sostener la plataforma.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="#atletas"
                    className="rounded-md bg-gold px-6 py-3 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
                  >
                    Ver atletas
                  </Link>
                  <Link
                    href="#como-funciona"
                    className="rounded-md border border-white/25 px-6 py-3 font-display text-base font-600 uppercase tracking-wide text-white transition-colors hover:bg-white/10"
                  >
                    Cómo funciona
                  </Link>
                </div>
              </Reveal>

              {/* Imagen inmersiva del atleta destacado (solo desktop) */}
              <Reveal delay={120} className="hidden lg:block">
                <div className="relative">
                  <div className="ribbon ribbon-tall absolute -top-3 left-6 right-6 z-10 rounded-full opacity-90" />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                    <Image
                      src={asset("/athletes/valentina-moretti.webp")}
                      alt="Atleta argentina rumbo a LA 2028"
                      fill
                      priority
                      sizes="(max-width: 1024px) 0px, 45vw"
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 55%, rgba(10,26,47,0.55))",
                      }}
                    />
                    <div className="absolute bottom-4 left-5">
                      <p className="font-display text-sm font-600 uppercase tracking-wide text-white">
                        Valentina Moretti
                      </p>
                      <p className="text-xs text-white/75">Vela / Kite · San Fernando</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Contador + fila de stats */}
            <Reveal delay={80}>
              <div className="mt-12 flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="eyebrow mb-3 text-white/55">
                    Cuenta regresiva a la ceremonia
                  </p>
                  <CountdownFull />
                </div>
                <div className="flex flex-wrap gap-6 sm:gap-8">
                  <Stat
                    value={supporterTotal.toLocaleString("es-AR")}
                    label="Personas bancando"
                  />
                  <Stat value={String(athleteCount)} label="Atletas en campaña" />
                  <Stat value={formatMoney(totalRaised)} label="Total recaudado" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── Portada (camino solitario) ───────── */}
        <CoverBand />

        {/* ───────── Grid de atletas ───────── */}
        <section id="atletas" className="bg-ice">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <div className="mb-8">
                <p className="eyebrow text-celeste-deep">En campaña</p>
                <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                  Elegí a quién bancar
                </h2>
              </div>
            </Reveal>
            <AthleteGrid athletes={athletes} teams={teams} />
          </div>
        </section>

        {/* ───────── Bancá a todos ───────── */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <div className="flex flex-col items-start gap-6 rounded-2xl border border-white/10 bg-ink-2 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <p className="eyebrow text-gold">¿No sabés a quién elegir?</p>
                  <h2 className="mt-3 font-display text-3xl font-700 uppercase leading-tight tracking-tight sm:text-4xl">
                    Bancá a todos los atletas
                  </h2>
                  <p className="mt-3 text-white/75">
                    Poné el monto que quieras y se reparte en partes iguales entre
                    los {athleteCount} atletas y jugadores rumbo al Mundial. Una sola
                    vez o por mes.
                  </p>
                </div>
                <Link
                  href="/bancar-a-todos"
                  className="shrink-0 rounded-md bg-gold px-7 py-3.5 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
                >
                  Bancar a todos
                </Link>
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
                  body="Explorás los perfiles verificados de deportistas individuales en proceso de clasificación y elegís a quién querés bancar."
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
