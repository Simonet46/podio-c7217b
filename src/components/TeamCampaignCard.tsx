import Link from "next/link";
import { SPORT_LIST } from "@/config/sports";
import { formatMoney } from "@/lib/money";
import {
  campaignDaysLeft,
  campaignEnded,
  type TeamCampaign,
} from "@/lib/data/campaigns";

/** Color del deporte por etiqueta (los equipos guardan el label libre). */
export function sportColorForTeam(label: string): string {
  const found = SPORT_LIST.find(
    (s) => s.label.toLowerCase() === label.toLowerCase(),
  );
  return found?.color ?? "#6CB4E4";
}

/**
 * Barra de progreso de una campaña de equipo.
 * El total puede SUPERAR el objetivo: la barra se llena y aparece el
 * badge "Objetivo superado". Si no hay objetivo cargado, muestra solo el total.
 */
export function CampaignBar({
  campaign,
  compact,
}: {
  campaign: TeamCampaign;
  compact?: boolean;
}) {
  const { goal_amount: goal, raised_amount: raised } = campaign;
  const pct = goal > 0 ? (raised / goal) * 100 : 0;
  const over = goal > 0 && raised > goal;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <span
            className={`font-display font-700 tabular-nums text-gold ${compact ? "text-[20px]" : "text-[26px]"}`}
          >
            {formatMoney(raised)}
          </span>
          <span className="ml-1.5 text-[12px] text-white/45">
            recaudados
          </span>
        </div>
        {goal > 0 && (
          <span className="text-[12px] text-white/45">
            objetivo {formatMoney(goal)}
          </span>
        )}
      </div>

      {goal > 0 && (
        <>
          <div
            className="mt-2 h-[10px] overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,.08)" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${Math.min(pct, 100)}%`,
                background: over
                  ? "linear-gradient(90deg,#C9A227,#6CB4E4)"
                  : "linear-gradient(90deg,#a8871f,#C9A227)",
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[12px]">
            <span className="font-600 tabular-nums" style={{ color: over ? "#6CB4E4" : "#C9A227" }}>
              {Math.round(pct)}%
            </span>
            {over && (
              <span
                className="rounded-full px-2 py-0.5 font-display text-[10px] font-700 uppercase tracking-wide"
                style={{ background: "rgba(108,180,228,.15)", color: "#6CB4E4", border: "1px solid rgba(108,180,228,.4)" }}
              >
                ¡Objetivo superado!
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Chip con los días restantes (o el estado) de la campaña. */
export function CampaignDaysChip({ campaign }: { campaign: TeamCampaign }) {
  const days = campaignDaysLeft(campaign);
  if (days === null) return null;
  const ended = days < 0;
  const label = ended
    ? "Campaña finalizada"
    : days === 0
      ? "Último día"
      : `Quedan ${days} día${days === 1 ? "" : "s"}`;
  const color = ended ? "rgba(255,255,255,.45)" : days <= 7 ? "#f87171" : "#6CB4E4";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-wide"
      style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

/**
 * Tarjeta de campaña de equipo para el home: crowdfunding de una misión
 * concreta (viaje a un torneo, materiales). Espejo de las cards de atletas
 * pero centrada en el objetivo y el plazo.
 */
export function TeamCampaignCard({ campaign }: { campaign: TeamCampaign }) {
  const color = sportColorForTeam(campaign.sport);
  const initials = campaign.team_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const ended = campaignEnded(campaign);

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
      style={{
        background: "#0d2238",
        border: "1px solid rgba(255,255,255,.08)",
        borderTop: `4px solid ${color}`,
        boxShadow: "0 10px 30px rgba(0,0,0,.35)",
      }}
    >
      <div className="flex items-start gap-4 p-6 pb-0">
        {/* Escudo del equipo (iniciales sobre el color del deporte) */}
        <div
          className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[14px] font-display text-[20px] font-700"
          style={{ background: `${color}22`, border: `2px solid ${color}55`, color }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <span
            className="inline-block rounded-[3px] px-2 py-0.5 font-display text-[10px] font-600 uppercase tracking-[0.1em] text-white"
            style={{ backgroundColor: color }}
          >
            {campaign.sport}
          </span>
          <h3 className="mt-1.5 truncate font-display text-[22px] font-700 uppercase leading-none text-white">
            {campaign.team_name}
          </h3>
          {campaign.competition && (
            <p className="mt-1 truncate text-[13px] text-white/55">
              🎯 {campaign.competition}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 pt-4">
        {campaign.goal_purpose && (
          <p className="mb-4 text-[14px] leading-relaxed text-white/65 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
            {campaign.goal_purpose}
          </p>
        )}

        <div className="mt-auto">
          <CampaignBar campaign={campaign} compact />
          <div className="mt-4 flex items-center justify-between gap-3">
            <CampaignDaysChip campaign={campaign} />
            <Link
              href={`/equipos/${campaign.slug}`}
              className="rounded-md px-4 py-2.5 font-display text-[13px] font-700 uppercase tracking-wide transition-transform hover:scale-[1.03]"
              style={
                ended
                  ? { border: "1px solid rgba(255,255,255,.25)", color: "rgba(255,255,255,.7)" }
                  : { background: "#C9A227", color: "#0A1A2F" }
              }
            >
              {ended ? "Ver campaña" : "Sumá tu granito"}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
