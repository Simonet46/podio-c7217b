"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { asset } from "@/config/site";
import { AMBASSADORS, type Ambassador } from "@/lib/data/ambassadors";

/** Mismo ritmo que el desfile del hero (ROTATE_MS de HomeHero). */
const ROTATE_MS = 3000;

/**
 * Embajadores del home: misma dinámica que el hero —título y bajada arriba,
 * y abajo el desfile en perspectiva con un protagonista al centro, dos
 * secundarios a los costados y dos más atrás— pero en escala compacta.
 * Los recortes van SIN FONDO (la figura sola, no una card rectangular).
 */
export function Ambassadors() {
  const [idx, setIdx] = useState(0);
  const n = AMBASSADORS.length;

  // Desfile automático: avanza siempre, igual que el hero.
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), ROTATE_MS);
    return () => clearInterval(t);
  }, [n]);

  if (!n) return null;

  const center = AMBASSADORS[idx];
  const left = n > 1 ? AMBASSADORS[(idx - 1 + n) % n] : null;
  const right = n > 1 ? AMBASSADORS[(idx + 1) % n] : null;
  const left2 = n > 4 ? AMBASSADORS[(idx - 2 + n) % n] : null;
  const right2 = n > 4 ? AMBASSADORS[(idx + 2) % n] : null;

  const prev = () => setIdx((i) => (i - 1 + n) % n);
  const next = () => setIdx((i) => (i + 1) % n);

  return (
    <section aria-label="Embajadores" className="relative overflow-hidden bg-ink text-white">
      <div className="relative mx-auto max-w-container px-4 pb-10 pt-4 sm:px-6">
        {/* ── Título + descripción, centrados como el hero ── */}
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="font-display text-3xl font-700 uppercase tracking-tight text-gold sm:text-4xl">
            Embajadores
          </h2>
          <p className="eyebrow mt-2 text-white">Aportan su granito</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
            Referentes del deporte mundial que apoyan este proyecto y suman su
            granito para que los atletas y proyectos deportivos puedan seguir
            creciendo en su disciplina y nos representen de la mejor manera,
            como ellos también lo hicieron.
          </p>
        </div>

        {/* ── Desfile en perspectiva (escala compacta) ── */}
        <div
          className="relative mx-auto flex h-[300px] items-end justify-center sm:h-[340px]"
          style={{ perspective: "1600px" }}
        >
          {/* Precarga: todas las figuras montadas pero invisibles. Al rotar,
              el re-monte del protagonista toma la imagen ya cacheada y no
              parpadea (antes, con lazy-load, desaparecía un instante). */}
          <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" aria-hidden>
            {AMBASSADORS.map((am) => (
              <Image key={am.image} src={asset(am.image)} alt="" width={220} height={300} priority={false} />
            ))}
          </div>

          {/* Glow bajo el protagonista */}
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 h-[180px] w-[420px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse at center bottom, ${center.color}2e, transparent 70%)`,
            }}
            aria-hidden
          />

          {/* Filas lejanas primero, para que las cercanas las tapen */}
          {left2 && <SideFigure a={left2} side="left" far />}
          {right2 && <SideFigure a={right2} side="right" far />}
          {left && <SideFigure a={left} side="left" />}
          {right && <SideFigure a={right} side="right" />}

          {/* Flechas — mismo estilo que el hero */}
          {n > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Embajador anterior"
                className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/[.14] bg-white/[.07] text-white backdrop-blur-sm transition-colors hover:bg-white/[.15] xl:-left-2"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={next}
                aria-label="Embajador siguiente"
                className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/[.14] bg-white/[.07] text-white backdrop-blur-sm transition-colors hover:bg-white/[.15] xl:-right-2"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          {/* Protagonista — re-monta al cambiar idx → dispara hero-card-in */}
          <div key={idx} className="hero-card-in relative z-10 flex flex-col items-center">
            <Image
              src={asset(center.image)}
              alt={center.name}
              width={220}
              height={300}
              className="h-[210px] w-auto drop-shadow-[0_30px_40px_rgba(0,0,0,.55)] sm:h-[240px]"
            />
            <div className="mt-3 text-center">
              <span
                className="inline-block rounded-[3px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[0.12em] text-white"
                style={{ backgroundColor: center.color }}
              >
                {center.sportLabel}
              </span>
              <div className="mt-1.5 font-display text-xl font-600 uppercase leading-none sm:text-2xl">
                {center.name}
              </div>
            </div>
          </div>
        </div>

        {/* Dots + barra de progreso, como el hero */}
        {n > 1 && (
          <>
            {/* Indicadores, no botones: acá tampoco se clickea. */}
            <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden>
              {AMBASSADORS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === idx ? "w-6 bg-gold" : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
            <div className="mx-auto mt-3 h-[2px] w-[160px] overflow-hidden rounded-full bg-white/[.12]">
              <div key={idx} className="hero-progress h-full rounded-full bg-gold" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ── Figura lateral: como las SideCard del hero, pero SOLO decorativa.
      Los deportistas no se clickean —la sección es una vidriera, se navega
      únicamente con las flechas—. `far` = segunda fila (más lejos, más
      chica, más tenue). ── */
function SideFigure({
  a,
  side,
  far,
}: {
  a: Ambassador;
  side: "left" | "right";
  far?: boolean;
}) {
  const tx = side === "left" ? (far ? "-340px" : "-190px") : far ? "340px" : "190px";
  const ry = side === "left" ? (far ? "36deg" : "28deg") : far ? "-36deg" : "-28deg";
  const scale = far ? 0.6 : 0.8;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute bottom-[52px] left-1/2 hidden sm:block ${
        far ? "z-0 opacity-30" : "z-[1] opacity-50"
      }`}
      style={{
        transform: `translateX(-50%) translateX(${tx}) rotateY(${ry}) scale(${scale})`,
        filter: far ? "blur(1.2px)" : "blur(0.5px)",
      }}
    >
      <Image
        src={asset(a.image)}
        alt=""
        width={200}
        height={280}
        className="h-[200px] w-auto sm:h-[230px]"
      />
    </div>
  );
}
