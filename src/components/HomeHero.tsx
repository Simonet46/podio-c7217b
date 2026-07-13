"use client";

import { useEffect, useState } from "react";
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
  /** Adónde linkea (por defecto /atleta/slug; los equipos usan /equipos/slug). */
  href?: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cada cuánto avanza solo el desfile (sincronizado con .hero-progress). */
const ROTATE_MS = 3000;

export function HomeHero({ featured }: { featured: HeroAthlete[] }) {
  const [items, setItems] = useState<HeroAthlete[]>(featured);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  // Orden distinto en cada visita. Mezclamos en el cliente (no en el render)
  // para no romper la hidratación: el primer pintado usa el orden del server
  // y apenas monta, se reordena.
  useEffect(() => {
    setItems(shuffle(featured));
    setIdx(0);
  }, [featured]);

  const n = items.length;

  // Desfile automático: avanza solo; se pausa con el mouse encima (para que
  // nadie pierda la card que estaba mirando).
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), ROTATE_MS);
    return () => clearInterval(t);
  }, [n, paused]);

  if (!items.length) return null;

  const center = items[idx];
  const left = n > 1 ? items[(idx - 1 + n) % n] : null;
  const right = n > 1 ? items[(idx + 1) % n] : null;
  // Segunda fila de cards (desfile de 5): solo si hay suficientes historias.
  const left2 = n > 4 ? items[(idx - 2 + n) % n] : null;
  const right2 = n > 4 ? items[(idx + 2) % n] : null;
  const centerHref = center.href ?? `/atleta/${center.slug}`;

  const prev = () => setIdx((i) => (i - 1 + n) % n);
  const next = () => setIdx((i) => (i + 1) % n);

  return (
    <section
      className={`relative overflow-hidden bg-ink text-white ${paused ? "hero-paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
        {/* ── Titular ──
            "Plataforma" hasta que los abogados confirmen la figura de
            crowdfunding: si dan el OK, es cambiar una sola palabra acá. */}
        <div className="mx-auto mb-10 max-w-4xl text-center">
          <p className="eyebrow inline-flex items-center gap-2.5 text-celeste">
            <span className="podio-pulse h-2 w-2 rounded-full bg-celeste" aria-hidden />
            Creado por atletas para atletas
          </p>
          <h1 className="mt-5 font-display text-4xl font-700 uppercase leading-[0.98] tracking-tight sm:text-5xl lg:text-[64px]">
            La primer plataforma especializada en impulsar el{" "}
            <span className="text-gold">deporte argentino</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            Para que cualquier persona o empresa pueda acompañar, de forma
            transparente, a atletas y proyectos deportivos argentinos.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/#atletas"
              className="rounded-md bg-gold px-7 py-3.5 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
            >
              Apoyar un atleta
            </Link>
            <Link
              href="/#como-funciona"
              className="rounded-md border border-white/30 px-6 py-3.5 font-display text-base font-500 uppercase tracking-wide text-white/85 transition-colors hover:border-white hover:text-white"
            >
              Conocer cómo funciona
            </Link>
          </div>
        </div>

        {/* ── Stack 3D + flechas (desktop) ── */}
        <div
          className="relative mx-auto flex h-[420px] items-center justify-center sm:h-[580px]"
          style={{ perspective: "1600px" }}
        >
          {/* Cards laterales (solo desktop, clickeables). Las lejanas van
              primero para que las cercanas las tapen parcialmente. */}
          {left2 && (
            <SideCard athlete={left2} side="left" far onClick={() => setIdx((idx - 2 + n) % n)} />
          )}
          {right2 && (
            <SideCard athlete={right2} side="right" far onClick={() => setIdx((idx + 2) % n)} />
          )}
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
              href={centerHref}
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
              {items.map((_, i) => (
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
            {items.map((_, i) => (
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

        {/* Barra de progreso del desfile automático (se reinicia por key y
            se pausa junto con la rotación al pasar el mouse). */}
        {n > 1 && (
          <div className="mx-auto mt-4 h-[2px] w-[200px] overflow-hidden rounded-full bg-white/[.12]">
            <div key={idx} className="hero-progress h-full rounded-full bg-gold" />
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Side card: visible solo en desktop, clickeable como prev/next.
      `far` = segunda fila del desfile (más lejos, más chica, más tenue). ── */
function SideCard({
  athlete,
  side,
  onClick,
  far,
}: {
  athlete: HeroAthlete;
  side: "left" | "right";
  onClick: () => void;
  far?: boolean;
}) {
  const tx = side === "left" ? (far ? "-520px" : "-300px") : far ? "520px" : "300px";
  const ry = side === "left" ? (far ? "36deg" : "28deg") : far ? "-36deg" : "-28deg";
  const scale = far ? 0.66 : 0.82;
  return (
    <button
      onClick={onClick}
      aria-hidden
      tabIndex={-1}
      className={`absolute left-1/2 top-1/2 hidden h-[380px] w-[240px] cursor-pointer overflow-hidden rounded-[10px] shadow-[0_30px_70px_rgba(0,0,0,.5)] transition-opacity lg:block ${
        far ? "z-0 opacity-30 hover:opacity-45" : "z-[1] opacity-50 hover:opacity-65"
      }`}
      style={{
        transform: `translate(-50%,-50%) translateX(${tx}) rotateY(${ry}) scale(${scale})`,
        filter: far ? "blur(1.2px)" : "blur(0.5px)",
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
