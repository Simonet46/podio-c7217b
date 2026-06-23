import Link from "next/link";
import Image from "next/image";
import type { Team } from "@/lib/data/types";
import { getSport } from "@/config/sports";
import { asset } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { supporterCount } from "@/lib/supporters";
import { Monogram } from "./Monogram";
import { SupporterStack } from "./SupporterStack";

export function TeamCard({ team }: { team: Team }) {
  const sport = getSport(team.sport);
  const color = sport?.color ?? "#1B7A4B";
  const backers = supporterCount(team.raised_amount);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-paper shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/equipo/${team.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
        aria-label={`Ver ${team.name}`}
      >
        {team.photo_url ? (
          <Image
            src={asset(team.photo_url)}
            alt={team.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Monogram
            name={team.name}
            color={color}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {/* Doble badge: EQUIPO + deporte */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-gold px-2.5 py-1 font-display text-[0.7rem] font-700 uppercase tracking-wide text-ink">
            Equipo
          </span>
          <span
            className="rounded-full px-2.5 py-1 font-display text-[0.7rem] font-600 uppercase tracking-wide text-white"
            style={{ backgroundColor: "rgba(10,26,47,0.72)" }}
          >
            {sport?.label ?? team.sport}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl font-600 leading-tight text-ink">
          <Link href={`/equipo/${team.slug}`} className="hover:text-celeste-deep">
            {team.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-steel">
          {team.discipline} · {team.member_slugs.length}+ jugadores
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <SupporterStack slug={team.slug} count={backers} />
          <div className="text-right font-display leading-tight">
            <div className="text-sm">
              <span className="font-700 text-celeste-deep">{backers}</span>{" "}
              <span className="text-steel">apoyando</span>
            </div>
            <div className="text-sm font-600 text-ink">
              {formatMoney(team.raised_amount)}
            </div>
          </div>
        </div>

        <Link
          href={`/equipo/${team.slug}`}
          className="mt-4 block rounded-md border border-ink bg-ink py-2.5 text-center font-display text-sm font-600 uppercase tracking-wide text-white transition-colors hover:bg-ink-2"
        >
          Apoyar al equipo
        </Link>
      </div>
    </article>
  );
}
