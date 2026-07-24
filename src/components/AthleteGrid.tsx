"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Athlete, Team } from "@/lib/data/types";
import { SPORT_LIST } from "@/config/sports";
import { AthleteCard } from "./AthleteCard";
import { TeamCard } from "./TeamCard";
import { Reveal } from "./Reveal";

/** Carrusel de campañas (atletas individuales + equipos) con filtro por deporte.
 *  3 filas que se deslizan juntas en horizontal: en desktop se ven 4 columnas
 *  (12 tarjetas) + media columna asomada, para invitar a deslizar con la flecha. */
export function AthleteGrid({
  athletes,
  teams = [],
}: {
  athletes: Athlete[];
  teams?: Team[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Chips solo de deportes presentes (en atletas o equipos).
  const availableSports = useMemo(() => {
    const present = new Set<string>([
      ...athletes.map((a) => a.sport),
      ...teams.map((t) => t.sport),
    ]);
    return SPORT_LIST.filter((s) => present.has(s.key));
  }, [athletes, teams]);

  const shownTeams = active ? teams.filter((t) => t.sport === active) : teams;
  const shownAthletes = active
    ? athletes.filter((a) => a.sport === active)
    : athletes;

  // Mezcla: 1 equipo cada 2 atletas. Como el carrusel llena las columnas de a
  // 3 (de arriba hacia abajo), esto reparte un equipo por columna y quedan
  // atletas y equipos entreverados a la vista.
  const items = useMemo(() => {
    const out: { key: string; node: React.ReactNode }[] = [];
    const ath = shownAthletes.map((a) => ({
      key: `ath-${a.id}`,
      node: <AthleteCard athlete={a} />,
    }));
    const tms = shownTeams.map((t) => ({
      key: `team-${t.id}`,
      node: <TeamCard team={t} />,
    }));
    let ti = 0;
    for (let i = 0; i < ath.length; i++) {
      out.push(ath[i]);
      // Después de cada par de atletas, entra un equipo (si queda).
      if (i % 2 === 1 && ti < tms.length) out.push(tms[ti++]);
    }
    while (ti < tms.length) out.push(tms[ti++]);
    return out;
  }, [shownAthletes, shownTeams]);

  // Estado de las flechas según la posición del scroll.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 8);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [items.length]);

  const slide = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div>
      {/* Chips de filtro */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Chip label="Todos" active={active === null} onClick={() => setActive(null)} />
        {availableSports.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            color={s.color}
            team={s.team}
            active={active === s.key}
            onClick={() => setActive(s.key)}
          />
        ))}
      </div>

      {/* Carrusel: 3 filas, columnas de ~4.5 visibles en desktop */}
      <div className="relative">
        <div
          ref={scroller}
          className="grid snap-x snap-mandatory grid-flow-col grid-rows-3 gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden auto-cols-[calc((100%-1rem)/1.5)] sm:auto-cols-[calc((100%-2rem)/2.5)] lg:auto-cols-[calc((100%-4rem)/4.5)]"
        >
          {items.map((item, i) => (
            <Reveal key={item.key} delay={(i % 3) * 90} className="h-full snap-start">
              <div className="h-full [&>article]:h-full">{item.node}</div>
            </Reveal>
          ))}
        </div>

        {/* Flechas — doradas, bien visibles */}
        {canLeft && (
          <button
            type="button"
            onClick={() => slide(-1)}
            aria-label="Ver anteriores"
            className="absolute -left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-ink shadow-[0_10px_30px_rgba(0,0,0,.5)] transition-transform hover:scale-110 sm:-left-5"
          >
            <Arrow className="rotate-180" />
          </button>
        )}
        {canRight && (
          <button
            type="button"
            onClick={() => slide(1)}
            aria-label="Ver más atletas y equipos"
            className="absolute -right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-ink shadow-[0_10px_30px_rgba(0,0,0,.5)] transition-transform hover:scale-110 sm:-right-5"
          >
            <Arrow />
          </button>
        )}
      </div>

      {items.length === 0 && (
        <p className="py-12 text-center text-steel">
          No hay campañas en esta categoría todavía.
        </p>
      )}
    </div>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-6 w-6 ${className}`}
      aria-hidden
    >
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chip({
  label,
  color,
  team,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  team?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-display text-sm font-500 uppercase tracking-wide transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-paper text-steel hover:border-steel hover:text-ink"
      }`}
    >
      {color && (
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
      {label}
      {team && (
        <span className="rounded-sm bg-gold/20 px-1 text-[0.6rem] font-700 text-gold">
          EQUIPO
        </span>
      )}
    </button>
  );
}
