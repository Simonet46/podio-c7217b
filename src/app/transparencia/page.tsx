import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { getGlobalStats } from "@/lib/data/athletes";
import { formatMoney } from "@/lib/money";
import { PLATFORM_FEE_RATE, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Transparencia — ${SITE.brand}`,
  description:
    "Cómo funciona GRANITO, cómo se distribuyen los aportes y cómo verificamos a cada atleta. Cada peso tiene un camino claro.",
};

const FAQ = [
  {
    q: "¿Cómo sé que el atleta recibe el dinero?",
    a: "Porque nunca pasa por nuestras manos. Cuando aportás, Mercado Pago acredita el dinero directamente en la cuenta del atleta. GRANITO no custodia fondos: no podríamos quedarnos con tu aporte ni queriendo.",
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
    q: "¿De qué vive GRANITO?",
    a: `De una comisión del ${Math.round(PLATFORM_FEE_RATE * 100)}% sobre cada aporte, que retiene Mercado Pago automáticamente al momento del pago. Con eso sostenemos la plataforma y su crecimiento. GRANITO no fue creada para enriquecer a sus fundadores: fue creada para que exista durante décadas una institución que impulse al deporte argentino.`,
  },
  {
    q: "¿Qué pasa con mis datos?",
    a: "Tratamos tus datos según la Ley 25.326 de Protección de Datos Personales. No vendemos datos. Podés leer el detalle en nuestra Política de Privacidad.",
  },
];

export default async function TransparenciaPage() {
  const { athleteCount, totalRaised } = await getGlobalStats();
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
                    no custodiamos fondos.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-[20px] font-600 uppercase text-white/80">
                    {feePct}% — sostiene GRANITO
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/65">
                    Infraestructura, revisión a mano de cada postulación y
                    crecimiento de la comunidad. Es lo que hace posible que esto
                    exista y dure. No hay otros cargos: ni para vos, ni para el atleta.
                  </p>
                </div>
              </div>
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

        {/* ── NÚMEROS REALES ── */}
        <section className="mx-auto max-w-[900px] px-4 pb-6 pt-14 sm:px-6">
          <Reveal>
            <div
              className="rounded-[16px] p-8 text-center"
              style={{
                background: "linear-gradient(160deg,#12283f,#0d2238)",
                border: "1px solid rgba(201,162,39,.25)",
              }}
            >
              <div className="eyebrow mb-6 text-gold">Los números, hoy</div>
              <div className="flex flex-wrap items-start justify-center gap-x-14 gap-y-6">
                <div>
                  <div className="font-display text-[44px] font-700 leading-none text-gold">
                    {athleteCount}
                  </div>
                  <div className="eyebrow mt-2 text-white/55">
                    {athleteCount === 1 ? "atleta en campaña" : "atletas en campaña"}
                  </div>
                </div>
                <div>
                  <div className="font-display text-[44px] font-700 leading-none text-gold">
                    {formatMoney(totalRaised)}
                  </div>
                  <div className="eyebrow mt-2 text-white/55">aportado a la fecha</div>
                </div>
                <div>
                  <div className="font-display text-[44px] font-700 leading-none text-gold">3</div>
                  <div className="eyebrow mt-2 text-white/55">atletas olímpicos fundadores</div>
                </div>
              </div>
              <p className="mx-auto mt-7 max-w-[520px] text-[13px] leading-relaxed text-white/45">
                Números reales, aunque sean chicos: la comunidad recién empieza.
                A medida que crezca vamos a publicar acá el historial agregado de
                aportes y transferencias, período por período.
              </p>
            </div>
          </Reveal>
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
