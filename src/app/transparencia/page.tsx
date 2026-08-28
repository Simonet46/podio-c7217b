import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { PLATFORM_FEE_RATE, SITE } from "@/config/site";
import { LEGAL_DATA_COMPLETE, EN_FORMACION } from "@/config/legal";

export const metadata: Metadata = {
  title: `Transparencia — ${SITE.brand}`,
  description:
    "Cómo funciona GRANITO, cómo se distribuyen los aportes y cómo verificamos a cada atleta. Cada peso tiene un camino claro.",
};

const FAQ = [
  ...(!LEGAL_DATA_COMPLETE
    ? [{ q: EN_FORMACION.transparenciaQ, a: EN_FORMACION.transparenciaA }]
    : []),
  {
    q: "¿Cómo sé que el atleta recibe el dinero?",
    a: "Porque tu aporte nunca pasa por nuestras manos. Cuando aportás, Mercado Pago lo acredita directamente en la cuenta del atleta: no podríamos quedarnos con él ni queriendo. Los aportes de empresas al Fondo Granito siguen otro camino, que explicamos más arriba.",
  },
  {
    q: "¿Cómo verifican que un atleta es quien dice ser?",
    a: "Tres capas. Revisamos cada postulación a mano, una por una. El atleta conecta su propia cuenta de Mercado Pago, cuya identidad ya fue validada por MP con DNI y verificación facial. Y cruzamos el DNI que declaró en su postulación contra el de su cuenta de MP: si no coinciden, no se aprueban pagos.",
  },
  {
    q: "¿Quién puede postularse?",
    a: "Cualquier deportista argentino: del alto rendimiento al juvenil que la pelea en el club del barrio. No hay costo de postulación. Cada caso lo evalúa el equipo fundador.",
  },
  {
    q: "¿Los atletas pueden editar su perfil libremente?",
    a: "No. Cada cambio que un atleta quiere hacer en su perfil público (foto, historia, mensaje a la comunidad) pasa por la revisión del equipo de GRANITO antes de publicarse. Lo que ves en la web está moderado.",
  },
  {
    q: "¿Qué es el Fondo Granito?",
    a: "Es el presupuesto que se arma con un porcentaje comprometido y auditable de lo que aportan las empresas que patrocinan a GRANITO. No se reparte entre todos: se asigna por convocatoria trimestral, caso por caso, y se paga contra comprobante. Es la única plata que administramos, y se informa en cada reporte.",
  },
  {
    q: "¿De qué vive GRANITO?",
    a: `De dos cosas. De una comisión del ${Math.round(PLATFORM_FEE_RATE * 100)}% sobre cada aporte del público, que retiene Mercado Pago automáticamente al momento del pago. Y de los contratos de patrocinio que firman las empresas, de los cuales un porcentaje comprometido va al Fondo Granito y el resto sostiene la plataforma y el ciclo audiovisual. GRANITO no fue creada para enriquecer a sus fundadores: fue creada para que exista durante décadas una institución que impulse al deporte argentino.`,
  },
  {
    q: "¿Qué pasa con mis datos?",
    a: "Tratamos tus datos según la Ley 25.326 de Protección de Datos Personales. No vendemos datos. Podés leer el detalle en nuestra Política de Privacidad.",
  },
];

