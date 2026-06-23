import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationWidget } from "@/components/DonationWidget";
import { getGlobalStats } from "@/lib/data/athletes";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Apoyá a todos — ${SITE.brand}`,
  description:
    "Poné el monto que quieras y se reparte en partes iguales entre todos los atletas argentinos rumbo al Mundial.",
};

export default async function ApoyarATodosPage() {
  const { athleteCount } = await getGlobalStats();

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-14 sm:px-6 sm:py-20">
            <p className="eyebrow text-gold">Un aporte, todos los atletas</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-700 uppercase leading-[1.04] tracking-tight sm:text-6xl">
              Apoyá a todos los atletas de una
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/75">
              No hace falta elegir. Tu aporte se reparte en partes iguales entre
              los {athleteCount} deportistas y jugadores en campaña rumbo al
              Mundial — atletas individuales y los planteles de hockey, vóley y
              handball.
            </p>
          </div>
        </section>

        {/* Cuerpo */}
        <section className="bg-ice">
          <div className="mx-auto grid max-w-container gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
            <div>
              <h2 className="font-display text-2xl font-600 uppercase tracking-wide text-ink">
                Cómo se reparte
              </h2>
              <ol className="mt-4 space-y-3">
                {[
                  ["Elegís el monto", "Único o mensual, lo que quieras aportar."],
                  [
                    "Retenemos el 7%",
                    "Para sostener la plataforma. El 93% va a los atletas.",
                  ],
                  [
                    `Se divide entre ${athleteCount}`,
                    "Cada atleta recibe exactamente la misma parte. Sin preferencias.",
                  ],
                ].map(([t, d], i) => (
                  <li
                    key={i}
                    className="flex gap-4 rounded-xl border border-line bg-paper p-4"
                  >
                    <span className="font-display text-3xl font-700 text-gold/40">
                      0{i + 1}
                    </span>
                    <div>
                      <div className="font-display font-600 uppercase tracking-wide text-ink">
                        {t}
                      </div>
                      <p className="text-sm text-steel">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-6 rounded-xl bg-paper border border-line p-4 text-sm text-steel">
                Es la forma más simple de tener impacto parejo: en vez de elegir a
                uno, empujás a todo el equipo argentino rumbo a Los Ángeles 2028.
              </p>
            </div>

            <aside className="lg:relative">
              <div className="lg:sticky lg:top-24">
                <DonationWidget
                  target={{
                    kind: "all",
                    title: "Apoyá a todos",
                    splitCount: athleteCount,
                  }}
                />
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
