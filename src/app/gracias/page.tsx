"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Diploma } from "@/components/Diploma";
import { SEED_ATHLETES } from "@/lib/data/seed";
import { SEED_TEAMS } from "@/lib/data/teams";
import { breakdown, formatMoney } from "@/lib/money";
import { DIPLOMA_TIERS, diplomaTier } from "@/config/site";

function GraciasContent() {
  const sp = useSearchParams();
  const kind = sp.get("kind") ?? "athlete";
  const slug = sp.get("slug") ?? "";
  const amount = parseFloat(sp.get("amount") ?? "0") || 0;
  // Los aportes recurrentes están desactivados (MP no permite el split del 7%
  // en suscripciones). Todo aporte es único hasta que se reactive con MP.
  const split = parseInt(sp.get("split") ?? "0", 10) || 0;
  const perMonth = false;
  const { net } = breakdown(amount);

  // Campaña de equipo (crowdfunding de misión): el nombre viene en la URL
  // porque el equipo no está en el seed local.
  const isCampaign = kind === "campaign";
  const campaignName = sp.get("name") ?? "";

  const athlete =
    kind === "athlete" && slug
      ? SEED_ATHLETES.find((a) => a.slug === slug) ?? null
      : null;
  const team =
    kind === "team" && slug ? SEED_TEAMS.find((t) => t.slug === slug) ?? null : null;

  const targetName =
    kind === "all"
      ? `los ${split} atletas`
      : isCampaign
        ? campaignName || "el equipo"
        : kind === "team"
          ? team?.name ?? "todo el equipo"
          : athlete?.full_name ?? null;

  // Las selecciones nacionales (kind=team) reparten entre jugadores; una campaña
  // de equipo (kind=campaign) va a una sola cuenta, no se reparte.
  const isSplit = kind === "all" || kind === "team";
  const perEach = split > 0 ? net / split : net;

  const tierKey = amount > 0 ? diplomaTier(amount) : "bronce";
  const tier = DIPLOMA_TIERS[tierKey];
  const displayName = athlete?.full_name ?? team?.name ?? targetName ?? "el deporte argentino";

  return (
    <div className="mx-auto max-w-[860px] px-4 pb-20 pt-10 sm:px-6">
      {/* ── Encabezado ── */}
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{
            background: "rgba(34,197,94,.16)",
            border: "1px solid rgba(34,197,94,.5)",
          }}
        >
          ✓
        </div>
        <h1 className="font-display text-[44px] font-700 uppercase leading-none tracking-tight">
          ¡Ya sos parte!
        </h1>
        {targetName && (
          <p className="mx-auto mt-3 max-w-[480px] text-[17px] leading-[1.55] text-white/70">
            Tu aporte{perMonth ? " mensual" : ""} a{" "}
            <strong className="text-white">{targetName}</strong> se registró.
            Te ganaste tu diploma de hincha.
          </p>
        )}
      </div>

      {/* ── Resumen de aporte ── */}
      {amount > 0 && (
        <div
          className="mb-6 rounded-xl p-5"
          style={{
            background: "#0d2238",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <div className="flex flex-col gap-2.5">
            <Row label="Tu aporte" value={`${formatMoney(amount, { cents: true })}${perMonth ? " / mes" : ""}`} />
            <div className="h-px" style={{ background: "rgba(255,255,255,.07)" }} />
            {isSplit ? (
              <Row
                label={perMonth ? "Cada atleta recibe / mes" : `Cada atleta recibe (entre ${split})`}
                value={formatMoney(perEach, { cents: true })}
                accent
              />
            ) : (
              <Row
                label={isCampaign ? "El equipo recibe (neto del 7%)" : perMonth ? "El atleta recibe / mes" : "El atleta recibe (neto del 7%)"}
                value={formatMoney(net, { cents: true })}
                accent
              />
            )}
            <Row label="Tipo" value={perMonth ? "Mensual" : "Único"} />
          </div>

          {/* Barra 93/7 */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="text-white/65">Para {isSplit ? "los atletas" : isCampaign ? "el equipo" : "el atleta"} <span className="text-white/45">(93%)</span></span>
              <span className="font-display font-700 text-gold">{formatMoney(net, { cents: true })}</span>
            </div>
            <div
              className="flex h-2 overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,.08)" }}
            >
              <div className="h-full rounded-full" style={{ width: "93%", background: "#C9A227" }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Diploma ── */}
      {amount > 0 && (
        <>
          <div className="mb-4 text-center">
            <div
              className="mb-1 inline-flex items-center gap-2 rounded-full px-3 py-1 font-display text-[11px] font-600 uppercase tracking-[.1em]"
              style={{ background: `${tier.color}22`, color: tier.color, border: `1px solid ${tier.color}55` }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: tier.color }} />
              Nivel {tier.label}
            </div>
          </div>
          <Diploma
            amount={amount}
            monthly={perMonth}
            targetPhrase={
              kind === "all"
                ? "todos los atletas argentinos"
                : displayName
            }
          />
        </>
      )}

      {/* ── Acciones ── */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {athlete && (
          <Link
            href={`/atleta/${athlete.slug}`}
            className="rounded-md border border-white/25 px-6 py-3 font-display text-sm font-600 uppercase tracking-wide text-white transition-colors hover:border-white"
          >
            Volver al perfil
          </Link>
        )}
        {team && (
          <Link
            href={`/equipo/${team.slug}`}
            className="rounded-md border border-white/25 px-6 py-3 font-display text-sm font-600 uppercase tracking-wide text-white transition-colors hover:border-white"
          >
            Volver al equipo
          </Link>
        )}
        {isCampaign && slug && (
          <Link
            href={`/equipos/${slug}`}
            className="rounded-md border border-white/25 px-6 py-3 font-display text-sm font-600 uppercase tracking-wide text-white transition-colors hover:border-white"
          >
            Volver a la campaña
          </Link>
        )}
        <Link
          href="/#atletas"
          className="rounded-md bg-gold px-6 py-3 font-display text-sm font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
        >
          Apoyar a otro atleta
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[13px] text-white/65">{label}</span>
      <span
        className={`font-display text-[15px] tabular-nums ${accent ? "font-700 text-gold" : "font-600 text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <>
      <Header />
      <main className="bg-ink text-white">
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <GraciasContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
