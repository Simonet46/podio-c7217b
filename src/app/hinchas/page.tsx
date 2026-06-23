import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { topSupporters, initialsOf } from "@/lib/supporters";
import { formatMoney } from "@/lib/money";
import { DIPLOMA_TIERS, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Top hinchas — ${SITE.brand}`,
  description:
    "El ranking de los que más apoyan al deporte argentino rumbo a Los Ángeles 2028.",
};

const PODIUM_COLORS = [
  DIPLOMA_TIERS.oro.color,
  DIPLOMA_TIERS.plata.color,
  DIPLOMA_TIERS.bronce.color,
];

export default function HinchasPage() {
  const ranking = topSupporters(15);
  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-14 sm:px-6 sm:py-20">
            <p className="eyebrow text-gold">Top hinchas · este mes</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-700 uppercase leading-[1.04] tracking-tight sm:text-6xl">
              Los que más apoyan al deporte argentino
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/75">
              Cada aporte suma puntos. Cuanto más apoyás, más alto subís. Acá están
              los que más están empujando a los atletas rumbo a Los Ángeles 2028.
            </p>
          </div>
        </section>

        {/* Podio */}
        <section className="bg-ice">
          <div className="mx-auto max-w-container px-4 py-12 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {podium.map((s, i) => (
                <Reveal key={s.rank} delay={i * 90}>
                  <div
                    className={`flex h-full flex-col items-center rounded-2xl border bg-paper p-6 text-center shadow-sm ${
                      i === 0 ? "border-gold sm:-mt-3 sm:pb-9" : "border-line"
                    }`}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full font-display text-xl font-700 text-ink"
                      style={{ backgroundColor: PODIUM_COLORS[i] }}
                    >
                      {s.rank}
                    </span>
                    <span
                      className="mt-4 flex h-16 w-16 items-center justify-center rounded-full font-display text-lg font-700 text-white"
                      style={{ backgroundColor: PODIUM_COLORS[i] }}
                    >
                      {initialsOf(s.name)}
                    </span>
                    <div className="mt-3 font-display text-lg font-700 uppercase tracking-wide text-ink">
                      {s.name}
                    </div>
                    <div className="mt-1 font-display text-2xl font-700 text-celeste-deep">
                      {formatMoney(s.total)}
                    </div>
                    <div className="eyebrow mt-1 text-steel">
                      apoya a {s.athletes} atletas
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Resto del ranking */}
            <Reveal className="mt-8">
              <ul className="overflow-hidden rounded-2xl border border-line bg-paper">
                {rest.map((s) => (
                  <li
                    key={s.rank}
                    className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-0 sm:px-6"
                  >
                    <span className="w-6 shrink-0 text-center font-display text-lg font-700 text-steel">
                      {s.rank}
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-[0.65rem] font-700 text-white">
                      {initialsOf(s.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-600 text-ink">
                      {s.name}
                    </span>
                    <span className="hidden shrink-0 text-sm text-steel sm:inline">
                      {s.athletes} atletas
                    </span>
                    <span className="shrink-0 font-display font-700 text-ink">
                      {formatMoney(s.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* CTA: sumate al ranking */}
            <div className="mt-10 rounded-2xl border border-line bg-paper p-8 text-center">
              <h2 className="font-display text-2xl font-700 uppercase tracking-tight text-ink sm:text-3xl">
                ¿Querés entrar al ranking?
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-steel">
                Cada aporte te suma. Apoyá a un atleta o a todos y empezá a escalar.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/#atletas"
                  className="rounded-md bg-ink px-6 py-3 font-display text-sm font-600 uppercase tracking-wide text-white transition-colors hover:bg-ink-2"
                >
                  Elegir un atleta
                </Link>
                <Link
                  href="/apoyar-a-todos"
                  className="rounded-md bg-gold px-6 py-3 font-display text-sm font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
                >
                  Apoyar a todos
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
