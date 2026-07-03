import type { AthleteUpdate } from "@/lib/data/athletes";
import { asset } from "@/config/site";

function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Timeline de novedades del atleta (ya aprobadas) en su perfil público.
 *  La idea: que el visitante acompañe una carrera, no solo done. */
export function AthleteTimeline({
  updates,
  firstName,
}: {
  updates: AthleteUpdate[];
  firstName: string;
}) {
  return (
    <div>
      <p className="eyebrow mb-3 text-gold">El camino</p>
      <h2 className="mb-6 font-display text-[28px] font-700 uppercase leading-none sm:text-[32px]">
        Novedades de {firstName}
      </h2>

      <div className="relative max-w-[620px]">
        {/* Línea vertical del timeline */}
        <div
          className="absolute bottom-2 left-[7px] top-2 w-px"
          style={{ background: "rgba(255,255,255,.12)" }}
          aria-hidden
        />

        <div className="space-y-7">
          {updates.map((u) => (
            <article key={u.id} className="relative pl-8">
              {/* Punto */}
              <span
                className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2"
                style={{ background: "#0A1A2F", borderColor: "#C9A227" }}
                aria-hidden
              />
              <time className="text-[12px] uppercase tracking-wide text-white/45">
                {fechaLarga(u.created_at)}
              </time>
              <h3 className="mt-1 font-display text-[19px] font-600 uppercase leading-tight text-white">
                {u.title}
              </h3>
              {u.image_url && (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/[.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(u.image_url)}
                    alt={u.title}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <p className="mt-2.5 whitespace-pre-line text-[15px] leading-relaxed text-white/70">
                {u.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
