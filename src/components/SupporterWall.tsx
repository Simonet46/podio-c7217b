"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { DIPLOMA_TIERS, type DiplomaTier } from "@/config/site";
import { apoyarSuffix, losQueApoyan, type Gender } from "@/lib/gender";

interface Supporter {
  donor_name: string | null;
  tier: DiplomaTier;
}

/**
 * Muro de hinchas con donantes REALES, leídos de las vistas públicas
 * (public_supporters / public_team_supporters): solo nombre y nivel —
 * nunca email ni monto exacto. Sin donantes todavía, un empty state honesto.
 */
export function SupporterWall({
  slug,
  kind,
  gender,
}: {
  slug: string;
  kind: "athlete" | "team";
  gender?: Gender;
}) {
  const [list, setList] = useState<Supporter[] | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = await getSupabase();
      if (!supabase) return setList([]);
      const view = kind === "athlete" ? "public_supporters" : "public_team_supporters";
      const col = kind === "athlete" ? "athlete_slug" : "team_slug";
      const { data } = await supabase
        .from(view)
        .select("donor_name,tier,created_at")
        .eq(col, slug)
        .order("created_at", { ascending: false })
        .limit(40);
      setList((data as Supporter[]) ?? []);
    })();
  }, [slug, kind]);

  // Mientras carga no mostramos nada: evita un "0 hinchas" fantasma.
  if (list === null) return null;

  const count = list.length;

  return (
    <div>
      <p className="eyebrow mb-2 text-gold">
        {kind === "team" ? "Las personas que los apoyan" : losQueApoyan(gender)}
      </p>
      <h2 className="font-display text-2xl font-600 uppercase tracking-wide text-white">
        Muro de hinchas
      </h2>

      {count === 0 ? (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
          Todavía no hay nombres en este muro.{" "}
          <strong className="text-white">
            Sé la primera persona en {kind === "team" ? "apoyarlos" : apoyarSuffix(gender)}
          </strong>{" "}
          — tu nombre puede quedar acá para siempre.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-white/55">
            <span className="font-600 text-white">{count.toLocaleString("es-AR")}</span>{" "}
            {count === 1 ? "persona ya puso" : "personas ya pusieron"} el hombro.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {list.map((s, i) => {
              const name = s.donor_name?.trim() || "Hincha anónimo";
              const initials = name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <span
                  key={i}
                  className="flex items-center gap-2 rounded-full border border-white/[.08] bg-[#0d2238] py-1.5 pl-1.5 pr-3"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full font-display text-[0.6rem] font-700 text-white"
                    style={{ backgroundColor: DIPLOMA_TIERS[s.tier]?.color ?? "#C17A3F" }}
                  >
                    {initials}
                  </span>
                  <span className="text-sm text-white/80">{name}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            {(["oro", "plata", "bronce"] as const).map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-white/55">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: DIPLOMA_TIERS[t].color }}
                />
                Hincha {DIPLOMA_TIERS[t].label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
