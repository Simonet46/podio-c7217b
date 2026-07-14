import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationWidget } from "@/components/DonationWidget";
import { Reveal } from "@/components/Reveal";
import { Monogram } from "@/components/Monogram";
import { getAthletes, getGlobalStats } from "@/lib/data/athletes";
import { getSport } from "@/config/sports";
import { formatMoney } from "@/lib/money";
import { SITE, asset } from "@/config/site";

export const metadata: Metadata = {
  title: `Apoyá a todos — ${SITE.brand}`,
  description:
    "Un aporte que se divide automáticamente en partes iguales entre todos los atletas argentinos registrados. Vos elegís el monto.",
};

const STEPS = [
  {
    n: "01",
    color: "#0072CE",
    title: "Ponés tu monto",
    text: "Elegís cuánto aportar. Desde lo que puedas hasta lo que quieras: todo suma al fondo común.",
  },
  {
    n: "02",
    color: "#F4C300",
    title: "Lo juntamos",
    text: "Tu aporte se suma al de toda la comunidad y forma el fondo que se reparte entre los atletas registrados.",
  },
  {
    n: "03",
    color: "#009F3D",
    title: "Se reparte automático",
    text: "Distribuimos el 93% en partes iguales entre todos los atletas registrados al momento del aporte. El 7% sostiene la plataforma.",
  },
];

const CHECKLIST = [
  "Repartido automático, en partes iguales",
  "Te llega un resumen de a quiénes llegó",
  "Cancelás cuando querás — sin burocracia",
];

