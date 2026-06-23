import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { AthleteApplicationForm } from "@/components/AthleteApplicationForm";
import { SITE, PLATFORM_FEE_RATE } from "@/config/site";

export const metadata: Metadata = {
  title: `Para atletas — ${SITE.brand}`,
  description:
    "¿Sos atleta argentino rumbo a Los Ángeles 2028? Postulate y recibí apoyo directo. Sin costo para vos.",
};

const STEPS: [string, string, string][] = [
  ["01", "Postulate", "Completás el formulario con tu historia y lo que necesitás. Te lleva 5 minutos."],
  ["02", "Te verificamos", "Revisamos cada postulación a mano. Somos atletas: sabemos mirar una carrera de verdad."],
  ["03", "Publicamos tu campaña", "Armamos tu perfil con tu foto, tu historia y tu meta. Listo para recibir apoyo."],
  ["04", "Recibís el apoyo directo", "La gente te apoya y la plata llega a vos. Vos te quedás con el 93%."],
];

export default function ParaAtletasPage() {
  const netPct = Math.round((1 - PLATFORM_FEE_RATE) * 100);
  const feePct = Math.round(PLATFORM_FEE_RATE * 100);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6 sm:py-20">
            <p className="eyebrow text-gold">Para atletas</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-700 uppercase leading-[1.04] tracking-tight sm:text-6xl">
              Dejá de hacerlo solo
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              No importa si vas rumbo a Los Ángeles 2028 o sos una promesa juvenil del
              interior: si sos atleta argentino y te costeás buena parte del camino, esto
              es para vos. Postulate, armamos tu campaña y empezás a recibir apoyo
              directo —{netPct}% para vos, {feePct}% para sostener la plataforma. Sin
              costo para el atleta.
            </p>
            <div className="mt-8">
              <Link
                href="#postulate"
                className="rounded-md bg-gold px-6 py-3 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
              >
                Quiero postularme
              </Link>
            </div>
          </div>
        </section>

        {/* Cómo funciona para vos */}
        <section className="bg-ice">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <p className="eyebrow text-celeste-deep">Simple y transparente</p>
              <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                Cómo funciona para vos
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([n, title, body], i) => (
                <Reveal key={n} delay={i * 90}>
                  <div className="h-full rounded-xl border border-line bg-paper p-6">
                    <div className="font-display text-5xl font-700 text-gold/30">{n}</div>
                    <h3 className="mt-3 font-display text-xl font-600 uppercase tracking-wide text-ink">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-steel">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Por qué confiar */}
            <Reveal className="mt-10">
              <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
                <h3 className="font-display text-xl font-700 uppercase tracking-wide text-ink">
                  ¿Por qué confiar en {SITE.brand}?
                </h3>
                <p className="mt-3 leading-relaxed text-steel">
                  Detrás estamos tres atletas que vivimos el ciclo olímpico desde
                  adentro y conocemos lo que cuesta. No es una empresa que te ve como
                  un número: revisamos cada caso a mano y armamos tu campaña con vos.{" "}
                  <Link href="/quienes-somos" className="font-600 text-celeste-deep hover:underline">
                    Conocé quiénes somos →
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Formulario */}
        <section id="postulate" className="bg-paper">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <Reveal>
              <p className="eyebrow text-celeste-deep">Postulate</p>
              <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                Contanos tu historia
              </h2>
              <p className="mt-2 text-steel">
                Completá tus datos. Si entrás, te escribimos para armar tu campaña.
              </p>
            </Reveal>
            <div className="mt-8">
              <AthleteApplicationForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
