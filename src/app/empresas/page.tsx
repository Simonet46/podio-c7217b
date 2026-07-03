import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { CompanyContactForm } from "@/components/CompanyContactForm";
import { getAthletes } from "@/lib/data/athletes";
import { getSport } from "@/config/sports";
import { asset, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Empresas impulsoras — ${SITE.brand}`,
  description:
    "Tu empresa puede impulsar el deporte argentino: carreras deportivas reales, con transparencia total e informes de impacto. No vendemos publicidad, construimos comunidad.",
};

const BENEFITS = [
  {
    color: "#0072CE",
    icon: "🏃",
    title: "Carreras, no campañas",
    text: "Tu aporte le da tranquilidad a un atleta para entrenar, viajar y competir. No financiás publicidad: impulsás una carrera deportiva real.",
  },
  {
    color: "#C9A227",
    icon: "🇦🇷",
    title: "Orgullo que se comparte",
    text: "Tu equipo sabe que la empresa impulsa el deporte argentino. Un orgullo que se vive puertas adentro y se cuenta puertas afuera.",
  },
  {
    color: "#009F3D",
    icon: "🔍",
    title: "Transparencia total",
    text: "Sabés exactamente adónde va cada peso. Los aportes llegan directo al atleta y vos recibís informes claros del impacto que generás.",
  },
];

const RECIBE = [
  {
    icon: "📊",
    title: "Informes de impacto",
    text: "Reportes periódicos: a quiénes impulsaste, qué lograron y qué viene.",
  },
  {
    icon: "🧾",
    title: "Transparencia de aportes",
    text: "El detalle de cómo se distribuyó cada peso que aportó tu empresa.",
  },
  {
    icon: "📖",
    title: "Historias reales",
    text: "El detrás de escena de los atletas que tu empresa acompaña.",
  },
  {
    icon: "🏅",
    title: "Certificado de Empresa Impulsora",
    text: "El reconocimiento oficial de GRANITO a las empresas que empujan.",
  },
  {
    icon: "📈",
    title: "Métricas claras",
    text: "Números concretos de tu impacto: atletas, disciplinas, competencias.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Contanos",
    text: "Tu empresa, tus valores y cómo te gustaría impulsar el deporte argentino.",
  },
  {
    n: "02",
    title: "Definimos juntos",
    text: "Un atleta, una disciplina o un proyecto deportivo. El alcance lo elegís vos.",
  },
  {
    n: "03",
    title: "Tu aporte llega directo",
    text: "Sin intermediarios: el dinero va a la cuenta del atleta. Nosotros no custodiamos fondos.",
  },
  {
    n: "04",
    title: "Ves el impacto",
    text: "Informes, historias y métricas de lo que tu empresa hizo posible.",
  },
];

export default async function EmpresasPage() {
  const athletes = await getAthletes();
  const gridAthletes = athletes.filter((a) => a.photo_url).slice(0, 4);

  return (
    <>
      <Header />
      <main className="overflow-x-hidden bg-ink text-white">

        {/* ── HERO ── */}
        <section className="relative">
          <div
            className="pointer-events-none absolute -left-[120px] top-[-40px] h-[520px] w-[520px]"
            style={{ background: "radial-gradient(circle,rgba(201,162,39,.16),transparent 70%)" }}
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-6 pb-14 pt-20 lg:grid-cols-[1.05fr_.95fr]">
            {/* Texto */}
            <div>
              <Reveal>
                <div className="mb-6 inline-flex items-center gap-2.5">
                  <span className="podio-pulse h-2 w-2 rounded-full bg-gold" aria-hidden />
                  <span className="eyebrow text-gold">Empresas impulsoras</span>
                </div>
                <h1 className="font-display text-[54px] font-700 uppercase leading-[.92] tracking-tight sm:text-[68px] lg:text-[76px]">
                  Impulsá el<br />deporte<br />
                  <span className="text-gold">argentino</span>
                </h1>
                <p className="mt-6 max-w-[480px] text-[19px] leading-relaxed text-white/70">
                  No te vendemos publicidad. Te invitamos a formar parte de una
                  comunidad que ayuda a deportistas argentinos a desarrollar su
                  carrera con menos preocupaciones económicas.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-8 flex flex-wrap gap-3.5">
                  <a
                    href="#contacto"
                    className="rounded-md bg-gold px-7 py-4 font-display text-base font-700 uppercase tracking-[.04em] text-ink transition-transform hover:-translate-y-0.5"
                  >
                    Quiero impulsar
                  </a>
                  <a
                    href="#como-funciona"
                    className="rounded-md border border-white/25 px-7 py-4 font-display text-base font-500 uppercase tracking-[.04em] text-white transition-all hover:border-white hover:-translate-y-0.5"
                  >
                    Cómo funciona
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Certificado de Empresa Impulsora (visual) */}
            <Reveal delay={120}>
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-full max-w-[420px] rounded-[16px] p-8 text-center"
                  style={{
                    background: "linear-gradient(160deg,#12283f,#0d2238)",
                    border: "1px solid rgba(201,162,39,.35)",
                    boxShadow: "0 30px 70px rgba(0,0,0,.5)",
                  }}
                >
                  <div
                    className="mx-auto mb-5 h-[10px] w-32 rounded-[3px]"
                    style={{ background: "linear-gradient(90deg,#0072CE 0 20%,#F4C300 20% 40%,#1A1A1A 40% 60%,#009F3D 60% 80%,#DF0024 80% 100%)" }}
                    aria-hidden
                  />
                  <div className="eyebrow text-white/50">GRANITO certifica que</div>
                  <div
                    className="mx-auto my-4 flex h-[64px] w-[150px] items-center justify-center rounded-lg text-[13px] text-white/40"
                    style={{ border: "1px dashed rgba(255,255,255,.25)" }}
                  >
                    Tu empresa
                  </div>
                  <div className="font-display text-[24px] font-700 uppercase leading-[1.05] text-gold">
                    es Empresa Impulsora<br />del deporte argentino
                  </div>
                  <p className="mt-4 text-[13px] leading-relaxed text-white/55">
                    Impulsa carreras deportivas reales, con transparencia
                    total y de la mano de una comunidad fundada por atletas.
                  </p>
                </div>
                <div className="eyebrow text-gold">Impacto, no exposición</div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── POR QUÉ GRANITO ── */}
        <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-20">
          <Reveal className="mb-12 text-center">
            <div className="eyebrow mb-2.5 text-gold">Por qué GRANITO</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              Impacto que se puede ver
            </h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 90}>
                <div
                  className="rounded-xl p-8"
                  style={{
                    background: "#0d2238",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderTop: `3px solid ${b.color}`,
                  }}
                >
                  <div className="mb-4 text-[32px]">{b.icon}</div>
                  <h3 className="mb-2.5 font-display text-[23px] font-600 uppercase leading-[1.05]">
                    {b.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-white/65">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── QUÉ RECIBE TU EMPRESA ── */}
        <section className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
          <Reveal className="mb-12 text-center">
            <div className="eyebrow mb-2.5 text-gold">Qué recibe tu empresa</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              No branding. Impacto.
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {RECIBE.map((r, i) => (
              <Reveal key={r.title} delay={i * 70}>
                <div
                  className="h-full rounded-xl p-7"
                  style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.07)" }}
                >
                  <div className="mb-3 text-[28px]">{r.icon}</div>
                  <h3 className="mb-2 font-display text-[19px] font-600 uppercase leading-[1.1]">
                    {r.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-white/60">{r.text}</p>
                </div>
              </Reveal>
            ))}
            {/* Cierre de la grilla: la filosofía */}
            <Reveal delay={350}>
              <div
                className="flex h-full items-center rounded-xl p-7"
                style={{
                  background: "linear-gradient(160deg,rgba(201,162,39,.14),rgba(201,162,39,.05))",
                  border: "1px solid rgba(201,162,39,.3)",
                }}
              >
                <p className="font-display text-[19px] font-600 uppercase leading-[1.25] text-gold">
                  Lo que no vas a encontrar: logos en camisetas, banners ni
                  publicidad. Eso no es GRANITO.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section id="como-funciona" className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
          <Reveal className="mb-14 text-center">
            <div className="eyebrow mb-2.5 text-gold">Cómo funciona</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              Impulsar es simple
            </h2>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div>
                  <div className="mb-3.5 font-display text-[42px] font-700 leading-none text-gold">
                    {s.n}
                  </div>
                  <h3 className="mb-2 font-display text-[20px] font-600 uppercase leading-[1.05]">
                    {s.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-white/60">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link
              href="/transparencia"
              className="font-display text-sm font-600 uppercase tracking-wide text-celeste hover:underline"
            >
              Cómo se distribuyen los aportes → Transparencia
            </Link>
          </Reveal>
        </section>

        {/* ── A QUIÉNES IMPULSÁS ── */}
        {gridAthletes.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-16">
            <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="eyebrow mb-2.5 text-gold">Personas, no activos</div>
                <h2 className="font-display text-[44px] font-700 uppercase leading-[.95] tracking-tight">
                  A quiénes impulsás
                </h2>
              </div>
              <span className="text-[14px] text-white/50">
                Cada perfil es una carrera deportiva real, revisada a mano
              </span>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {gridAthletes.map((a, i) => {
                const sport = getSport(a.sport);
                return (
                  <Reveal key={a.id} delay={i * 70}>
                    <Link
                      href={`/atleta/${a.slug}`}
                      className="group block overflow-hidden rounded-xl"
                      style={{
                        background: "#0d2238",
                        border: "1px solid rgba(255,255,255,.06)",
                        boxShadow: "0 18px 44px rgba(0,0,0,.4)",
                      }}
                    >
                      <div className="relative h-[230px]">
                        <Image
                          src={asset(a.photo_url!)}
                          alt={a.full_name}
                          fill
                          sizes="(max-width: 640px) 100vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{ background: "linear-gradient(180deg,transparent 42%,rgba(13,34,56,.96))" }}
                        />
                        <div
                          className="absolute left-3 top-3 rounded-[3px] px-2.5 py-1 font-display text-[10px] font-600 uppercase tracking-[.1em] text-white"
                          style={{ background: sport?.color ?? "#1E6E8C" }}
                        >
                          {sport?.label ?? a.sport}
                        </div>
                        <div className="absolute bottom-3 left-3.5 right-3.5">
                          <div className="font-display text-[20px] font-600 uppercase leading-none">
                            {a.full_name}
                          </div>
                          <div className="mt-0.5 text-[12px] text-white/65">
                            {a.city}, {a.province}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            <Reveal className="mt-8 text-center">
              <Link
                href="/#atletas"
                className="font-display text-sm font-600 uppercase tracking-wide text-celeste hover:underline"
              >
                Conocé a todos los atletas →
              </Link>
            </Reveal>
          </section>
        )}

        {/* ── FORMULARIO ── */}
        <section id="contacto" className="mx-auto max-w-[1000px] px-6 pb-24 pt-16">
          <Reveal>
            <div
              className="grid gap-12 rounded-[18px] p-8 lg:grid-cols-2 lg:p-12"
              style={{
                background: "linear-gradient(135deg,#102a44,#0b1f34)",
                border: "1px solid rgba(201,162,39,.28)",
              }}
            >
              {/* Lado info */}
              <div>
                <div className="eyebrow mb-3 text-gold">Hablemos</div>
                <h2 className="font-display text-[40px] font-700 uppercase leading-[.95] tracking-tight">
                  Sumate como empresa impulsora
                </h2>
                <p className="mt-4 text-[16px] leading-relaxed text-white/70">
                  Contanos de tu empresa y cómo te gustaría impulsar el deporte
                  argentino. Armamos juntos la forma que mejor encaje — un
                  atleta, una disciplina o un proyecto.
                </p>
                <div className="mt-6 flex flex-col gap-3.5">
                  {[
                    "Respuesta del equipo fundador en 48 hs",
                    "El aporte llega directo al atleta",
                    "Informes de impacto y transparencia total",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-[14px] text-white/75"
                    >
                      <span
                        className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg font-600"
                        style={{ background: "rgba(201,162,39,.16)" }}
                      >
                        ✓
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <CompanyContactForm />
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  );
}
