import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { CompanyContactForm } from "@/components/CompanyContactForm";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Para empresas — ${SITE.brand}`,
  description:
    "Sumá tu marca al deporte argentino. Patrociná atletas y equipos rumbo a Los Ángeles 2028 y más allá.",
};

const VALORES: [string, string][] = [
  ["Visibilidad con propósito", "Tu logo en los perfiles que apoyás, en el sitio y en el contenido de los atletas."],
  ["Una causa que enamora", "Asociás tu marca al esfuerzo, la garra y el orgullo del deporte argentino."],
  ["Contenido auténtico", "Historias reales de atletas para tus redes y campañas — nada más genuino."],
  ["Impacto medible", "Te pasamos reportes de a quién ayudaste y qué lograron con tu apoyo."],
];

const FORMAS: [string, string, string][] = [
  ["Apadrinar un atleta", "Tu marca acompaña a un atleta puntual en todo su camino.", "Ideal para una historia cercana y personal."],
  ["Apoyar un equipo", "Apoyás a todo un plantel rumbo al Mundial.", "Más alcance, una comunidad entera detrás."],
  ["Sponsor de la plataforma", "Tu logo en todo el sitio, junto a los que ya creen.", "Máxima exposición y asociación con la movida."],
];

export default function EmpresasPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6 sm:py-20">
            <p className="eyebrow text-gold">Para empresas</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-700 uppercase leading-[1.04] tracking-tight sm:text-6xl">
              Tu marca, empujando al deporte argentino
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              Detrás de cada atleta argentino hay una historia de garra. Te
              <span className="text-white"> conectamos</span> con el atleta o el equipo
              que mejor va con tu marca para que lo auspicies — el acuerdo lo cierran
              ustedes, nosotros hacemos la presentación y le damos la visibilidad.
            </p>
            <div className="mt-8">
              <Link
                href="#sumate"
                className="rounded-md bg-gold px-6 py-3 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
              >
                Quiero sumar mi empresa
              </Link>
            </div>
          </div>
        </section>

        {/* Por qué sumarte */}
        <section className="bg-ice">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <p className="eyebrow text-celeste-deep">Más que una donación</p>
              <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                Por qué sumar tu marca
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALORES.map(([t, d], i) => (
                <Reveal key={t} delay={i * 80}>
                  <div className="h-full rounded-xl border border-line bg-paper p-6">
                    <h3 className="font-display text-lg font-600 uppercase tracking-wide text-ink">
                      {t}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-steel">{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Formas de sumarse */}
        <section className="bg-paper">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <h2 className="font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                Formas de sumarte
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {FORMAS.map(([t, d, extra], i) => (
                <Reveal key={t} delay={i * 90}>
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6 shadow-sm">
                    <div className="ribbon ribbon-tall w-12 rounded-full" aria-hidden />
                    <h3 className="mt-4 font-display text-xl font-700 uppercase tracking-tight text-ink">
                      {t}
                    </h3>
                    <p className="mt-2 text-steel">{d}</p>
                    <p className="mt-auto pt-4 text-sm text-celeste-deep">{extra}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Cómo funciona / nuestro rol */}
            <Reveal className="mt-8">
              <div className="rounded-2xl border border-line bg-ice p-6 sm:p-8">
                <h3 className="font-display text-lg font-700 uppercase tracking-wide text-ink">
                  Cómo funciona (y cuál es nuestro rol)
                </h3>
                <ol className="mt-4 space-y-3">
                  {[
                    ["Nos contás qué busca tu marca", "Presupuesto, valores, a quién te gustaría llegar."],
                    ["Te proponemos atletas que encajan", "Te acercamos los perfiles que mejor van con tu identidad."],
                    ["Cerrás el auspicio directo con el atleta", "El contrato y la factura van entre ustedes — cada uno con su contador."],
                    ["Tu logo aparece en su perfil", "Visibilidad real en la campaña y el contenido del atleta."],
                  ].map(([t, d], i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-display text-xl font-700 text-gold/50">
                        0{i + 1}
                      </span>
                      <div>
                        <div className="font-display text-sm font-600 uppercase tracking-wide text-ink">
                          {t}
                        </div>
                        <p className="text-sm text-steel">{d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 rounded-lg border border-line bg-paper p-4 text-sm text-steel">
                  Es <span className="font-600 text-ink">publicidad, no donación</span>:
                  para tu empresa suele ser un gasto deducible. Nosotros hacemos el{" "}
                  <span className="font-600 text-ink">match</span> y la visibilidad — no
                  intermediamos la plata ni el contrato del auspicio. (Validá siempre con
                  tu contador.)
                </p>
                <p className="mt-3 text-sm text-steel">
                  Marcas como ENARD, Globant y Mercado Pago ya acompañan la movida.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Formulario */}
        <section id="sumate" className="bg-ice">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <Reveal>
              <p className="eyebrow text-celeste-deep">Hablemos</p>
              <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                Sumá tu empresa
              </h2>
              <p className="mt-2 text-steel">
                Dejanos tus datos y te contactamos para presentarte a los atletas que
                mejor van con tu marca.
              </p>
            </Reveal>
            <div className="mt-8">
              <CompanyContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
