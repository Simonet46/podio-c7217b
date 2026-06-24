import { supportersFor, initialsOf, tierColor } from "@/lib/supporters";
import { DIPLOMA_TIERS } from "@/config/site";

/** Muro de "los que apoyan": reconocimiento a la gente que aporta. */
export function SupporterWall({
  slug,
  count,
  label,
  dark = false,
}: {
  slug: string;
  count: number;
  label: string;
  dark?: boolean;
}) {
  const take = Math.min(14, count);
  const list = supportersFor(slug, take);
  const extra = count - list.length;

  const textPrimary = dark ? "text-white" : "text-ink";
  const textSub = dark ? "text-white/55" : "text-steel";
  const chipBorder = dark ? "border-white/[.08]" : "border-line";
  const chipBg = dark ? "bg-[#0d2238]" : "bg-paper";
  const chipName = dark ? "text-white/80" : "text-ink";
  const extraBg = dark ? "bg-white/[.06]" : "bg-ice";

  return (
    <div>
      <p className={`eyebrow mb-2 ${dark ? "text-gold" : "text-celeste-deep"}`}>
        Los que la apoyan
      </p>
      <h2 className={`font-display text-2xl font-600 uppercase tracking-wide ${textPrimary}`}>
        Muro de hinchas
      </h2>
      <p className={`mt-1 text-sm ${textSub}`}>
        <span className={`font-600 ${textPrimary}`}>{count.toLocaleString("es-AR")}</span>{" "}
        personas ya pusieron el hombro. Gracias a ellas, esto avanza.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {list.map((s, i) => (
          <span
            key={i}
            className={`flex items-center gap-2 rounded-full border ${chipBorder} ${chipBg} py-1.5 pl-1.5 pr-3`}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full font-display text-[0.6rem] font-700 text-white"
              style={{ backgroundColor: tierColor(s.tier) }}
            >
              {initialsOf(s.name)}
            </span>
            <span className={`text-sm ${chipName}`}>{s.name}</span>
          </span>
        ))}
        {extra > 0 && (
          <span className={`flex items-center rounded-full border ${chipBorder} ${extraBg} px-3 py-1.5 text-sm font-600 ${textSub}`}>
            +{extra.toLocaleString("es-AR")} más
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {(["oro", "plata", "bronce"] as const).map((t) => (
          <span key={t} className={`flex items-center gap-1.5 text-xs ${textSub}`}>
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
