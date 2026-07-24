import Link from "next/link";
import Image from "next/image";
import type { Athlete } from "@/lib/data/types";
import { getSport } from "@/config/sports";
import { asset } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { Monogram } from "./Monogram";

export function AthleteCard({
  athlete,
  selected,
  onToggle,
}: {
  athlete: Athlete;
  /** Selección múltiple para "Tu aporte" (opcional; solo en el home). */
  selected?: boolean;
  onToggle?: () => void;
}) {
  const sport = getSport(athlete.sport);
  const color = sport?.color ?? "#1E6E8C";

  return (
    <article
      className={`group relative overflow-hidden rounded-xl shadow-[0_26px_60px_rgba(0,0,0,.45)] transition-shadow ${
        selected ? "ring-2 ring-gold" : ""
      }`}
      style={{ background: "#0d2238", borderTop: `3px solid ${color}` }}
    >
      <Link
        href={`/atleta/${athlete.slug}`}
        className="relative block overflow-hidden"
        style={{ aspectRatio: "3/4" }}
        aria-label={`Ver perfil de ${athlete.full_name}`}
      >
        {athlete.photo_url ? (
          <Image
            src={asset(athlete.photo_url)}
            alt={athlete.full_name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Monogram
            name={athlete.full_name}
            color={color}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {/* gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 42%, rgba(13,34,56,.96))" }}
        />
        {/* sport badge */}
        <span
          className="absolute left-3 top-3 rounded-[3px] px-2 py-0.5 font-display text-[9px] font-600 uppercase tracking-[.12em] text-white"
          style={{ backgroundColor: color }}
        >
          {sport?.label ?? athlete.sport}
        </span>
        {/* Selección para "Tu aporte": visible siempre, arriba a la derecha */}
        {onToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }}
            aria-pressed={selected}
            aria-label={
              selected
                ? `Quitar a ${athlete.full_name} de tu aporte`
                : `Sumar a ${athlete.full_name} a tu aporte`
            }
            className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
              selected
                ? "border-gold bg-gold text-ink"
                : "border-white/80 bg-black/45 text-white hover:border-gold hover:text-gold"
            }`}
          >
            {selected ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
        {/* name + location */}
        <div className="absolute inset-x-[14px] bottom-3">
          <div className="font-display text-[18px] font-600 uppercase leading-none text-white">
            {athlete.full_name}
          </div>
          <div className="mt-0.5 text-[10px] text-white/65">
            {athlete.city}, {athlete.province}
          </div>
        </div>
      </Link>

      {/* footer row */}
      <Link
        href={`/atleta/${athlete.slug}`}
        className="flex items-center justify-between px-[14px] py-3"
      >
        <div className="text-[11px] text-white/60">
          <strong className="font-display text-[14px] text-gold">{formatMoney(athlete.raised_amount)}</strong>{" "}
          aportados
        </div>
        <span className="font-display text-[11px] font-600 uppercase tracking-[.04em] text-gold">
          Conocelo →
        </span>
      </Link>
    </article>
  );
}
