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
    title: "Apoyás a todos los atletas",
    text: "Tu marca impulsa a toda la comunidad de atletas argentinos de GRANITO. No financiás publicidad: sostenés carreras deportivas reales.",
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
    text: "Sabés exactamente adónde va tu aporte. Sostenés la plataforma que impulsa a los atletas y recibís informes claros del impacto que generás.",
  },
];

const NIVELES = [
  {
    nombre: "Empresa Impulsora",
    precio: "$600.000",
    equivale: "Equivale al aporte de 60 hinchas",
    cupos: "Solo 3 lugares",
    anual: "Convenio anual: $6.000.000 — 2 meses bonificados y precio congelado",
    destacado: true,
    beneficios: [
      "Logo grande en la home y en todo el sitio",
      "Certificado físico y digital de Empresa Impulsora",
      "Informe de impacto trimestral, personalizado con tu nombre",
      "2 posteos dedicados por año en nuestras redes",
      "Contacto directo con los fundadores e invitación a competencias",
      "Las primeras 3 llevan la insignia «Impulsora fundadora» a perpetuidad",
    ],
  },
  {
    nombre: "Empresa Sponsor",
    precio: "$150.000",
    equivale: "Equivale al aporte de 15 hinchas",
    cupos: "12 lugares",
    anual: "Convenio anual: $1.500.000 — 2 meses bonificados y precio congelado",
    destacado: false,
    beneficios: [
      "Logo en la franja de empresas de todo el sitio",
      "Certificado digital de Empresa Sponsor",
      "Informe de impacto semestral",
      "Mención grupal trimestral en redes",
      "Las primeras 5 llevan la insignia «Sponsor fundador»",
    ],
  },
];

const CONDICIONES = [
  "Permanencia mínima de 6 meses: el compromiso que hace creíble llamarse impulsora.",
  "El precio se revisa cada trimestre. El convenio anual prepago lo congela.",
  "Si una empresa deja de aportar, su logo baja del sitio a fin de mes. Sin excepciones: todos los logos que ves están aportando hoy.",
  "Factura por servicio de promoción y patrocinio.",
];

const STEPS = [
  {
    n: "01",
    title: "Contanos",
    text: "Tu empresa, tus valores y cómo te gustaría impulsar el deporte argentino.",
  },
  {
    n: "02",
    title: "Firmamos el convenio",
    text: "Tu empresa se suma como Empresa Impulsora de GRANITO: apoya a todos los atletas y aparece en nuestra web.",
  },
  {
    n: "03",
    title: "Impulsás a toda la comunidad",
    text: "Tu aporte sostiene la plataforma y potencia a todos los atletas argentinos que impulsamos.",
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
                    href="#niveles"
                    className="rounded-md border border-white/25 px-7 py-4 font-display text-base font-500 uppercase tracking-[.04em] text-white transition-all hover:border-white hover:-translate-y-0.5"
                  >
                    Niveles y montos
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

        {/* ── NIVELES Y MONTOS ── */}
        <section id="niveles" className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
          <Reveal className="mb-4 text-center">
            <div className="eyebrow mb-2.5 text-gold">Niveles y montos</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              Dos formas de empujar
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-white/65">
              Los aportes de las empresas sostienen la estructura de GRANITO.
              Gracias a eso, el 93% del aporte de cada hincha llega directo al
              atleta.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {NIVELES.map((n, i) => (
              <Reveal key={n.nombre} delay={i * 90}>
                <div
                  className="relative h-full rounded-[16px] p-8"
                  style={
                    n.destacado
                      ? {
                          background: "linear-gradient(160deg,#12283f,#0d2238)",
                          border: "1px solid rgba(201,162,39,.45)",
                          boxShadow: "0 30px 70px rgba(0,0,0,.45)",
                        }
                      : {
                          background: "#0d2238",
                          border: "1px solid rgba(255,255,255,.1)",
                        }
                  }
                >
                  <div
                    className="absolute right-6 top-6 rounded-[4px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[.08em]"
                    style={
                      n.destacado
                        ? { background: "rgba(201,162,39,.18)", color: "#E4C76A" }
                        : { background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)" }
                    }
                  >
                    {n.cupos}
                  </div>
                  <h3 className="font-display text-[26px] font-700 uppercase leading-[1.02]">
                    {n.nombre}
                  </h3>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span
                      className={`font-display text-[46px] font-700 leading-none ${n.destacado ? "text-gold" : "text-white"}`}
                    >
                      {n.precio}
                    </span>
                    <span className="text-[15px] text-white/55">/ mes</span>
                  </div>
                  <div className="mt-1.5 text-[14px] text-celeste">{n.equivale}</div>
                  <ul className="mt-6 flex flex-col gap-3">
                    {n.beneficios.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-[14px] leading-snug text-white/75">
                        <span
                          className="mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-[10px]"
                          style={{
                            background: n.destacado ? "rgba(201,162,39,.18)" : "rgba(255,255,255,.08)",
                            color: n.destacado ? "#E4C76A" : "rgba(255,255,255,.7)",
                          }}
                        >
                          ✓
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="mt-6 rounded-lg px-4 py-3 text-[13px] leading-snug text-white/60"
                    style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
                  >
                    {n.anual}
                  </div>
                  <a
                    href="#contacto"
                    className={`mt-6 block rounded-md py-3.5 text-center font-display text-[15px] font-700 uppercase tracking-[.04em] transition-transform hover:-translate-y-0.5 ${
                      n.destacado
                        ? "bg-gold text-ink"
                        : "border border-white/25 text-white hover:border-white"
                    }`}
                  >
                    Quiero ser {n.nombre.toLowerCase()}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Condiciones + filosofía */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Reveal delay={120}>
              <div
                className="h-full rounded-xl p-7"
                style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.07)" }}
              >
                <h3 className="mb-4 font-display text-[18px] font-600 uppercase tracking-wide text-white/85">
                  Reglas claras, para los dos lados
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {CONDICIONES.map((c) => (
                    <li key={c} className="flex items-start gap-3 text-[14px] leading-relaxed text-white/60">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-celeste" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div
                className="flex h-full items-center rounded-xl p-7"
                style={{
                  background: "linear-gradient(160deg,rgba(201,162,39,.14),rgba(201,162,39,.05))",
                  border: "1px solid rgba(201,162,39,.3)",
                }}
              >
                <p className="font-display text-[19px] font-600 uppercase leading-[1.25] text-gold">
                  Lo que ningún nivel compra: logos en camisetas ni en perfiles
                  de atletas, y ninguna empresa elige a quién va la plata. Eso
                  protege a los atletas.
                </p>
              </div>
            </Reveal>

            {/* Aclaración legal: propuesta en diseño, no oferta contractual */}
            <p className="mt-6 text-center text-[12px] leading-relaxed text-white/40">
              Montos y beneficios orientativos de una propuesta comercial en etapa
              de diseño: no constituyen oferta contractual. Todo acuerdo se
              formaliza por convenio escrito.
            </p>
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
                  argentino. Sumás tu marca como Empresa Impulsora de GRANITO:
                  aparecés en nuestra web apoyando a todos los atletas.
                </p>
                <div className="mt-6 flex flex-col gap-3.5">
                  {[
                    "Respuesta del equipo fundador en 48 hs",
                    "Tu marca visible como Empresa Impulsora",
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
