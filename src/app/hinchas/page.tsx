import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { topSupporters, initialsOf } from "@/lib/supporters";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Top hinchas — ${SITE.brand}`,
  description:
    "El ranking de los que más apoyan al deporte argentino. Cada aporte suma.",
};

// Puntos derivados del total aportado (proxy hasta tener sistema real)
function pts(total: number) {
  return Math.round(total / 10).toLocaleString("es-AR");
}

const STREAKS = [
  "12 meses", "8 meses", "6 meses", "5 meses", "9 meses",
  "4 meses", "7 meses", "3 meses", "5 meses", "2 meses",
  "1 mes", "6 meses", "3 meses", "4 meses", "2 meses",
];

const TIER_COLORS: Record<number, string> = {
  1: "#C9A227",
  2: "#B8C2CC",
  3: "#C8956A",
};

const HOW_TO = [
  {
    icon: "💛",
    color: "#C9A227",
    title: "Apoyá más, sumás más",
    text: "Cuánto apoyás cuenta: a más atletas y mayor tu aporte mensual, más puntos sumás.",
  },
  {
    icon: "🔥",
    color: "#DF0024",
    title: "Mantené la racha",
    text: "Apoyar todos los meses sin cortar multiplica tus puntos. La constancia paga.",
  },
  {
    icon: "📣",
    color: "#009F3D",
    title: "Sumá hinchas",
    text: "Invitá a otros a apoyar. Cuando se suman con tu link, ganás puntos extra.",
  },
];

export default function HinchasPage() {
  const ranking = topSupporters(15);
  const [first, second, third] = ranking;
  const tableRows = ranking.slice(0, 10);

  return (
    <>
      <Header />
      <main className="bg-ink text-white">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Gold glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-[-120px] h-[520px] w-[760px] -translate-x-1/2"
            style={{ background: "radial-gradient(ellipse at center,rgba(201,162,39,.18),transparent 68%)" }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-[1100px] px-4 pb-6 pt-16 text-center sm:px-6 sm:pt-20">
            <Reveal>
              <p className="eyebrow inline-flex items-center gap-2.5 text-gold">
                <span className="podio-pulse h-2 w-2 rounded-full bg-gold" aria-hidden />
                Ranking del mes
              </p>
              <h1 className="mt-4 font-display text-5xl font-700 uppercase leading-[.92] tracking-tight sm:text-7xl">
                Los que más<br />
                <span className="text-gold">empujan</span>
              </h1>
              <p className="mx-auto mt-4 max-w-[520px] text-lg leading-relaxed text-white/72">
                Cada apoyo suma puntos: cuanto a más atletas apoyás y más aportás, más
                alto llegás. Sin premios en plata: el premio es el orgullo.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Pódium 3D ── */}
        <section className="mx-auto max-w-[1000px] px-4 pb-6 pt-10 sm:px-6">
          <Reveal>
            <div className="flex items-end justify-center gap-6" style={{ perspective: "1100px" }}>

              {/* Plata — 2° */}
              {second && (
                <div className="w-[200px] text-center sm:w-[230px]">
                  <div
                    className="mx-auto mb-3.5 flex h-[92px] w-[92px] items-center justify-center rounded-full font-display text-2xl font-700 text-white"
                    style={{ border: "3px solid #B8C2CC", background: "#B8C2CC" }}
                  >
                    {initialsOf(second.name)}
                  </div>
                  <div className="font-display text-[22px] font-600 uppercase leading-none">{second.name}</div>
                  <div className="mt-1 text-[13px] text-white/55">{second.athletes} atletas apoyados</div>
                  <div className="mb-3.5 font-display text-[15px] font-600 text-[#B8C2CC]">
                    {pts(second.total)} pts
                  </div>
                  <div
                    className="relative flex items-start justify-center overflow-hidden rounded-t-[10px] pt-[18px]"
                    style={{
                      height: 170,
                      background: "linear-gradient(180deg,#C8D2DC,#A9B6C2)",
                      transform: "rotateX(9deg)",
                      transformOrigin: "bottom",
                      boxShadow: "0 18px 44px rgba(0,0,0,.3)",
                    }}
                  >
                    <span className="font-display text-[44px] font-700 text-white/90">2</span>
                  </div>
                </div>
              )}

              {/* Oro — 1° */}
              {first && (
                <div className="w-[220px] text-center sm:w-[250px]">
                  <p className="eyebrow mb-2 text-gold">Hincha del mes</p>
                  <div className="relative mx-auto mb-3.5 w-[118px]">
                    <div
                      className="flex h-[118px] w-[118px] items-center justify-center rounded-full font-display text-3xl font-700 text-white"
                      style={{
                        border: "3px solid #C9A227",
                        background: "#C9A227",
                        boxShadow: "0 0 0 6px rgba(201,162,39,.18)",
                      }}
                    >
                      {initialsOf(first.name)}
                    </div>
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl" aria-hidden>👑</span>
                  </div>
                  <div className="font-display text-[26px] font-600 uppercase leading-none">{first.name}</div>
                  <div className="mt-1 text-[13px] text-white/55">{first.athletes} atletas apoyados</div>
                  <div className="mb-3.5 font-display text-[16px] font-600 text-gold">
                    {pts(first.total)} pts
                  </div>
                  <div
                    className="relative flex items-start justify-center overflow-hidden rounded-t-[10px] pt-5"
                    style={{
                      height: 240,
                      background: "linear-gradient(180deg,#E8CC5A,#C9A227)",
                      transform: "rotateX(9deg)",
                      transformOrigin: "bottom",
                      boxShadow: "0 26px 56px rgba(201,162,39,.4)",
                    }}
                  >
                    <span className="font-display text-[56px] font-700 text-white/95">1</span>
                    {/* Shine deslizante */}
                    <div className="podio-shine absolute inset-0" aria-hidden />
                  </div>
                </div>
              )}

              {/* Bronce — 3° */}
              {third && (
                <div className="w-[200px] text-center sm:w-[230px]">
                  <div
                    className="mx-auto mb-3.5 flex h-[92px] w-[92px] items-center justify-center rounded-full font-display text-2xl font-700 text-white"
                    style={{ border: "3px solid #C8956A", background: "#C8956A" }}
                  >
                    {initialsOf(third.name)}
                  </div>
                  <div className="font-display text-[22px] font-600 uppercase leading-none">{third.name}</div>
                  <div className="mt-1 text-[13px] text-white/55">{third.athletes} atletas apoyados</div>
                  <div className="mb-3.5 font-display text-[15px] font-600 text-[#C8956A]">
                    {pts(third.total)} pts
                  </div>
                  <div
                    className="relative flex items-start justify-center overflow-hidden rounded-t-[10px] pt-4"
                    style={{
                      height: 135,
                      background: "linear-gradient(180deg,#D6A179,#C0825A)",
                      transform: "rotateX(9deg)",
                      transformOrigin: "bottom",
                      boxShadow: "0 18px 44px rgba(0,0,0,.3)",
                    }}
                  >
                    <span className="font-display text-[40px] font-700 text-white/90">3</span>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </section>

        {/* ── Tabla completa ── */}
        <section className="mx-auto max-w-[1000px] px-4 pb-8 pt-14 sm:px-6">
          <Reveal>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-3xl font-700 uppercase leading-[.95] tracking-tight">
                Tabla completa
              </h2>
              {/* Tabs — visuales, sin filtrado real aún */}
              <div className="flex gap-2">
                {["Mes", "Histórico", "Por deporte"].map((t, i) => (
                  <span
                    key={t}
                    className={`rounded-full px-4 py-2 font-display text-[12px] font-600 uppercase tracking-wide transition ${
                      i === 0
                        ? "bg-gold text-ink"
                        : "bg-white/6 text-white/60"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Tabla */}
            <div
              className="overflow-hidden rounded-2xl border border-white/[.07]"
              style={{ background: "#0d2238" }}
            >
              {/* Header */}
              <div className="grid items-center gap-3 border-b border-white/[.08] px-5 py-3.5 sm:px-6"
                style={{ gridTemplateColumns: "52px 1fr 110px 110px 90px" }}>
                {["#", "Hincha", "Atletas", "Racha", "Puntos"].map((h, i) => (
                  <span
                    key={h}
                    className={`eyebrow text-white/50 ${i >= 2 ? "text-right" : ""}`}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {tableRows.map((s, i) => {
                const medal = TIER_COLORS[s.rank];
                return (
                  <div
                    key={s.rank}
                    className="grid items-center gap-3 border-b border-white/[.06] px-5 py-3.5 transition-colors hover:bg-white/[.03] last:border-0 sm:px-6"
                    style={{ gridTemplateColumns: "52px 1fr 110px 110px 90px" }}
                  >
                    <span
                      className="text-center font-display text-xl font-700"
                      style={{ color: medal ?? "rgba(255,255,255,.55)" }}
                    >
                      {s.rank}
                    </span>
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full font-display text-[15px] font-700 text-white"
                        style={{ background: medal ?? "#3E8FD0" }}
                      >
                        {initialsOf(s.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-display text-[17px] font-600 uppercase leading-none text-white">
                          {s.name}
                        </div>
                      </div>
                    </div>
                    <span className="text-right font-display text-[17px] font-600 text-white">
                      {s.athletes}
                    </span>
                    <span className="text-right text-[13px] text-white/60">
                      {STREAKS[i] ?? "1 mes"}
                    </span>
                    <span className="text-right font-display text-[18px] font-700 text-gold">
                      {pts(s.total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Tu posición (placeholder sin auth) */}
          <Reveal className="mt-3">
            <div
              className="grid items-center gap-3 rounded-2xl border border-gold/40 px-5 py-4 sm:px-6"
              style={{
                gridTemplateColumns: "52px 1fr 110px 110px 90px",
                background: "linear-gradient(135deg,#102a44,#0b1f34)",
              }}
            >
              <span className="text-center font-display text-xl font-700 text-gold">—</span>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold font-display text-base font-700 text-ink">
                  ?
                </div>
                <div>
                  <div className="font-display text-[18px] font-600 uppercase leading-none text-white">
                    Tu posición
                  </div>
                  <div className="text-[12px] text-gold">Apoyá para aparecer en el ranking</div>
                </div>
              </div>
              <span className="text-right text-white/40">—</span>
              <span className="text-right text-white/40">—</span>
              <span className="text-right font-display text-[18px] font-700 text-gold">—</span>
            </div>
          </Reveal>
        </section>

        {/* ── Cómo sumás puntos ── */}
        <section className="mx-auto max-w-[1000px] px-4 pb-20 pt-14 sm:px-6">
          <Reveal>
            <div className="mb-9 text-center">
              <p className="eyebrow text-gold">Subí en la tabla</p>
              <h2 className="mt-2 font-display text-4xl font-700 uppercase leading-[.95] tracking-tight">
                Cómo sumás puntos
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-[18px] sm:grid-cols-3">
            {HOW_TO.map((h, i) => (
              <Reveal key={h.title} delay={i * 90}>
                <div
                  className="rounded-xl border border-white/[.07] p-7"
                  style={{ background: "#0d2238", borderTop: `3px solid ${h.color}` }}
                >
                  <div className="mb-3.5 text-[28px]">{h.icon}</div>
                  <h3 className="font-display text-xl font-600 uppercase leading-[1.05] text-white">
                    {h.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/65">{h.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-10 text-center">
              <Link
                href="/#atletas"
                className="inline-block rounded-md bg-gold px-9 py-4 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
              >
                Apoyá a un atleta y sumá
              </Link>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  );
}
