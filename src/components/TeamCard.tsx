import Link from "next/link";
import Image from "next/image";
import type { Team } from "@/lib/data/types";
import { getSport } from "@/config/sports";
import { asset } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { Monogram } from "./Monogram";

export function TeamCard({ team }: { team: Team }) {
  const sport = getSport(team.sport);
  const color = team.color ?? sport?.color ?? "#1B7A4B";

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl shadow-[0_26px_60px_rgba(0,0,0,.45)]"
      style={{ background: "#0d2238", borderTop: `3px solid ${color}` }}
    >
      <Link
        href={`/equipo/${team.slug}`}
        className="relative block overflow-hidden"
        style={{ aspectRatio: "3/4", background: "#0a1526" }}
        aria-label={`Ver ${team.name}`}
      >
        {team.photo_url ? (
          // object-contain: se ve el ícono ENTERO, nada recortado. El fondo
          // oscuro liso + el degradé de abajo lo funden con la card (igual
          // que las cards de atletas).
          <Image
            src={asset(team.photo_url)}
            alt={team.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <Monogram
            name={team.name}
            color={color}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {/* Difuminado inferior: la imagen se funde con el cuerpo de la card. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
          style={{ background: "linear-gradient(180deg, transparent, #0d2238 88%)" }}
          aria-hidden
        />
        {/* Badges: Selección Argentina + deporte */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-gold px-2.5 py-1 font-display text-[0.7rem] font-700 uppercase tracking-wide text-ink">
            🇦🇷 Selección
          </span>
          <span
            className="rounded-full px-2.5 py-1 font-display text-[0.7rem] font-600 uppercase tracking-wide text-white"
            style={{ backgroundColor: "rgba(10,26,47,0.72)" }}
          >
            {sport?.label ?? team.sport}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <h3 className="font-display text-xl font-600 leading-tight text-white">
          <Link href={`/equipo/${team.slug}`} className="hover:text-celeste">
            {team.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-white/65">{team.discipline}</p>

        {team.raised_amount > 0 && (
          <div className="mt-4 text-right font-display leading-tight">
            <span className="text-sm font-700 text-gold">{formatMoney(team.raised_amount)}</span>{" "}
            <span className="text-sm text-white/70">entre el plantel</span>
          </div>
        )}

        <Link
          href={`/equipo/${team.slug}`}
          className="mt-4 block rounded-md bg-gold py-2.5 text-center font-display text-sm font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
        >
          Conocé la selección
        </Link>
      </div>
    </article>
  );
}