export default async function TransparenciaPage() {
  const netPct = Math.round((1 - PLATFORM_FEE_RATE) * 100);
  const feePct = Math.round(PLATFORM_FEE_RATE * 100);

  return (
    <>
      <Header />
      <main className="overflow-x-hidden bg-ink text-white">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute left-1/2 top-[-120px] h-[480px] w-[720px] -translate-x-1/2"
            style={{ background: "radial-gradient(ellipse at center,rgba(201,162,39,.14),transparent 68%)" }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-[860px] px-4 pb-12 pt-[70px] text-center sm:px-6">
            <Reveal>
              <div className="mb-[22px] inline-flex items-center gap-2.5">
                <span className="podio-pulse h-2 w-2 rounded-full bg-gold" aria-hidden />
                <span className="eyebrow text-gold">Transparencia</span>
              </div>
              <h1 className="font-display text-[52px] font-700 uppercase leading-[.92] tracking-tight sm:text-[64px]">
                Cada peso tiene<br />
                <span className="text-gold">un camino claro</span>
              </h1>
              <p className="mx-auto mt-5 max-w-[560px] text-[18px] leading-relaxed text-white/70">
                GRANITO existe para impulsar al deporte argentino durante décadas.
                Eso solo funciona con una regla: que puedas ver exactamente cómo
                funciona todo. Acá está, sin letra chica.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── CÓMO SE DISTRIBUYE UN APORTE ── */}
        <section className="mx-auto max-w-[900px] px-4 pb-6 pt-10 sm:px-6">
          <Reveal className="mb-10 text-center">
            <div className="eyebrow mb-2.5 text-gold">La distribución</div>
            <h2 className="font-display text-[40px] font-700 uppercase leading-[.95] tracking-tight">
              A dónde va tu aporte
            </h2>
          </Reveal>

          <Reveal>
            <div
              className="rounded-[16px] p-8"
              style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}
            >
              {/* Barra 93/7 */}
              <div className="mb-3 flex h-12 overflow-hidden rounded-[10px]">
                <div
                  className="flex items-center justify-center font-display text-[18px] font-700 text-ink"
                  style={{ width: `${netPct}%`, background: "#C9A227" }}
                >
                  {netPct}%
                </div>
                <div
                  className="flex items-center justify-center font-display text-[13px] font-600 text-white/80"
                  style={{ width: `${feePct}%`, background: "rgba(255,255,255,.12)" }}
                >
                  {feePct}%
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="font-display text-[20px] font-600 uppercase text-gold">
                    {netPct}% — al atleta, directo
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/65">
                    Mercado Pago acredita tu aporte directamente en la cuenta del
                    atleta en el momento del pago. GRANITO nunca toca ese dinero:
                    los aportes del público no pasan por nuestras cuentas.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-[20px] font-600 uppercase text-white/80">
                    {feePct}% — sostiene GRANITO
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/65">
                    Infraestructura, revisión a mano de cada postulación y
                    crecimiento de la comunidad. Es lo que hace posible que esto
                    exista y dure.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── EL FONDO GRANITO (circuito de empresas) ── */}
        <section className="mx-auto max-w-[900px] px-4 pb-6 pt-14 sm:px-6">
          <Reveal className="mb-10 text-center">
            <div className="eyebrow mb-2.5 text-gold">El otro camino</div>
            <h2 className="font-display text-[40px] font-700 uppercase leading-[.95] tracking-tight">
              Cuando el aporte es de una empresa
            </h2>
          </Reveal>
          <Reveal>
            <div
              className="rounded-[16px] p-8"
              style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}
            >
              <p className="text-[15px] leading-relaxed text-white/70">
                Una empresa no aporta desde la web ni le transfiere dinero a un
                deportista. Firma un contrato de patrocinio publicitario con
                GRANITO, con factura y contraprestación documentada, y un
                porcentaje comprometido y auditable de ese aporte se destina al
                Fondo Granito.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                Ese Fondo sí lo administramos nosotros: se asigna por
                convocatoria trimestral a deportistas y proyectos, y se paga
                contra comprobante —el pasaje, la inscripción, el
                equipamiento—, nunca por transferencia suelta. Es la única
                plata que pasa por nuestras cuentas, y se informa en cada
                reporte.
              </p>
              <p className="mt-6 text-[13px] leading-relaxed text-white/45">
                Son dos circuitos distintos: el aporte del público va directo al
                atleta por Mercado Pago; el aporte de una empresa entra al Fondo
                y se asigna después. Las asignaciones las resuelve un comité de
                tres personas, una externa e independiente, que deja acta de
                cada ronda.
              </p>
              <div
                className="mt-7 rounded-xl p-6"
                style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
              >
                <h3 className="mb-3 font-display text-[17px] font-600 uppercase tracking-wide text-white/85">
                  Qué publicamos de cada ronda
                </h3>
                <ul className="flex flex-col gap-2">
                  {[
                    "Monto disponible y monto asignado en la ronda",
                    "Cuántas postulaciones se recibieron y cuántas se asignaron",
                    "Beneficiarios, disciplina y destino del gasto, con su consentimiento",
                    "Composición vigente del comité",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[14px] leading-relaxed text-white/60">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-celeste" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[13px] leading-relaxed text-white/40">
                  No publicamos datos sensibles ni documentación económica
                  personal de los postulantes. [COMPLETAR: fecha de la primera
                  ronda y link al reporte]
                </p>
              </div>
              <Link
                href="/empresas"
                className="mt-6 inline-block font-display text-sm font-600 uppercase tracking-wide text-celeste hover:underline"
              >
                Cómo funciona para empresas →
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ── VERIFICACIÓN ── */}
        <section className="mx-auto max-w-[900px] px-4 pb-6 pt-14 sm:px-6">
          <Reveal className="mb-10 text-center">
            <div className="eyebrow mb-2.5 text-gold">Confianza verificable</div>
            <h2 className="font-display text-[40px] font-700 uppercase leading-[.95] tracking-tight">
              Cómo verificamos a cada atleta
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                n: "1",
                title: "Revisión a mano",
                text: "Ninguna postulación se aprueba automáticamente. El equipo fundador evalúa cada caso, uno por uno.",
              },
              {
                n: "2",
                title: "Identidad verificada",
                text: "El atleta conecta su propia cuenta de Mercado Pago (validada con DNI y reconocimiento facial) y cruzamos ese DNI con el de su postulación.",
              },
              {
                n: "3",
                title: "Perfiles moderados",
                text: "Todo cambio que el atleta hace a su perfil público pasa por revisión del equipo antes de publicarse.",
              },
            ].map((v, i) => (
              <Reveal key={v.n} delay={i * 80}>
                <div
                  className="h-full rounded-xl p-7"
                  style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.07)" }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full font-display text-[18px] font-700 text-ink" style={{ background: "#C9A227" }}>
                    {v.n}
                  </div>
                  <h3 className="mb-2 font-display text-[19px] font-600 uppercase leading-[1.1]">
                    {v.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-white/60">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mx-auto max-w-[760px] px-4 pb-24 pt-14 sm:px-6">
          <Reveal className="mb-10 text-center">
            <div className="eyebrow mb-2.5 text-gold">Preguntas frecuentes</div>
            <h2 className="font-display text-[40px] font-700 uppercase leading-[.95] tracking-tight">
              Sin letra chica
            </h2>
          </Reveal>
          <div className="flex flex-col gap-4">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 50}>
                <details
                  className="group rounded-xl px-6 py-5"
                  style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.07)" }}
                >
                  <summary className="cursor-pointer list-none font-display text-[18px] font-600 uppercase leading-tight text-white marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="mr-2 text-gold">+</span>
                    {f.q}
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/65">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <p className="text-[14px] text-white/50">
              ¿Algo que no respondimos?{" "}
              <a href="mailto:hola@somosgranito.com" className="text-gold underline underline-offset-4 hover:text-gold-soft">
                Escribinos a hola@somosgranito.com
              </a>
            </p>
            <p className="mt-4 text-[13px] text-white/35">
              Ver también:{" "}
              <Link href="/terminos" className="underline hover:text-white/60">Términos y Condiciones</Link>
              {" · "}
              <Link href="/privacidad" className="underline hover:text-white/60">Política de Privacidad</Link>
            </p>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  );
}
