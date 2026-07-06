"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { asset } from "@/config/site";
import { Monogram } from "./Monogram";

export type HeroAthlete = {
  slug: string;
  name: string;
  firstName: string;
  sportLabel: string;
  color: string;
  location: string;
  nextCompetition?: string | null;
  photo: string | null;
};

export function HomeHero({ featured }: { featured: HeroAthlete[] }) {
  const [idx, setIdx] = useState(0);
  if (!featured.length) return null;

  const n = featured.length;
  const center = featured[idx];
  const left = n > 1 ? featured[(idx - 1 + n) % n] : null;
  const right = n > 1 ? featured[(idx + 1) % n] : null;

  const prev = () => setIdx((i) => (i - 1 + n) % n);
  const next = () => setIdx((i) => (i + 1) % n);

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Glow celeste/dorado */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-160px] h-[700px] w-[900px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center,rgba(108,180,228,.18),rgba(201,162,39,.08) 40%,transparent 68%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-container px-4 pb-14 pt-14 sm:px-6 sm:pt-16">
        {/* ── Titular ── */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="eyebrow inline-flex items-center gap-2.5 text-celeste">
            <span className="podio-pulse h-2 w-2 rounded-full bg-celeste" aria-hidden />
            Entrá en su historia
          </p>
          <h1 className="mt-5 font-display text-4xl font-700 uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-[80px]">
            Cada atleta es
            <br />
            una historia <span className="text-gold">única</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            LOS LOGROS SE CELEBRAN, EL ESFUERZO SE APOYA. Se parte del camino de
            un atleta argentino.
          </p>
        </div>

        {/* ── Stack 3D + flechas (desktop) ── */}
        <div
          className="relative mx-auto flex h-[420px] items-center justify-center sm:h-[580px]"
          style={{ perspective: "1600px" }}
        >
          {/* Cards laterales (solo desktop, clickeables) */}
          {left && <SideCard athlete={left} side="left" onClick={prev} />}
          {right && <SideCard athlete={right} side="right" onClick={next} />}

          {/* Flecha izquierda — desktop */}
          {n > 1 && (
            <button
              onClick={prev}
              aria-label="Atleta anterior"
              className="absolute left-2 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-white/[.14] bg-white/[.07] text-white backdrop-blur-sm transition-colors hover:bg-white/[.15] lg:flex xl:-left-2"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Flecha derecha — desktop */}
          {n > 1 && (
            <button
              onClick={next}
              aria-label="Atleta siguiente"
              className="absolute right-2 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-white/[.14] bg-white/[.07] text-white backdrop-blur-sm transition-colors hover:bg-white/[.15] lg:flex xl:-right-2"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* ── Card central — re-monta al cambiar idx → dispara hero-card-in ── */}
          <div className="hero-card-in relative z-10" key={center.slug}>
            <Link
              href={`/atleta/${center.slug}`}
              className="group relative block h-[360px] w-[260px] overflow-hidden rounded-2xl shadow-[0_50px_110px_rgba(0,0,0,.6),0_0_0_1px_rgba(255,255,255,.08)] sm:h-[540px] sm:w-[400px]"
            >
              <PhotoOrMono athlete={center} priority />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg,transparent 48%,rgba(10,26,47,.9))",
                }}
              />
              <div className="absolute inset-x-6 bottom-6">
                <span
                  className="inline-block rounded-[3px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[0.12em] text-white"
                  style={{ backgroundColor: center.color }}
                >
                  {center.sportLabel}
                </span>
                <div className="mt-2.5 font-display text-2xl font-600 uppercase leading-none sm:text-3xl">
                  {center.name}
                </div>
                <div className="mt-1 text-sm text-white/70">
                  {center.location}
                  {center.nextCompetition
                    ? ` · Próxima: ${center.nextCompetition}`
                    : ""}
                </div>
              </div>
            </Link>

            {/* Badge: caso revisado (real — es el proceso de GRANITO).
                Anclado arriba a la derecha de la card, con puntito "live". */}
            <div className="absolute -right-3 -top-3 z-20 flex items-center gap-2 rounded-full border border-white/[.12] bg-ink-2/95 px-3.5 py-2 shadow-[0_14px_36px_rgba(0,0,0,.45)] sm:-right-6">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              <span className="text-[13px] font-500 text-white">
                Historia real, revisada a mano
              </span>
            </div>
          </div>
        </div>

        {/* ── Dots + flechas — mobile ── */}
        {n > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4 lg:hidden">
            <button
              onClick={prev}
              aria-label="Atleta anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[.07] text-white transition-colors hover:bg-white/[.14]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === idx ? "w-6 bg-gold" : "w-1.5 bg-white/30"
                  }`}
                  aria-label={`Atleta ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Atleta siguiente"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[.07] text-white transition-colors hover:bg-white/[.14]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* Dots — desktop */}
        {n > 1 && (
          <div className="mt-3 hidden items-center justify-center gap-1.5 lg:flex">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === idx ? "w-6 bg-gold" : "w-1.5 bg-white/30"
                }`}
                aria-label={`Atleta ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* ── CTA ── */}
        <div className="mt-8 text-center sm:mt-6">
          <Link
            href={`/atleta/${center.slug}`}
            className="inline-block rounded-md bg-gold px-8 py-4 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
          >
            Conocé la historia de {center.firstName}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Side card: visible solo en desktop, clickeable como prev/next ── */
function SideCard({
  athlete,
  side,
  onClick,
}: {
  athlete: HeroAthlete;
  side: "left" | "right";
  onClick: () => void;
}) {
  const tx = side === "left" ? "-300px" : "300px";
  const ry = side === "left" ? "28deg" : "-28deg";
  return (
    <button
      onClick={onClick}
      aria-hidden
      tabIndex={-1}
      className="absolute left-1/2 top-1/2 hidden h-[380px] w-[240px] cursor-pointer overflow-hidden rounded-[10px] opacity-50 shadow-[0_30px_70px_rgba(0,0,0,.5)] transition-opacity hover:opacity-65 lg:block"
      style={{
        transform: `translate(-50%,-50%) translateX(${tx}) rotateY(${ry}) scale(.82)`,
        filter: "blur(0.5px)",
        transition: "opacity .25s ease",
      }}
    >
      <PhotoOrMono athlete={athlete} />
    </button>
  );
}

function PhotoOrMono({
  athlete,
  priority,
}: {
  athlete: HeroAthlete;
  priority?: boolean;
}) {
  if (athlete.photo) {
    return (
      <Image
        src={asset(athlete.photo)}
        alt={athlete.name}
        fill
        priority={priority}
        sizes="(max-width: 640px) 260px, 400px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <Monogram name={athlete.name} color={athlete.color} className="h-full w-full" />
  );
}
