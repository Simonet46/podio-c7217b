import Link from "next/link";
import { SPORT_LIST } from "@/config/sports";
import { asset } from "@/config/site";
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

function daysLabel(campaign: TeamCampaign): string {
  const days = campaignDaysLeft(campaign);
  if (days === null) return "Campaña abierta";
  if (days < 0) return "Finalizada";
  if (days === 0) return "Último día";
  return `${days} día${days === 1 ? "" : "s"}`;
}

/**
 * Barra de avance de campaña, estilo "medidor con manija":
 *  fila superior  → días restantes · objetivo
 *  barra          → relleno hasta el % con una manija circular en la posición
 *  fila inferior  → % · recaudado (debajo de la manija)
 * El total puede superar el objetivo (manija al 100% + "¡superado!").
 */
export function CampaignBar({
  campaign,
  compact,
}: {
  campaign: TeamCampaign;
  compact?: boolean;
}) {
  const { goal_amount: goal, raised_amount: raised } = campaign;

  // Sin objetivo cargado: mostramos solo el recaudado.
  if (goal <= 0) {
    return (
      <div>
        <span className={`font-display font-700 tabular-nums text-gold ${compact ? "text-[20px]" : "text-[26px]"}`}>
          {formatMoney(raised)}
        </span>
        <span className="ml-1.5 text-[12px] text-white/45">recaudados</span>
      </div>
    );
  }

  const pct = (raised / goal) * 100;
  const clamped = Math.min(pct, 100);
  const over = raised > goal;
  const fill = over ? "linear-gradient(90deg,#C9A227,#6CB4E4)" : "#C9A227";
  const accent = over ? "#6CB4E4" : "#C9A227";
  // La etiqueta del recaudado sigue a la manija, pero sin pegarse a los bordes.
  const labelLeft = Math.min(Math.max(clamped, 14), 86);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={`font-display font-700 text-white ${compact ? "text-[13px]" : "text-[15px]"}`}>
          {daysLabel(campaign)}
        </span>
        <span className={`font-display font-700 tabular-nums text-white ${compact ? "text-[13px]" : "text-[15px]"}`}>
          {formatMoney(goal)}
        </span>
      </div>

      {/* Barra + manija */}
      <div className="relative mt-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,.1)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
          style={{ width: `${clamped}%`, background: fill }}
        />
        <div
          className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-700"
          style={{ left: `${clamped}%`, background: "#0A1A2F", border: `4px solid ${accent}`, boxShadow: "0 2px 8px rgba(0,0,0,.5)" }}
          aria-hidden
        />
      </div>

      {/* % + recaudado bajo la manija */}
      <div className="relative mt-2 h-[20px]">
        <span className="absolute left-0 top-0 font-display text-[14px] font-700 tabular-nums" style={{ color: accent }}>
          {Math.round(pct)}%
        </span>
        <span
          className="absolute top-0 -translate-x-1/2 font-display text-[14px] font-700 tabular-nums"
          style={{ left: `${labelLeft}%`, color: accent }}
        >
          {formatMoney(raised)}
        </span>
      </div>

      {over && (
        <div className="mt-1.5 text-[11px] font-600 uppercase tracking-wide" style={{ color: "#6CB4E4" }}>
          ¡Objetivo superado!
        </div>
      )}
    </div>
  );
}

/** Chip con los días restantes (usado en la página de campaña). */
export function CampaignDaysChip({ campaign }: { campaign: TeamCampaign }) {
  const days = campaignDaysLeft(campaign);
  if (days === null) return null;
  const ended = days < 0;
  const label = ended ? "Campaña finalizada" : days === 0 ? "Último día" : `Quedan ${days} día${days === 1 ? "" : "s"}`;
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
 * Tarjeta de campaña de equipo para el home: foto arriba, misión, y el medidor
 * de avance. Espejo del diseño de referencia adaptado al estilo de GRANITO.
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
  const photo = campaign.photo_url;

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
      style={{
        background: "#0d2238",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,.35)",
      }}
    >
      {/* Foto */}
      <div className="relative h-[200px] w-full shrink-0" style={{ background: `${color}22` }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(photo)} alt={campaign.team_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-[56px] font-700" style={{ color }}>
            {initials}
          </div>
        )}
        <span
          className="absolute left-4 top-4 rounded-[4px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[0.1em] text-white"
          style={{ backgroundColor: color }}
        >
          {campaign.sport}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-[22px] font-700 uppercase leading-none text-white">
          {campaign.team_name}
        </h3>
        {campaign.competition && (
          <p className="mt-1.5 truncate text-[13px] text-white/55">🎯 {campaign.competition}</p>
        )}
        {campaign.goal_purpose && (
          <p className="mt-3 text-[14px] leading-relaxed text-white/65 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {campaign.goal_purpose}
          </p>
        )}

        <div className="mt-5">
          <CampaignBar campaign={campaign} compact />
        </div>

        <Link
          href={`/equipos/${campaign.slug}`}
          className="mt-5 block rounded-md px-4 py-3 text-center font-display text-[13px] font-700 uppercase tracking-wide transition-transform hover:scale-[1.02]"
          style={
            ended
              ? { border: "1px solid rgba(255,255,255,.25)", color: "rgba(255,255,255,.7)" }
              : { background: "#C9A227", color: "#0A1A2F" }
          }
        >
          {ended ? "Ver campaña" : "Sumá tu granito"}
        </Link>
      </div>
    </article>
  );
}
