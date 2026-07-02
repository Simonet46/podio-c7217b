import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { AthleteApplicationForm } from "@/components/AthleteApplicationForm";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Para atletas — ${SITE.brand}`,
  description:
    "Postulate para recibir apoyo mensual de la gente. Sin intermediarios: el 93% del aporte es tuyo. Cada caso lo revisamos a mano.",
};

export default function ParaAtletasPage() {
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
          <div className="relative mx-auto max-w-[1100px] px-4 pb-10 pt-[70px] text-center sm:px-6">
            <Reveal>
              <div className="mb-[22px] inline-flex items-center gap-2.5">
                <span className="podio-pulse h-2 w-2 rounded-full bg-gold" aria-hidden />
                <span className="eyebrow text-gold">Para atletas argentinos</span>
              </div>
              <h1 className="font-display text-[54px] font-700 uppercase leading-[.92] tracking-tight sm:text-[68px]">
                Dejá de hacerlo<br />
                <span className="text-gold">solo</span>
              </h1>
              <p className="mx-auto mt-5 max-w-[540px] text-[19px] leading-relaxed text-white/72">
                Postulate para recibir apoyo mensual de la gente. Sin
                intermediarios: el 93% del aporte es tuyo. Cada caso lo revisamos
                a mano, atleta por atleta.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-[30px] flex flex-wrap justify-center gap-9">
                <div className="text-center">
                  <div className="font-display text-[34px] font-700 leading-none text-gold">93%</div>
                  <div className="text-[13px] text-white/55">es para vos</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-[34px] font-700 leading-none">A mano</div>
                  <div className="text-[13px] text-white/55">revisamos tu caso</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-[34px] font-700 leading-none">$0</div>
                  <div className="text-[13px] text-white/55">cuesta postularte</div>
                </div>
              </div>
            </Reveal>

            {/* Tabs Atleta / Equipo */}
            <Reveal delay={160}>
              <div className="mt-8 inline-flex rounded-full border border-white/12 p-1">
                <span
                  className="rounded-full px-5 py-2.5 font-display text-[13px] font-600 uppercase tracking-wide text-ink"
                  style={{ background: "#C9A227" }}
                >
                  Soy atleta
                </span>
                <Link
                  href="/para-equipos"
                  className="rounded-full px-5 py-2.5 font-display text-[13px] font-600 uppercase tracking-wide text-white/60 transition-colors hover:text-white"
                >
                  Somos un equipo
                </Link>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 text-[14px] text-white/50">
                ¿Ya tenés cuenta de atleta?{" "}
                <Link href="/mi-perfil" className="font-600 text-gold underline underline-offset-4 hover:text-gold-soft">
                  Entrá a tu perfil
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Formulario multi-paso ── */}
        <AthleteApplicationForm />

      </main>
      <Footer />
    </>
  );
}
