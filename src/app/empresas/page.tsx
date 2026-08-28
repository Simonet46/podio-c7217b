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
    "Tu marca impulsa el programa que sostiene al deporte argentino: contrato de patrocinio publicitario, un porcentaje comprometido al Fondo Granito y reportes de lo que se hizo con cada peso.",
};

const BENEFITS = [
  {
    color: "#0072CE",
    icon: "🏃",
    title: "Reputación con prueba",
    text: "Tu marca se asocia al esfuerzo de deportistas reales, con el monto exacto que destinaste al Fondo, en qué se gastó y qué resultados habilitó. Con comprobantes, no con adjetivos.",
  },
  {
    color: "#C9A227",
    icon: "🎥",
    title: "Contenido propio",
    text: "Piezas audiovisuales producidas con un periodista de aire nacional, cedidas para que las uses en tus canales. Producirlas por fuera cuesta lo mismo o más.",
  },
  {
    color: "#009F3D",
    icon: "🧾",
    title: "Encuadre publicitario",
    text: "Contrato de patrocinio con contraprestación real y documentada, factura y reportes. No una donación suelta de tratamiento incierto.",
  },
];

const FORMATOS = [
  {
    color: "#0072CE",
    tag: "Bloque de apertura",
    title: "La ficha",
    text: "La presentación del protagonista: nombre, disciplina, objetivo de la temporada y en qué instancia está.",
  },
  {
    color: "#C9A227",
    tag: "Bloque de cierre",
    title: "Lo que falta",
    text: "El deportista dice, con números concretos, qué necesita para llegar a la próxima competencia: el pasaje, la inscripción, el equipamiento, los meses de entrenador.",
  },
  {
    color: "#009F3D",
    tag: "Episodio especial",
    title: "La respuesta",
    text: "El momento en que el deportista se entera de que el Fondo va a cubrir lo que pidió. La reacción, filmada. Cómo y dónde se graba lo define cada caso, con el deportista.",
  },
];

