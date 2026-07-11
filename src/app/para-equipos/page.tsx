import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { TeamApplicationForm } from "@/components/TeamApplicationForm";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Proyectos deportivos — ${SITE.brand}`,
  description:
    "Postulá tu proyecto deportivo para correr una campaña de apoyo: un viaje, un torneo, materiales. Los aportes van directo a la cuenta del proyecto. Cada caso lo revisamos a mano.",
};

export default function ParaEquiposPage() {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden bg-ink text-white">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute left-1/2 top-[-120px] h-[560px] w-[760px] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse at center,rgba(201,162,39,.16),transparent 68%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-[1100px] px-4 pb-8 pt-[70px] text-center sm:px-6">
            <Reveal>
              <div className="mb-[22px] inline-flex items-center gap-2.5">
                <span className="podio-pulse h-2 w-2 rounded-full bg-gold" aria-hidden />
                <span className="eyebrow text-gold">Proyectos deportivos argentinos</span>
              </div>
              <h1 className="font-display text-[54px] font-700 uppercase leading-[.92] tracking-tight sm:text-[68px]">
                Tu proyecto,<br />
                <span className="text-gold">una sola campaña</span>
              </h1>
              <p className="mx-auto mt-5 max-w-[560px] text-[19px] leading-relaxed text-white/72">
                Postulá tu proyecto deportivo — un viaje, un torneo, materiales —
                y la gente lo apoya. El 93% de cada aporte va directo a la cuenta
                del proyecto.
              </p>
            </Reveal>

            {/* Tabs Atleta / Equipo */}
            <Reveal delay={100}>
              <div className="mt-8 inline-flex rounded-full border border-white/12 p-1">
                <Link
                  href="/para-atletas"
                  className="rounded-full px-5 py-2.5 font-display text-[13px] font-600 uppercase tracking-wide text-white/60 transition-colors hover:text-white"
                >
                  Soy atleta
                </Link>
                <span
                  className="rounded-full px-5 py-2.5 font-display text-[13px] font-600 uppercase tracking-wide text-ink"
                  style={{ background: "#C9A227" }}
                >
                  Somos un proyecto
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Formulario ── */}
        <TeamApplicationForm />
      </main>
      <Footer />
    </>
  );
}
