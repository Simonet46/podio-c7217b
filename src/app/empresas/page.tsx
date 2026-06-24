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
    "Sumá tu marca al deporte argentino. Te conectamos con los atletas que mejor van con tu identidad.",
};

const VALORES: [string, string][] = [
  ["Match real", "No te mandamos un catálogo. Escuchamos qué busca tu marca y te acercamos los atletas que encajan."],
  ["Historia genuina", "Atletas reales, historias de esfuerzo. El contenido más auténtico que puede tener una marca."],
  ["Vínculo directo", "El acuerdo lo cierran ustedes. Nosotros hacemos la presentación y nos corremos."],
  ["Sin burocracia", "No intermediamos plata ni contratos. Tu contador y el del atleta lo resuelven entre ellos."],
];

const PLANES: { title: string; tag?: string; desc: string; detail: string }[] = [
  {
    title: "Un atleta",
    desc: "Te acercamos a un atleta puntual que encaja con tu marca.",
    detail: "Ideal para una historia cercana y personal.",
  },
  {
    title: "Varios atletas",
    tag: "Más elegido",
    desc: "Te presentamos un grupo de atletas seleccionados según tu perfil.",
    detail: "Más alcance y diversidad de historias.",
  },
  {
    title: "Empresa patrocinadora",
    desc: "Sumás tu logo como empresa patrocinadora de GRANITO.",
    detail: "Máxima visibilidad en todo el sitio junto a la movida.",
  },
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
              Tu marca, al lado de quien la rompe
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              Detrás de cada atleta argentino hay una historia de garra. Te{" "}
              <span className="text-white">ponemos en relación</span> con el atleta que mejor va con tu marca — el acuerdo lo cierran ustedes.
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
              <p className="eyebrow text-celeste-deep">Más que publicidad</p>
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

        {/* Planes */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <Reveal>
              <p className="eyebrow text-gold">Opciones</p>
              <h2 className="mt-2 font-display text-3xl font-700 uppercase tracking-tight sm:text-4xl">
                ¿Cómo querés sumarte?
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {PLANES.map((p, i) => (
                <Reveal key={p.title} delay={i * 90}>
                  <div
                    className={`flex h-full flex-col rounded-2xl border p-7 ${
                      p.tag
                        ? "border-gold bg-[#0d2238]"
                        : "border-white/10 bg-[#0d2238]"
                    }`}
                  >
                    {p.tag && (
                      <span className="mb-3 inline-block w-fit rounded-full bg-gold px-3 py-1 font-display text-[11px] font-700 uppercase tracking-wide text-ink">
                        {p.tag}
                      </span>
                    )}
                    <h3 className="font-display text-xl font-700 uppercase tracking-tight text-white">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-white/70">{p.desc}</p>
                    <p className="mt-auto pt-4 text-sm text-gold">{p.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Cómo funciona */}
            <Reveal className="mt-10">
              <div className="rounded-2xl border border-white/10 bg-[#0d2238] p-6 sm:p-8">
                <h3 className="font-display text-lg font-700 uppercase tracking-wide text-white">
                  Cómo funciona
                </h3>
                <ol className="mt-5 space-y-4">
                  {[
                    ["Nos contás qué busca tu marca", "Presupuesto, valores, el tipo de atleta con el que querés asociarte."],
                    ["Te proponemos atletas que encajan", "Te acercamos los perfiles que mejor van con tu identidad — solo individuales."],
                    ["Te presentamos al atleta o su manager", "Y quedan en contacto directo. El acuerdo lo cierran ustedes."],
                  ].map(([t, d], i) => (
                    <li key={i} className="flex gap-4">
                      <span className="font-display text-xl font-700 text-gold/50">
                        0{i + 1}
                      </span>
                      <div>
                        <div className="font-display text-sm font-600 uppercase tracking-wide text-white">
                          {t}
                        </div>
                        <p className="mt-0.5 text-sm text-white/60">{d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 rounded-lg border border-white/10 bg-ink p-4 text-sm text-white/60">
                  <span className="font-600 text-white">Es publicidad, no donación:</span>{" "}
                  suele ser un gasto deducible para tu empresa. Nosotros hacemos el{" "}
                  <span className="font-600 text-white">match</span> — no intermediamos plata ni coordinamos el acuerdo. Validá siempre con tu contador.
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
                Dejanos tus datos y te contactamos para presentarte los atletas que
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