const MARCAS = [
  {
    nombre: "Oro",
    alcance: "Deportistas individuales y proyectos de equipo",
    destacado: true,
    text: "Naming del ciclo, patrocinio del bloque de cierre «Lo que falta», cuatro episodios «La respuesta» al año, exclusividad de rubro y reporte trimestral.",
  },
  {
    nombre: "Plata",
    alcance: "Proyectos de equipo y entidades deportivas",
    destacado: false,
    text: "Patrocinio del bloque de apertura «La ficha», presencia en la home y reporte semestral.",
  },
  {
    nombre: "Bronce",
    alcance: "Proyectos de equipo y entidades deportivas",
    destacado: false,
    text: "Naming de cuatro episodios del año, presencia en el sitio y reporte anual.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tu marca se suma",
    text: "Firmás un contrato de patrocinio publicitario con GRANITO, con factura y contraprestación documentada. Es un gasto de marketing como cualquier otro, con la diferencia de que se puede mostrar.",
  },
  {
    n: "02",
    title: "Una parte va al Fondo Granito",
    text: "Un porcentaje comprometido y auditable de tu aporte se destina al Fondo Granito. No es una promesa: está escrito en el contrato y se informa en cada reporte.",
  },
  {
    n: "03",
    title: "El Fondo llega a los deportistas",
    text: "Cada trimestre el Fondo asigna a deportistas y proyectos que lo necesitan, y paga contra comprobante: el pasaje, la inscripción, el equipamiento. Nunca transferencias sueltas.",
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
                  Tu marca puede ser la razón por la que una atleta llegue al
                  clasificatorio. Nosotros lo documentamos: quién compitió, con
                  qué, y qué consiguió. Vos tenés la historia para contarlo.
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
                    Las categorías
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
                    Impulsa el programa que sostiene a deportistas argentinos,
                    con reportes de lo que hizo posible cada peso.
                  </p>
                </div>
                <div className="eyebrow text-gold">Impacto documentado</div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section id="como-funciona" className="mx-auto max-w-[1180px] px-6 pb-10 pt-20">
          <Reveal className="mb-12 text-center">
            <div className="eyebrow mb-2.5 text-gold">Cómo entra el aporte</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              Cómo funciona
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[16px] leading-relaxed text-white/65">
              Tu empresa no le transfiere dinero a un deportista. Impulsa el
              programa que lo sostiene. Es una diferencia importante: define el
              encuadre del gasto y evita cualquier vínculo directo entre la
              marca y una persona.
            </p>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
          <Reveal delay={120}>
            <div
              className="mt-10 flex items-center rounded-xl p-7"
              style={{
                background: "linear-gradient(160deg,rgba(201,162,39,.14),rgba(201,162,39,.05))",
                border: "1px solid rgba(201,162,39,.3)",
              }}
            >
              <p className="font-display text-[19px] font-600 uppercase leading-[1.25] text-gold">
                Lo que comprometemos es un monto al Fondo, no una lista de
                beneficiarios.
              </p>
            </div>
          </Reveal>
          <Reveal className="mt-10 text-center">
            <Link
              href="/transparencia"
              className="font-display text-sm font-600 uppercase tracking-wide text-celeste hover:underline"
            >
              Cómo se distribuyen los aportes → Transparencia
            </Link>
          </Reveal>
        </section>

        {/* ── LOS QUE MÁS LO NECESITAN ── */}
        <section className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
          <Reveal className="mb-8">
            <div className="eyebrow mb-2.5 text-gold">Por qué los deportistas individuales</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              Los que más lo necesitan
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
              <div className="flex flex-col gap-5 text-[17px] leading-relaxed text-white/70">
                <p>
                  Un club tiene socios, cuota y a veces sponsors. Un deportista
                  individual no tiene nada de eso. Paga su entrenador, sus
                  pasajes y su inscripción con lo que consigue, y cuando no
                  consigue, no compite.
                </p>
                <p>
                  No abandonan porque llegaron a su techo deportivo. Abandonan
                  porque se les acabó la plata, muchas veces por montos que para
                  una empresa son insignificantes.
                </p>
              </div>
              <div
                className="flex items-center rounded-xl p-7"
                style={{
                  background: "linear-gradient(160deg,rgba(201,162,39,.14),rgba(201,162,39,.05))",
                  border: "1px solid rgba(201,162,39,.3)",
                }}
              >
                <p className="font-display text-[19px] font-600 uppercase leading-[1.25] text-gold">
                  Ahí es donde un aporte chico cambia una temporada entera.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── QUÉ RECIBE TU MARCA ── */}
        <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-16">
          <Reveal className="mb-12 text-center">
            <div className="eyebrow mb-2.5 text-gold">Qué recibe tu marca</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              Tres cosas, no una
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
          <p className="mx-auto mt-6 max-w-[760px] text-center text-[12px] leading-relaxed text-white/40">
            El ciclo audiovisual es lo que permite estructurar el aporte como
            patrocinio y no como donación a persona física. Cada empresa debe
            validar el tratamiento con su asesor impositivo.
          </p>
        </section>

        {/* ── EL CICLO AUDIOVISUAL ── */}
        <section className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
          <Reveal className="mb-12 text-center">
            <div className="eyebrow mb-2.5 text-gold">El ciclo audiovisual</div>
            <h2 className="font-display text-[44px] font-700 uppercase leading-[.95] tracking-tight">
              Las historias, contadas en video
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[16px] leading-relaxed text-white/65">
              Cada historia de la plataforma se convierte en un episodio: quién
              es, qué compite, qué le falta y qué pasa cuando alguien lo banca.
              Lo conduce un periodista con experiencia en aire nacional y se
              publica en YouTube y en formato corto para redes.
            </p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {FORMATOS.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div
                  className="h-full rounded-xl p-8"
                  style={{
                    background: "#0d2238",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderTop: `3px solid ${f.color}`,
                  }}
                >
                  <div className="eyebrow mb-3 text-white/45">{f.tag}</div>
                  <h3 className="mb-2.5 font-display text-[23px] font-600 uppercase leading-[1.05]">
                    {f.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-white/65">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-center text-[14px] text-white/50">
            [COMPLETAR: link a los episodios ya publicados]
          </p>
        </section>

        {/* ── CATEGORÍA BASE ── */}
        <section id="niveles" className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
          <Reveal className="mb-4 text-center">
            <div className="eyebrow mb-2.5 text-gold">La puerta de entrada</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              Categoría Base
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <div
              className="mx-auto mt-8 max-w-[760px] rounded-[16px] p-8 lg:p-10"
              style={{
                background: "linear-gradient(160deg,#12283f,#0d2238)",
                border: "1px solid rgba(201,162,39,.45)",
                boxShadow: "0 30px 70px rgba(0,0,0,.45)",
              }}
            >
              <p className="text-[16px] leading-relaxed text-white/75">
                Para empresas que quieren empezar sin un compromiso grande. Tu
                aporte mensual va al Fondo Granito y se asigna a deportistas y
                proyectos por convocatoria trimestral, igual que el de las
                demás categorías.
              </p>
              <p className="mt-4 text-[16px] leading-relaxed text-white/75">
                Aparecés en la web como empresa impulsora y recibís el reporte
                de lo que se hizo con tu aporte. No incluye presencia en el
                ciclo audiovisual: eso empieza en Bronce.
              </p>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-[15px] text-white/55">Desde</span>
                <span className="font-display text-[46px] font-700 leading-none text-gold">
                  $300.000
                </span>
                <span className="text-[15px] text-white/55">/ mes</span>
              </div>
              <div className="mt-1.5 text-[14px] text-celeste">
                El monto se revisa cada trimestre
              </div>
              <a
                href="#contacto"
                className="mt-8 block rounded-md bg-gold py-3.5 text-center font-display text-[15px] font-700 uppercase tracking-[.04em] text-ink transition-transform hover:-translate-y-0.5"
              >
                Escribinos
              </a>
            </div>
          </Reveal>
        </section>

        {/* ── EL PROGRAMA DE MARCAS ── */}
        <section className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
          <Reveal className="mb-4 text-center">
            <div className="eyebrow mb-2.5 text-gold">Categorías</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              El programa de marcas
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[16px] leading-relaxed text-white/65">
              Para marcas que quieren un rol protagónico. Mismo mecanismo que
              la categoría Base —un porcentaje comprometido y auditable de tu
              aporte va al Fondo Granito— y además tu marca acompaña el ciclo
              audiovisual donde se cuentan las historias. Cualquiera de las
              cuatro categorías te reconoce públicamente como empresa impulsora
              de GRANITO.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {MARCAS.map((m, i) => (
              <Reveal key={m.nombre} delay={i * 90}>
                <div
                  className="relative h-full rounded-[16px] p-8"
                  style={
                    m.destacado
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
                  <h3 className="font-display text-[26px] font-700 uppercase leading-[1.02]">
                    {m.nombre}
                  </h3>
                  <div className="mt-2 text-[13px] leading-snug text-white/50">
                    {m.alcance}
                  </div>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span
                      className={`font-display text-[30px] font-700 leading-none ${m.destacado ? "text-gold" : "text-white"}`}
                    >
                      A consultar
                    </span>
                  </div>
                  <p className="mt-6 text-[14px] leading-relaxed text-white/70">
                    {m.text}
                  </p>
                  <a
                    href="#contacto"
                    className={`mt-8 block rounded-md py-3.5 text-center font-display text-[15px] font-700 uppercase tracking-[.04em] transition-transform hover:-translate-y-0.5 ${
                      m.destacado
                        ? "bg-gold text-ink"
                        : "border border-white/25 text-white hover:border-white"
                    }`}
                  >
                    Pedir la propuesta
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Reveal delay={120}>
              <div
                className="h-full rounded-xl p-7"
                style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.07)" }}
              >
                <h3 className="mb-4 font-display text-[18px] font-600 uppercase tracking-wide text-white/85">
                  Montos y condiciones a consultar
                </h3>
                <p className="text-[14px] leading-relaxed text-white/60">
                  Cada ronda te presentamos los casos ya evaluados y puntuados
                  por el comité, y elegimos juntos cuáles acompañar. La
                  resolución formal, el acta y el veto quedan del lado del
                  comité: eso es lo que mantiene tu aporte como patrocinio del
                  programa y no como pago a una persona. La exclusividad de
                  rubro se asigna al primer acuerdo Oro firmado en cada
                  categoría de negocio. La propuesta completa —calendario de
                  contenidos, porcentaje comprometido al Fondo, cesión del
                  contenido y régimen de reportes— la mandamos por mail.
                </p>
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
                  Te proponemos los casos y elegimos juntos a quién acompañar.
                  La resolución la firma un comité con un integrante externo.
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

        {/* ── POR QUÉ AHORA ── */}
        <section className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
          <Reveal className="mb-8">
            <div className="eyebrow mb-2.5 text-gold">Por qué ahora</div>
            <h2 className="font-display text-[44px] font-700 uppercase leading-[.95] tracking-tight">
              Este lugar lo ocupa una sola marca por rubro
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <div className="flex max-w-[760px] flex-col gap-5 text-[17px] leading-relaxed text-white/70">
              <p>
                El deporte olímpico y federado argentino no tiene hoy una marca
                que lo acompañe de forma sistemática y documentada. Es un
                territorio libre, y los territorios libres se ocupan una sola
                vez.
              </p>
              <p>
                Las primeras empresas que se suman quedan reconocidas de forma
                permanente como fundadoras del programa.
              </p>
            </div>
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
                  ¿Hablamos?
                </h2>
                <p className="mt-4 text-[16px] leading-relaxed text-white/70">
                  Contanos qué busca tu marca y te preparamos una propuesta
                  concreta en una semana. Si querés ver antes cómo se ve el
                  contenido, te mandamos los episodios que ya grabamos.
                </p>
                <div className="mt-6 flex flex-col gap-3.5">
                  {[
                    "Propuesta concreta en una semana",
                    "Te mandamos los episodios ya grabados",
                    "Contrato, factura y reportes documentados",
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
                <p className="mt-6 text-[15px] leading-relaxed text-white/60">
                  [COMPLETAR: nombre · cargo · mail · teléfono]
                </p>
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
