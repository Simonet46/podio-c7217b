"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { randomActivity, timeAgo, type Activity, type ActivityTarget } from "@/lib/activity";
import { tierColor, initialsOf } from "@/lib/supporters";
import { formatMoney } from "@/lib/money";

const SEED_OFFSETS = [3, 38, 120, 300, 720, 1500]; // segundos de antigüedad

/** Feed de aportes recientes que se actualiza solo (movimiento + FOMO). */
export function ActivityFeed({ targets }: { targets: ActivityTarget[] }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [, force] = useState(0);
  const idRef = useRef(1);

  useEffect(() => {
    if (!targets.length) return;
    const now = Date.now();
    setItems(
      SEED_OFFSETS.map((off) =>
        randomActivity(targets, now - off * 1000, idRef.current++),
      ),
    );
    const add = window.setInterval(() => {
      setItems((prev) =>
        [randomActivity(targets, Date.now(), idRef.current++), ...prev].slice(0, 6),
      );
    }, 4500);
    const tick = window.setInterval(() => force((x) => x + 1), 1000);
    return () => {
      window.clearInterval(add);
      window.clearInterval(tick);
    };
  }, [targets]);

  return (
    <div className="rounded-2xl border border-line bg-paper p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-gold" aria-hidden />
        <span className="eyebrow text-steel">Últimos aportes</span>
      </div>

      <ul className="space-y-1">
        {items.map((a) => (
          <li
            key={a.id}
            className="activity-item flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-ice"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[0.6rem] font-700 text-white"
              style={{ backgroundColor: tierColor(a.tier) }}
            >
              {initialsOf(a.name)}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm text-ink">
              <span className="font-600">{a.name}</span>{" "}
              <span className="text-steel">apoyó a</span>{" "}
              <Link href={a.target.href} className="font-600 text-celeste-deep hover:underline">
                {a.target.label}
              </Link>
            </p>
            <span className="shrink-0 font-display text-sm font-700 text-ink">
              {formatMoney(a.amount)}
            </span>
            <span className="hidden shrink-0 text-xs text-steel sm:inline">
              {timeAgo(Date.now() - a.ts)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
