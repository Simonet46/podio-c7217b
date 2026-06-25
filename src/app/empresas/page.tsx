import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { CompanyContactForm } from "@/components/CompanyContactForm";
import { Monogram } from "@/components/Monogram";
import { getAthletes } from "@/lib/data/athletes";
import { getSport } from "@/config/sports";
import { asset, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Para empresas — ${SITE.brand}`,
  description:
    "Conectamos a tu empresa con atletas argentinos reales. Vos hacés el match, ellos llevan tu marca a donde entrenan y compiten.",
};

const BENEFITS = [
  {
    color: "#0072CE",
    icon: "🎯",
    title: "Audiencia que ya quiere",
    text: "No interrumpís a nadie. Llegás a personas que eligieron seguir y apoyar a estos atletas. Afinidad real, no impresiones frías.",
  },
  {
    color: "#DF0024",
    icon: "❤️",
    title: "Asociación auténtica",
    text: "Tu marca acompaña una historia de esfuerzo, no un cartel. La gente recuerda quién estuvo cuando el atleta la peleaba solo.",
  },
  {
    color: "#009F3D",
    icon: "🤝",
    title: "Relación directa",
    text: "Te acercamos al atleta y el acuerdo lo arreglan entre ustedes, sin intermediarios. Vos decidís cómo y cuánto acompañar.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Contanos",
    text: "Tu empresa, tus valores y qué tipo de atleta querés acompañar.",
  },
  {
    n: "02",
    title: "Te proponemos",
    text: "Armamos una lista de atletas específicos que encajan con tu marca.",
  },
  {
    n: "03",
    title: "Los ponemos en relación",
    text: "Te presentamos al atleta o su manager y quedan en contacto directo.",
  },
  {
    n: "04",
    title: "Arreglan directo",
    text: "El acuerdo lo definen ustedes, a su manera. Nosotros solo conectamos.",
  },
];

const PLANS = [
  {
    tag: "Una empresa, un atleta",
    name: "Un atleta",
    accent: "#6CB4E4",
    featured: false,
    desc: "Te acercamos a un atleta puntual que encaja perfectamente con tu marca.",
    features: [
      "Selección personalizada",
      "Presentación directa con el atleta",
      "El acuerdo lo cierran ustedes",
      "Sin intermediarios ni comisiones",
    ],
    cta: "Quiero conectar",
  },
  {
    tag: "Para marcas activas",
    name: "Varios atletas",
    accent: "#C9A227",
    featured: true,
    desc: "Te presentamos un grupo de atletas seleccionados según tu perfil y valores.",
    features: [
      "Portafolio de 3 a 10 atletas",
      "Diversidad de deportes e historias",
      "Presentaciones individuales",
      "Más alcance e impacto de marca",
    ],
    cta: "Quiero varios atletas",
  },
  {
    tag: "Visibilidad en la plataforma",
    name: "Comunidad",
    accent: "#009F3D",
    featured: false,
    desc: "Tu logo asociado a GRANITO, con presencia en perfiles y campañas de toda la plataforma.",
    features: [
      "Logo en la plataforma",
      "Asociación con el deporte argentino",
      "Visibilidad en perfiles y campañas",
      "Sin requerir acuerdos individuales",
    ],
    cta: "Sumar mi marca",
  },
];

export default async function EmpresasPage() {
  const athletes = await getAthletes();
  const matchAthlete = athletes.find((a) => a.photo_url) ?? athletes[0];
  const matchSport = getSport(matchAthlete?.sport ?? "");
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
                  <span className="eyebrow text-gold">Para marcas</span>
                </div>
                <h1 className="font-display text-[54px] font-700 uppercase leading-[.92] tracking-tight sm:text-[68px] lg:text-[76px]">
                  Tu marca, del<br />lado correcto<br />de la{" "}
                  <span className="text-gold">historia</span>
                </h1>
                <p className="mt-6 max-w-[480px] text-[19px] leading-relaxed text-white/70">
                  Conectamos a tu empresa con atletas argentinos reales que la
                  pelean todos los días. Una conexión auténtica, con historias
                  que la gente ya está siguiendo.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-8 flex flex-wrap gap-3.5">
                  <a
                    href="#contacto"
                    className="rounded-md bg-gold px-7 py-4 font-display text-base font-700 uppercase tracking-[.04em] text-ink transition-transform hover:-translate-y-0.5"
                  >
                    Conectar con un atleta
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

            {/* Matchmaker visual */}
            <Reveal delay={120}>
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center">
                  {/* Card atleta */}
                  <div
                    className="relative z-[2] w-[220px] overflow-hidden rounded-[14px]"
                    style={{
                      background: "#0d2238",
                      border: "1px solid rgba(255,255,255,.1)",
                      boxShadow: "0 30px 70px rgba(0,0,0,.5)",
                    }}
                  >
                    <div className="relative h-[180px]">
                      {matchAthlete?.photo_url ? (
                        <Image
                          src={asset(matchAthlete.photo_url)}
                          alt={matchAthlete.full_name}
                          fill
                          sizes="220px"
                          className="object-cover"
                        />
                      ) : (
                        <Monogram
                          name={matchAthlete?.full_name ?? "Atleta"}
                          color={matchSport?.color ?? "#1E6E8C"}
                          className="h-full w-full"
                        />
                      )}
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: "linear-gradient(180deg,transparent 45%,rgba(13,34,56,.95))" }}
                      />
                      <div className="absolute bottom-2.5 left-3 right-3">
                        <div className="font-display text-[17px] font-600 uppercase leading-none">
                          {matchAthlete?.first_name ?? "Atleta"}
                        </div>
                        <div className="mt-0.5 text-[11px] text-white/60">
                          {matchSport?.label ?? matchAthlete?.sport} · {matchAthlete?.city}
                        </div>
                      </div>
                    </div>
                    <div className="px-3.5 py-2.5 text-[11px] text-white/55">
                      312 personas la apoyan
                    </div>
                  </div>

                  {/* "+" dorado */}
                  <div
                    className="podio-float relative z-[3] mx-[-18px] flex h-16 w-16 flex-none items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(150deg,#E8CC5A,#C9A227)",
                      boxShadow: "0 14px 30px rgba(201,162,39,.45)",
                    }}
                  >
                    <span className="font-display text-[26px] font-700 text-ink">+</span>
                  </div>

                  {/* Card marca */}
                  <div
                    className="relative z-[1] flex w-[220px] flex-col items-center justify-center gap-3.5 rounded-[14px] px-5 py-5"
                    style={{
                      background: "#0d2238",
                      border: "1px solid rgba(255,255,255,.1)",
                      boxShadow: "0 30px 70px rgba(0,0,0,.5)",
                      minHeight: "248px",
                    }}
                  >
                    <div className="eyebrow text-white/50">Tu marca acá</div>
                    <div
                      className="flex h-[70px] w-[140px] items-center justify-center rounded-lg text-[13px] text-white/40"
                      style={{ border: "1px dashed rgba(255,255,255,.25)" }}
                    >
                      Tu logo
                    </div>
                    <div className="text-center text-[12px] leading-[1.5] text-white/55">
                      En su perfil, su ropa<br />y sus competencias
                    </div>
                  </div>
                </div>
                <div className="eyebrow text-gold">El match perfecto</div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── TRUST STRIP ── */}
        <div
          className="border-y"
          style={{ background: "#0b1f34", borderColor: "rgba(255,255,255,.07)" }}
        >
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-10 px-6 py-6">
            <span className="eyebrow text-white/45">Marcas que ya apoyan</span>
            <Image
              src="/logos/ds-connect.png"
              alt="DS Connect"
              width={64}
              height={64}
              className="h-16 w-16 object-contain opacity-85"
            />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[36px] w-[110px] rounded"
                style={{ background: "rgba(255,255,255,.06)" }}
              />
            ))}
          </div>
        </div>

        {/* ── POR QUÉ GRANITO ── */}
        <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-20">
          <Reveal className="mb-12 text-center">
            <div className="eyebrow mb-2.5 text-gold">Por qué GRANITO</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              Una conexión que se siente real
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

        {/* ── CÓMO FUNCIONA ── */}
        <section
          id="como-funciona"
          className="mx-auto max-w-[1180px] px-6 pb-10 pt-16"
        >
          <Reveal className="mb-14 text-center">
            <div className="eyebrow mb-2.5 text-gold">Cómo funciona</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              El match, paso a paso
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
        </section>

        {/* ── PLANES ── */}
        <section className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
          <Reveal className="mb-12 text-center">
            <div className="eyebrow mb-2.5 text-gold">Formas de sumarte</div>
            <h2 className="font-display text-[48px] font-700 uppercase leading-[.95] tracking-tight">
              Elegí cómo conectar
            </h2>
          </Reveal>
          <div className="grid items-start gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <Reveal key={p.name}>
                <div
                  className="relative overflow-hidden rounded-[14px]"
                  style={{
                    background: p.featured
                      ? "linear-gradient(160deg,#1a3352,#0d2238)"
                      : "#0d2238",
                    border: p.featured
                      ? "1px solid rgba(201,162,39,.38)"
                      : "1px solid rgba(255,255,255,.08)",
                    boxShadow: p.featured
                      ? "0 20px 60px rgba(201,162,39,.12)"
                      : "none",
                  }}
                >
                  {p.featured && (
                    <div
                      className="w-full py-1.5 text-center font-display text-[11px] font-600 uppercase tracking-[.1em] text-ink"
                      style={{ background: "#C9A227" }}
                    >
                      Más elegido
                    </div>
                  )}
                  <div className="p-7">
                    <div className="eyebrow mb-2" style={{ color: p.accent }}>
                      {p.tag}
                    </div>
                    <div className="mb-1.5 font-display text-[30px] font-700 uppercase leading-none">
                      {p.name}
                    </div>
                    <p className="mb-5 min-h-[62px] text-[14px] leading-[1.55] text-white/60">
                      {p.desc}
                    </p>
                    <div className="mb-6 flex flex-col gap-2.5">
                      {p.features.map((f) => (
                        <div
                          key={f}
                          className="flex items-start gap-2.5 text-[14px] text-white/78"
                        >
                          <span className="flex-none font-600" style={{ color: p.accent }}>
                            ✓
                          </span>
                          {f}
                        </div>
                      ))}
                    </div>
                    <a
                      href="#contacto"
                      className="block w-full rounded-[8px] py-3.5 text-center font-display text-[15px] font-600 uppercase tracking-[.04em] transition-transform hover:-translate-y-0.5"
                      style={
                        p.featured
                          ? { background: "#C9A227", color: "#0A1A2F", boxShadow: "0 10px 28px rgba(201,162,39,.28)" }
                          : { background: "rgba(255,255,255,.07)", color: "#fff", border: "1px solid rgba(255,255,255,.14)" }
                      }
                    >
                      {p.cta}
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── ATLETAS PARA TU MARCA ── */}
        {gridAthletes.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-16">
            <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="eyebrow mb-2.5 text-gold">Listos para conectar</div>
                <h2 className="font-display text-[44px] font-700 uppercase leading-[.95] tracking-tight">
                  Atletas para tu marca
                </h2>
              </div>
              <span className="text-[14px] text-white/50">
                Te ayudamos a elegir el que mejor encaje
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
                Ver todos los atletas →
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
                  Conectá tu marca con un atleta
                </h2>
                <p className="mt-4 text-[16px] leading-relaxed text-white/70">
                  Contanos de tu empresa y qué buscás. Te armamos una propuesta de
                  match con atletas que encajan con tus valores. Sin costo de exploración.
                </p>
                <div className="mt-6 flex flex-col gap-3.5">
                  {[
                    "Propuesta a medida en 48 hs",
                    "Te presentamos al atleta o su manager",
                    "El acuerdo lo definen ustedes, directo",
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
