"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { randomActivity, type Activity, type ActivityTarget } from "@/lib/activity";
import { tierColor, initialsOf } from "@/lib/supporters";
import { formatMoney } from "@/lib/money";

/**
 * Toast sutil de actividad: cada ~16s asoma un aporte reciente abajo a la
 * izquierda y se va solo. Se puede cerrar (no vuelve a aparecer en la sesión).
 */
export function LiveToast({ targets }: { targets: ActivityTarget[] }) {
  const [current, setCurrent] = useState<Activity | null>(null);
  const [closed, setClosed] = useState(false);
  const idRef = useRef(1);

  useEffect(() => {
    if (!targets.length || closed) return;
    let hideTimer: number;
    const show = () => {
      setCurrent(randomActivity(targets, Date.now(), idRef.current++));
      hideTimer = window.setTimeout(() => setCurrent(null), 5500);
    };
    const first = window.setTimeout(show, 9000);
    const loop = window.setInterval(show, 16000);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(hideTimer);
      window.clearInterval(loop);
    };
  }, [targets, closed]);

  if (closed || !current) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 max-w-[320px]">
      <div className="toast-in pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-paper/95 p-3 pr-9 shadow-lg backdrop-blur">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[0.65rem] font-700 text-white"
          style={{ backgroundColor: tierColor(current.tier) }}
        >
          {initialsOf(current.name)}
        </span>
        <p className="text-sm leading-snug text-ink">
          <span className="font-600">{current.name}</span>{" "}
          <span className="text-steel">acaba de apoyar a</span>{" "}
          <Link href={current.target.href} className="font-600 text-celeste-deep hover:underline">
            {current.target.label}
          </Link>{" "}
          <span className="whitespace-nowrap font-display font-700 text-ink">
            · {formatMoney(current.amount)}
          </span>
        </p>
        <button
          onClick={() => setClosed(true)}
          aria-label="Cerrar"
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-steel hover:bg-ice hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
