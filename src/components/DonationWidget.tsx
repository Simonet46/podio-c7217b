"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DonationType } from "@/lib/data/types";
import { PRESET_AMOUNTS, PLATFORM_FEE_RATE } from "@/config/site";
import { breakdown, formatMoney } from "@/lib/money";
import { Ribbon } from "./Ribbon";

/** A quién va el aporte. */
export interface DonationTarget {
  kind: "athlete" | "team" | "all";
  /** slug del atleta o equipo (no aplica a 'all'). */
  slug?: string;
  /** Título del widget, ej. "Apoyá a Lucía". */
  title: string;
  /** Para 'team' y 'all': entre cuántos atletas se reparte el aporte. */
  splitCount?: number;
}

export function DonationWidget({ target }: { target: DonationTarget }) {
  const [type, setType] = useState<DonationType>("once");
  const [amount, setAmount] = useState<number>(PRESET_AMOUNTS.once[1]);
  const [custom, setCustom] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const presets = PRESET_AMOUNTS[type];
  const { fee, net } = breakdown(amount);
  const feePct = Math.round(PLATFORM_FEE_RATE * 100);
  const perMonth = type === "monthly";
  const split = target.splitCount && target.splitCount > 0 ? target.splitCount : null;
  const perEach = split ? net / split : net;

  const cta = useMemo(() => {
    if (amount <= 0) return "Ingresá un monto";
    return perMonth
      ? `Aportar ${formatMoney(amount)} por mes`
      : `Aportar ${formatMoney(amount)}`;
  }, [amount, perMonth]);

  function selectPreset(value: number) {
    setAmount(value);
    setCustom("");
  }

  function onCustom(raw: string) {
    setCustom(raw);
    const parsed = parseFloat(raw);
    setAmount(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
  }

  function switchType(next: DonationType) {
    setType(next);
    setAmount(PRESET_AMOUNTS[next][1]);
    setCustom("");
  }

  function handleSubmit() {
    if (amount <= 0 || loading) return;
    setLoading(true);
    // Modo demo (sitio estático): redirige a gracias sin cobro real.
    const params = new URLSearchParams({
      kind: target.kind,
      amount: String(amount),
      type,
    });
    if (target.slug) params.set("slug", target.slug);
    if (split) params.set("split", String(split));
    router.push(`/gracias?${params.toString()}`);
  }

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: "#0d2238",
        border: "1px solid rgba(201,162,39,.28)",
        boxShadow: "0 24px 60px rgba(0,0,0,.45)",
      }}
    >
      <Ribbon tall />
      <div className="p-5 sm:p-6">
        <h2 className="font-display text-xl font-600 uppercase tracking-wide text-white">
          {target.title}
        </h2>

        {/* Toggle único / mensual */}
        <div
          className="mt-4 grid grid-cols-2 rounded-lg p-1"
          style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}
          role="tablist"
          aria-label="Tipo de aporte"
        >
          {(["once", "monthly"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={type === t}
              onClick={() => switchType(t)}
              className={`rounded-md py-2 font-display text-sm font-600 uppercase tracking-wide transition-colors ${
                type === t
                  ? "bg-gold text-ink"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {t === "once" ? "Aporte único" : "Por mes"}
            </button>
          ))}
        </div>

        {/* Montos preset */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {presets.map((value) => {
            const selected = !custom && amount === value;
            return (
              <button
                key={value}
                onClick={() => selectPreset(value)}
                aria-pressed={selected}
                className="rounded-lg py-3 font-display text-lg font-600 transition-all"
                style={
                  selected
                    ? {
                        background: "rgba(201,162,39,.15)",
                        border: "1px solid rgba(201,162,39,.7)",
                        color: "#C9A227",
                      }
                    : {
                        background: "rgba(255,255,255,.05)",
                        border: "1px solid rgba(255,255,255,.1)",
                        color: "rgba(255,255,255,.8)",
                      }
                }
              >
                {formatMoney(value)}
                {perMonth && (
                  <span className="block text-[0.65rem] font-500 opacity-60">
                    por mes
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Monto libre */}
        <label className="mt-4 block">
          <span className="eyebrow text-white/40">Otro monto</span>
          <div
            className="mt-1 flex items-center rounded-lg px-3 transition-colors focus-within:border-celeste"
            style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" }}
          >
            <span className="font-display text-lg text-white/40">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step="1"
              value={custom}
              onChange={(e) => onCustom(e.target.value)}
              placeholder="0"
              aria-label="Monto personalizado en dólares"
              className="w-full bg-transparent px-2 py-2.5 font-display text-lg text-white outline-none placeholder:text-white/25"
            />
            {perMonth && (
              <span className="font-display text-sm text-white/40">/ mes</span>
            )}
          </div>
        </label>

        {/* Desglose transparente en vivo */}
        <dl
          className="mt-5 space-y-1.5 rounded-lg p-4 text-sm"
          style={{ background: "rgba(0,0,0,.25)", border: "1px solid rgba(255,255,255,.07)" }}
        >
          <Row label="Tu aporte" value={formatMoney(amount, { cents: true })} />
          <Row
            label={`Comisión plataforma (${feePct}%)`}
            value={`–${formatMoney(fee, { cents: true })}`}
            muted
          />
          <div className="my-1" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }} />
          {split ? (
            <>
              <Row
                label={`Se reparte entre ${split} ${target.kind === "team" ? "jugadores" : "atletas"}`}
                value={formatMoney(net, { cents: true })}
              />
              <Row
                label={perMonth ? "Cada uno recibe / mes" : "Cada uno recibe"}
                value={formatMoney(perEach, { cents: true })}
                strong
              />
            </>
          ) : (
            <Row
              label={perMonth ? "El atleta recibe / mes" : "El atleta recibe"}
              value={formatMoney(net, { cents: true })}
              strong
            />
          )}
        </dl>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={amount <= 0 || loading}
          className="mt-4 w-full rounded-lg bg-gold py-3.5 font-display text-base font-700 uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          style={{ boxShadow: amount > 0 ? "0 12px 28px rgba(201,162,39,.28)" : "none" }}
        >
          {loading ? "Redirigiendo…" : cta}
        </button>

        <p className="mt-3 text-center text-xs text-white/35">
          Pago seguro · procesado vía Stripe Connect
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={muted ? "text-white/35" : "text-white/65"}>{label}</dt>
      <dd
        className={`shrink-0 font-display tabular-nums ${
          strong
            ? "text-lg font-700 text-gold"
            : muted
              ? "text-white/35"
              : "font-600 text-white"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
