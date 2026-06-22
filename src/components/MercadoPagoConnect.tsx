"use client";

import { useState } from "react";
import { asset } from "@/config/site";

const MP_BLUE = "#009ee3";

/**
 * "Conectar Mercado Pago" — flujo realista SIN la API real (simulación visual).
 * Captura el alias/CVU y lo deja en un input oculto `mercadopago` para que se
 * envíe con la postulación. Cuando se implemente el OAuth real de Mercado Pago,
 * este componente se reemplaza por el botón de conexión verdadero.
 */
export function MercadoPagoConnect() {
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const [alias, setAlias] = useState("");

  function vincular() {
    if (!alias.trim()) return;
    setConnected(true);
    setOpen(false);
  }

  return (
    <div>
      <span className="eyebrow text-steel">¿Cómo cobrás los aportes?</span>
      <input type="hidden" name="mercadopago" value={connected ? alias : ""} />

      {connected ? (
        <div
          className="mt-1 flex items-center gap-3 rounded-xl border p-4"
          style={{ borderColor: `${MP_BLUE}66`, backgroundColor: `${MP_BLUE}0d` }}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: "#16a34a" }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden>
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display font-600 text-ink">Mercado Pago vinculado</div>
            <div className="truncate text-sm text-steel">{alias}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setConnected(false);
              setOpen(true);
            }}
            className="shrink-0 text-sm font-600 text-celeste-deep hover:underline"
          >
            Cambiar
          </button>
        </div>
      ) : open ? (
        <div className="mt-1 rounded-xl border border-line p-4">
          <label className="block text-sm">
            <span className="eyebrow text-steel">Alias, CVU o CBU de tu Mercado Pago</span>
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="tu.alias.mp"
              autoFocus
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-celeste"
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={vincular}
              disabled={!alias.trim()}
              className="flex-1 rounded-lg py-2.5 font-display text-sm font-700 uppercase tracking-wide text-white transition disabled:opacity-50"
              style={{ backgroundColor: MP_BLUE }}
            >
              Vincular cuenta
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-line px-4 text-sm font-600 text-steel hover:text-ink"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-4 rounded-xl border border-line bg-paper p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/logos/mercado-pago.svg")} alt="Mercado Pago" className="h-7 w-auto shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm font-600 text-ink">
              Cobrás por Mercado Pago
            </div>
            <div className="text-xs text-steel">
              Vinculá tu cuenta para recibir los aportes directo, en pesos.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-lg px-4 py-2 font-display text-sm font-600 uppercase tracking-wide text-white transition hover:brightness-95"
            style={{ backgroundColor: MP_BLUE }}
          >
            Conectar
          </button>
        </div>
      )}
    </div>
  );
}
