"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { asset } from "@/config/site";
import { AMBASSADORS } from "@/lib/data/ambassadors";

/** Mismo ritmo que el desfile del hero (ROTATE_MS de HomeHero). */
const ROTATE_MS = 3000;

/**
 * Banda de embajadores del home. Baja altura y bajo protagonismo a propósito:
 * es un sello de confianza, no una sección estrella. El recorte sin fondo se
 * apoya sobre la banda y rota con la misma animación de entrada que la card
 * del hero (`hero-card-in`), avanzando solo cada ROTATE_MS.
 */
export function Ambassadors() {
  const [idx, setIdx] = useState(0);
  const n = AMBASSADORS.length;

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), ROTATE_MS);
    return () => clearInterval(t);
  }, [n]);

  if (!n) return null;
  const a = AMBASSADORS[idx];
  const prev = () => setIdx((i) => (i - 1 + n) % n);
  const next = () => setIdx((i) => (i + 1) % n);

  return (
    <section aria-label="Embajadores" className="bg-ink text-white">
      <div className="mx-auto max-w-container px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[.08] px-6 sm:px-10"
          style={{ background: "linear-gradient(120deg,#0d2238,#0A1A2F)" }}
        >
          {/* Glow suave detrás del deportista */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-[46%]"
            style={{
              background: `radial-gradient(ellipse at 70% 100%, ${a.color}33, transparent 70%)`,
            }}
            aria-hidden
          />

          <div className="relative flex items-end justify-between gap-6">
            {/* Texto: discreto, alineado con el resto de los eyebrows */}
            <div className="py-8 sm:py-10">
              <p className="eyebrow text-gold">Embajadores</p>
              <h2 className="mt-2 font-display text-2xl font-700 uppercase leading-none tracking-tight sm:text-3xl">
                Aportan su granito
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
                Referentes del deporte mundial que apoyan este proyecto y suman
                su granito para que los atletas y proyectos deportivos puedan
                seguir creciendo en su disciplina y nos representen de la mejor
                manera, como ellos también lo hicieron.
              </p>

              {/* Flechas del desfile (mismo estilo que el hero) */}
              {n > 1 && (
                <div className="mt-4 flex items-center gap-2.5">
                  <button
                    onClick={prev}
                    aria-label="Embajador anterior"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[.14] bg-white/[.07] text-white backdrop-blur-sm transition-colors hover:bg-white/[.15]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    aria-label="Embajador siguiente"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[.14] bg-white/[.07] text-white backdrop-blur-sm transition-colors hover:bg-white/[.15]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                  {/* Dots, como el desfile del hero */}
                  <div className="ml-1.5 flex gap-1.5">
                    {AMBASSADORS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === idx ? "w-5 bg-gold" : "w-1.5 bg-white/30"
                        }`}
                        aria-label={`Embajador ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recorte sin fondo: apoyado en el borde inferior de la banda.
                key={idx} re-monta al rotar → dispara hero-card-in, la misma
                entrada que la card del hero. */}
            <div key={idx} className="hero-card-in flex shrink-0 items-end gap-4">
              <Image
                src={asset(a.image)}
                alt={a.name}
                width={207}
                height={280}
                className="h-[150px] w-auto sm:h-[190px]"
                priority={false}
              />
              <div className="hidden pb-6 sm:block">
                <span
                  className="inline-block rounded-[3px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[0.12em] text-white"
                  style={{ backgroundColor: a.color }}
                >
                  {a.sportLabel}
                </span>
                <div className="mt-1.5 font-display text-xl font-600 uppercase leading-none">
                  {a.name}
                </div>
              </div>
            </div>
          </div>

          {/* Nombre en mobile (abajo, centrado bajo el recorte no entra) */}
          <div className="relative pb-5 sm:hidden">
            <span
              className="mr-2 inline-block rounded-[3px] px-2 py-[3px] font-display text-[10px] font-600 uppercase tracking-[0.12em] text-white"
              style={{ backgroundColor: a.color }}
            >
              {a.sportLabel}
            </span>
            <span className="font-display text-base font-600 uppercase">{a.name}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
