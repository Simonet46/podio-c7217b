import Link from "next/link";
import Image from "next/image";
import type { Athlete } from "@/lib/data/types";
import { getSport } from "@/config/sports";
import { asset } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { Monogram } from "./Monogram";

export function AthleteCard({ athlete }: { athlete: Athlete }) {
  const sport = getSport(athlete.sport);
  const color = sport?.color ?? "#1E6E8C";

  return (
    <article
      className="group relative overflow-hidden rounded-xl shadow-[0_26px_60px_rgba(0,0,0,.45)]"
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
          className="absolute left-3.5 top-3.5 rounded-[3px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[.12em] text-white"
          style={{ backgroundColor: color }}
        >
          {sport?.label ?? athlete.sport}
        </span>
        {/* name + location */}
        <div className="absolute inset-x-[18px] bottom-3.5">
          <div className="font-display text-[23px] font-600 uppercase leading-none text-white">
            {athlete.full_name}
          </div>
          <div className="mt-0.5 text-[12px] text-white/65">
            {athlete.city}, {athlete.province}
          </div>
        </div>
      </Link>

      {/* footer row */}
      <Link
        href={`/atleta/${athlete.slug}`}
        className="flex items-center justify-between px-[18px] py-4"
      >
        <div className="text-[13px] text-white/60">
          <strong className="font-display text-[17px] text-gold">{formatMoney(athlete.raised_amount)}</strong>{" "}
          aportados
        </div>
        <span className="font-display text-[13px] font-600 uppercase tracking-[.04em] text-gold">
          Conocelo →
        </span>
      </Link>
    </article>
  );
}
