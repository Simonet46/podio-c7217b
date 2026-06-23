import { supportersFor, initialsOf, tierColor } from "@/lib/supporters";
import { DIPLOMA_TIERS } from "@/config/site";

/** Muro de "los que apoyan": reconocimiento a la gente que aporta. */
export function SupporterWall({
  slug,
  count,
  label,
}: {
  slug: string;
  count: number;
  /** A quién apoyan, ej. "Lucía" o "el equipo". */
  label: string;
}) {
  const take = Math.min(14, count);
  const list = supportersFor(slug, take);
  const extra = count - list.length;

  return (
    <div>
      <h2 className="font-display text-2xl font-600 uppercase tracking-wide text-ink">
        Los que apoyan a {label}
      </h2>
      <p className="mt-1 text-sm text-steel">
        <span className="font-600 text-ink">{count.toLocaleString("es-AR")}</span>{" "}
        personas ya pusieron el hombro. Gracias a ellas, esto avanza.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {list.map((s, i) => (
          <span
            key={i}
            className="flex items-center gap-2 rounded-full border border-line bg-paper py-1.5 pl-1.5 pr-3"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full font-display text-[0.6rem] font-700 text-white"
              style={{ backgroundColor: tierColor(s.tier) }}
            >
              {initialsOf(s.name)}
            </span>
            <span className="text-sm text-ink">{s.name}</span>
          </span>
        ))}
        {extra > 0 && (
          <span className="flex items-center rounded-full border border-line bg-ice px-3 py-1.5 text-sm font-600 text-steel">
            +{extra.toLocaleString("es-AR")} más
          </span>
        )}
      </div>

      {/* Leyenda de niveles (igual que el diploma) */}
      <div className="mt-4 flex flex-wrap gap-4">
        {(["oro", "plata", "bronce"] as const).map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-xs text-steel">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: DIPLOMA_TIERS[t].color }}
            />
            Hincha {DIPLOMA_TIERS[t].label}
          </span>
        ))}
      </div>
    </div>
  );
}
