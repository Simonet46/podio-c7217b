"use client";

import { formatMoney } from "@/lib/money";

/**
 * Deslizador de monto: el hincha arrastra y el monto se escribe solo.
 * Los botones de montos fijos siguen siendo atajos que también lo mueven.
 * Escala en pasos de `step` entre `min` y `max`; en celular el pulgar es
 * grande (24px) para que se pueda arrastrar sin apuntar fino.
 */
export function AmountSlider({
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  /** Texto bajo el deslizador (p. ej. "Con tu aporte llegamos al 14%"). */
  hint?: string;
}) {
  const v = Math.min(Math.max(value || min, min), max);
  const pct = ((v - min) / Math.max(1, max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-white/45">Deslizá para elegir</span>
        <span className="font-display text-[20px] font-700 tabular-nums text-gold">{formatMoney(v)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Monto del aporte"
        className="granito-range mt-2 w-full"
        style={{ background: `linear-gradient(90deg,#C9A227 ${pct}%,rgba(255,255,255,.12) ${pct}%)` }}
      />
      <div className="mt-1 flex justify-between text-[11px] text-white/35">
        <span>{formatMoney(min)}</span>
        <span>{formatMoney(max)}</span>
      </div>
      {hint && <p className="mt-2 text-[13px] text-white/70">{hint}</p>}
    </div>
  );
}