export default async function ApoyarATodosPage() {
  const [athletes, { athleteCount, totalRaised, supporterTotal }] =
    await Promise.all([getAthletes(), getGlobalStats()]);

  // Duplicar lista para que el marquee sea seamless
  const marqueeAthletes = [...athletes, ...athletes];

  return (
    <>
      <Header />
      <main className="bg-ink text-white overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Gold glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-[-120px] h-[560px] w-[820px] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse at center,rgba(201,162,39,.18),transparent 66%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-[1100px] px-4 pb-8 pt-20 text-center sm:px-6">
            <Reveal>
              {/* Ribbon 5 colores */}
              <div
                className="mx-auto mb-7 h-[18px] w-[170px] rounded-[4px]"
                style={{
                  background:
                    "linear-gradient(90deg,#0072CE 0 20%,#F4C300 20% 40%,#1A1A1A 40% 60%,#009F3D 60% 80%,#DF0024 80% 100%)",
                }}
                aria-hidden
              />
              <h1 className="font-display text-5xl font-700 uppercase leading-[.92] tracking-tight sm:text-6xl lg:text-[72px]">
                Apoyá a todo el<br />
                deporte argentino<br />
                <span className="text-gold">de una</span>
              </h1>
              <p className="mx-auto mt-5 max-w-[560px] text-lg leading-relaxed text-white/72">
                Un aporte que se divide automáticamente en partes iguales
                entre todos los atletas registrados. Vos elegís el monto.
              </p>
              <Link
                href="#widget"
                className="mt-8 inline-block rounded-md bg-gold px-9 py-4 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
              >
                Sumarme al fondo
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── Marquee de atletas ── */}
        <section className="py-9 overflow-hidden" aria-hidden>
          <div className="marquee-track flex w-max gap-3.5">
            {marqueeAthletes.map((a, i) => {
              const sport = getSport(a.sport);
              const color = sport?.color ?? "#1E6E8C";
              return (
                <div key={i} className="w-[130px] shrink-0">
                  <div
                    className="relative h-[150px] overflow-hidden rounded-[10px]"
                    style={{ borderTop: `3px solid ${color}` }}
                  >
                    {a.photo_url ? (
                      <Image
                        src={asset(a.photo_url)}
                        alt={a.full_name}
                        fill
                        className="object-cover object-top"
                        sizes="130px"
                      />
                    ) : (
                      <Monogram
                        name={a.full_name}
                        color={color}
                        className="h-full w-full"
                      />
                    )}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg,transparent 45%,rgba(10,26,47,.92))",
                      }}
                    />
                    <div className="absolute bottom-1.5 left-2 right-2">
                      <div className="font-display text-[13px] font-600 uppercase leading-none text-white">
                        {a.first_name}
                      </div>
                      <div className="text-[10px] text-white/60">
                        {sport?.label ?? a.sport}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Cómo se reparte ── */}
        <section className="mx-auto max-w-[1180px] px-4 pb-8 pt-16 sm:px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="eyebrow text-gold">Transparente</p>
              <h2 className="mt-2 font-display text-4xl font-700 uppercase leading-[.95] tracking-tight sm:text-[46px]">
                Cómo se reparte tu aporte
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div
                  className="rounded-xl border border-white/[.07] p-8"
                  style={{
                    background: "#0d2238",
                    borderTop: `3px solid ${s.color}`,
                  }}
                >
                  <div
                    className="mb-3.5 font-display text-[38px] font-700 leading-none"
                    style={{ color: s.color }}
                  >
                    {s.n}
                  </div>
                  <h3 className="mb-2.5 font-display text-[21px] font-600 uppercase leading-[1.05] text-white">
                    {s.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-white/65">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Widget de aporte ── */}
        <section id="widget" className="mx-auto max-w-[1080px] px-4 py-14 sm:px-6">
          <Reveal>
            <div
              className="grid grid-cols-1 gap-11 rounded-[18px] border border-gold/30 p-8 sm:p-11 lg:grid-cols-2"
              style={{ background: "linear-gradient(135deg,#102a44,#0b1f34)" }}
            >
              {/* Left: info + checklist */}
              <div className="flex flex-col justify-center">
                <p className="eyebrow mb-3 text-gold">El fondo colectivo</p>
                <h2 className="font-display text-[38px] font-700 uppercase leading-[.95] text-white">
                  Elegí cuánto<br />poner
                </h2>
                <p className="mt-5 text-[16px] leading-relaxed text-white/70">
                  Tu aporte se suma al de toda la comunidad y se divide en
                  partes iguales entre todos los atletas registrados. El{" "}
                  <strong className="text-white">93% va a ellos.</strong>
                </p>
                <ul className="mt-6 space-y-3">
                  {CHECKLIST.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[14px] text-white/75">
                      <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-600 text-gold"
                        style={{ background: "rgba(201,162,39,.16)" }}
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: DonationWidget */}
              <div>
                <DonationWidget
                  target={{
                    kind: "all",
                    title: "Apoyá a todos",
                    splitCount: athleteCount,
                  }}
                />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Impacto colectivo ── */}
        <section className="mx-auto max-w-[1080px] px-4 pb-12 sm:px-6">
          <Reveal>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-display text-[40px] font-700 leading-none text-gold sm:text-[44px]">
                  {supporterTotal.toLocaleString("es-AR")}
                </div>
                <div className="mt-1 text-[14px] text-white/60">personas en el fondo</div>
              </div>
              <div>
                <div className="font-display text-[40px] font-700 leading-none sm:text-[44px]">
                  {athleteCount}
                </div>
                <div className="mt-1 text-[14px] text-white/60">atletas que reciben</div>
              </div>
              <div>
                <div className="font-display text-[40px] font-700 leading-none sm:text-[44px]">
                  {formatMoney(totalRaised)}
                </div>
                <div className="mt-1 text-[14px] text-white/60">repartido hasta hoy</div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── DS Connect ── */}
        <section className="mx-auto max-w-[1080px] px-4 pb-20 pt-4 sm:px-6">
          <Reveal>
            <div className="text-center">
              <p className="eyebrow text-white/40">Con el apoyo de</p>
              <div className="mt-5 flex items-center justify-center gap-9">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset("/logos/ds-connect.png")}
                  alt="DS Connect"
                  className="h-10 w-auto opacity-80 transition hover:opacity-100"
                />
              </div>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  );
}
