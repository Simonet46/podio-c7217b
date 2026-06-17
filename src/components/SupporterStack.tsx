import { supportersFor, initialsOf, tierColor } from "@/lib/supporters";

/** Pila de avatares de hinchas (iniciales), con "+N" al final. */
export function SupporterStack({
  slug,
  count,
  max = 5,
}: {
  slug: string;
  count: number;
  max?: number;
}) {
  const take = Math.min(max, count);
  const show = supportersFor(slug, take);
  const extra = count - show.length;

  return (
    <div className="flex -space-x-2" aria-hidden>
      {show.map((s, i) => (
        <span
          key={i}
          title={s.name}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper font-display text-[0.6rem] font-700 text-white"
          style={{ backgroundColor: tierColor(s.tier) }}
        >
          {initialsOf(s.name)}
        </span>
      ))}
      {extra > 0 && (
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-paper bg-ink px-1 font-display text-[0.55rem] font-700 text-white">
          +{extra > 999 ? "999" : extra}
        </span>
      )}
    </div>
  );
}
