import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Postulate — ${SITE.brand}`,
  description:
    "¿Sos atleta o tenés un proyecto deportivo? Postulate a GRANITO y recibí el apoyo directo de la comunidad.",
};

const OPTIONS = [
  {
    href: "/para-atletas",
    icon: "🏃",
    title: "Soy atleta",
    desc: "Tenés tu perfil propio, contás tu historia y recibís aportes directos a tu Mercado Pago cuando quieran apoyarte.",
    cta: "Postularme como atleta",
    bullets: ["Perfil público con tu historia", "Recibís aportes cuando quieran apoyarte", "El 93% va directo a tu cuenta"],
  },
  {
    href: "/para-equipos",
    icon: "🛡️",
    title: "Somos un proyecto deportivo",
    desc: "Armás una campaña con una misión concreta: un viaje, un torneo, materiales. Los aportes van directo a la cuenta del proyecto.",
    cta: "Postular mi proyecto",
    bullets: ["Campaña con objetivo y plazo", "Ideal para viajes y equipamiento", "Recibís todo, aunque no llegues al objetivo"],
  },
] as const;

export default function PostulatePage() {
  return (
    <>
      <Header />
      <main className="bg-ink text-white">
        <section className="relative mx-auto max-w-[980px] overflow-hidden px-4 pb-24 pt-14 sm:px-6">
          <div
            className="pointer-events-none absolute left-1/2 top-[-160px] h-[500px] w-[820px] -translate-x-1/2"
            style={{ background: "radial-gradient(ellipse at center,rgba(201,162,39,.16),transparent 65%)" }}
            aria-hidden
          />
          <Reveal>
            <div className="relative mb-10 text-center">
              <p className="eyebrow text-gold">Sumate a {SITE.brand}</p>
              <h1 className="mt-3 font-display text-4xl font-700 uppercase leading-[.95] tracking-tight sm:text-6xl">
                ¿Sos atleta
                <br />o un proyecto?
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/65">
                Elegí tu camino. En los dos casos revisamos cada postulación a
                mano antes de publicarla.
              </p>
            </div>
          </Reveal>

          <div className="relative grid gap-6 md:grid-cols-2">
            {OPTIONS.map((o, i) => (
              <Reveal key={o.href} delay={i * 110}>
                <Link
                  href={o.href}
                  className="group flex h-full flex-col rounded-2xl p-8 transition-transform hover:-translate-y-1"
                  style={{
                    background: "#0d2238",
                    border: "1px solid rgba(255,255,255,.09)",
                    boxShadow: "0 14px 40px rgba(0,0,0,.35)",
                  }}
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full text-[26px]" style={{ background: "rgba(201,162,39,.14)", border: "1px solid rgba(201,162,39,.35)" }}>
                    {o.icon}
                  </div>
                  <h2 className="font-display text-[26px] font-700 uppercase leading-none text-white">
                    {o.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/60">{o.desc}</p>
                  <ul className="mt-4 flex flex-col gap-1.5">
                    {o.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-[13px] text-white/55">
                        <span className="text-gold" aria-hidden>✓</span> {b}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto pt-6 font-display text-[14px] font-700 uppercase tracking-wide text-gold transition-colors group-hover:text-gold-soft">
                    {o.cta} →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <p className="relative mt-8 text-center text-[13px] text-white/40">
            ¿Ya tenés cuenta de atleta?{" "}
            <Link href="/mi-perfil" className="text-white/60 underline hover:text-white">
              Entrá a tu perfil
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
