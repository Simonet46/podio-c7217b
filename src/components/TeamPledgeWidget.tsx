"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { formatMoney } from "@/lib/money";
import { recordAcceptance } from "@/lib/legal";
import { type TeamCampaign } from "@/lib/data/campaigns";
import { CampaignBar } from "./TeamCampaignCard";

const PRESETS = [5000, 10000, 25000, 50000];

/**
 * Widget de aporte a una campaña de equipo. Funciona IGUAL QUE UN ATLETA:
 * el aporte se debita al instante y va directo a la cuenta de Mercado Pago del
 * equipo (split 93/7). No pasa por GRANITO ni espera a llegar al objetivo —
 * el objetivo es solo una referencia visual.
 *
 * La barra usa el recaudado EN VIVO (se refresca desde public_teams al montar),
 * así no queda clavada en el valor del último "Publicar ahora".
 */
export function TeamPledgeWidget({ campaign }: { campaign: TeamCampaign }) {
  const [live, setLive] = useState({
    raised_amount: campaign.raised_amount,
    donor_count: campaign.donor_count,
  });
  const [amount, setAmount] = useState<number | null>(PRESETS[1]);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Refrescar el total real al montar (la página estática puede estar vieja).
  useEffect(() => {
    (async () => {
      const supabase = await getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from("public_teams")
        .select("raised_amount,donor_count")
        .eq("id", campaign.id)
        .maybeSingle();
      if (data) {
        setLive({
          raised_amount: Number(data.raised_amount) || 0,
          donor_count: Number(data.donor_count) || 0,
        });
      }
    })();
  }, [campaign.id]);

  const finalAmount = custom ? Number(custom) : amount ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!finalAmount || finalAmount <= 0) {
      setError("Elegí o escribí un monto.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = await getSupabase();
    if (!supabase) {
      setError("El aporte no está disponible en este momento. Probá de nuevo.");
      setBusy(false);
      return;
    }
    // Evidencia de aceptación de los Términos del Donante (best-effort).
    void recordAcceptance({
      actorType: "donante",
      context: "donacion",
      docTypes: ["terminos-donante"],
      email: email.trim() || null,
      relatedId: campaign.slug,
      meta: { amount: finalAmount, kind: "team" },
    });
    try {
      const { data } = await supabase.functions.invoke("mp-create-team-preference", {
        body: { slug: campaign.slug, amount: finalAmount, donorEmail: email.trim() || undefined },
      });
      const url = data?.init_point ?? data?.sandbox_init_point;
      if (url) {
        window.location.href = url;
        return;
      }
      setError(data?.error ?? "No se pudo iniciar el pago. Probá de nuevo.");
    } catch {
      setError("No se pudo iniciar el pago. Probá de nuevo.");
    }
    setBusy(false);
  }

  return (
    <div
      className="rounded-2xl p-6 sm:p-7"
      style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 18px 50px rgba(0,0,0,.4)" }}
    >
      <CampaignBar campaign={{ ...campaign, ...live }} />
      <p className="mt-2 text-[12px] text-white/40">
        {live.donor_count > 0
          ? `${live.donor_count} ${live.donor_count === 1 ? "persona ya aportó" : "personas ya aportaron"} su granito.`
          : "Sé la primera persona en aportar tu granito."}
      </p>

      <div className="my-5 border-t border-white/[.08]" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="font-display text-[15px] font-600 uppercase tracking-wide text-white">
          Aportá al equipo
        </p>

        {/* Montos */}
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => {
            const on = !custom && amount === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => { setAmount(p); setCustom(""); setError(""); }}
                className="rounded-[10px] py-2.5 font-display text-[14px] font-600 tabular-nums transition-colors"
                style={on
                  ? { background: "#C9A227", color: "#0A1A2F", border: "1px solid #C9A227" }
                  : { background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.14)" }}
              >
                {formatMoney(p)}
              </button>
            );
          })}
        </div>
        <input
          type="number"
          min={1}
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setError(""); }}
          placeholder="Otro monto (ARS)"
          className="rounded-[10px] border border-white/[.14] bg-white/[.05] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email (opcional, para el comprobante)"
          autoComplete="email"
          className="rounded-[10px] border border-white/[.14] bg-white/[.05] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
        />

        {error && (
          <p className="rounded-[8px] p-3 text-[13px]" style={{ background: "rgba(220,38,38,.12)", color: "#f87171" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="rounded-[10px] bg-gold py-3.5 font-display text-[15px] font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {busy ? "Redirigiendo…" : `Aportar ${finalAmount > 0 ? formatMoney(finalAmount) : ""}`}
        </button>

        <p className="text-center text-[12px] leading-relaxed text-white/40">
          Tu aporte es una <strong className="text-white/60">donación</strong> (no una
          inversión). Se debita ahora y va directo al equipo (el 93%; el 7% sostiene la
          plataforma). Aunque no se llegue al objetivo, el equipo recibe todo lo
          recaudado. Pago seguro vía Mercado Pago.
          <br />
          Al aportar aceptás los{" "}
          <Link href="/legal/donantes" target="_blank" className="text-gold/80 underline hover:text-gold">
            Términos del Donante
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
