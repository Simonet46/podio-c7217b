"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { formatMoney } from "@/lib/money";
import { campaignEnded, type TeamCampaign } from "@/lib/data/campaigns";
import { CampaignBar } from "./TeamCampaignCard";

const PRESETS = [5000, 10000, 25000, 50000];

/**
 * Widget de compromiso de aporte para campañas de equipo.
 *
 * Modelo standby: acá NO se cobra nada. El hincha compromete un monto con su
 * email; cuando la campaña termina y GRANITO la valida desde el backoffice,
 * le llega el link de pago para hacerlo efectivo.
 *
 * La barra usa el total EN VIVO (se refresca desde la vista public_teams al
 * montar), así no queda clavada en el valor del último "Publicar ahora".
 */
export function TeamPledgeWidget({ campaign }: { campaign: TeamCampaign }) {
  const [live, setLive] = useState({
    pledged_amount: campaign.pledged_amount,
    pledge_count: campaign.pledge_count,
  });
  const [amount, setAmount] = useState<number | null>(PRESETS[1]);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const ended = campaignEnded(campaign);

  // Refrescar el total real al montar (la página estática puede estar vieja).
  useEffect(() => {
    (async () => {
      const supabase = await getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from("public_teams")
        .select("pledged_amount,pledge_count")
        .eq("id", campaign.id)
        .maybeSingle();
      if (data) {
        setLive({
          pledged_amount: Number(data.pledged_amount) || 0,
          pledge_count: Number(data.pledge_count) || 0,
        });
      }
    })();
  }, [campaign.id]);

  const finalAmount = custom ? Number(custom) : amount ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || ended) return;
    if (!finalAmount || finalAmount <= 0) {
      setError("Elegí o escribí un monto.");
      return;
    }
    if (!email) {
      setError("Dejanos tu email para avisarte cuando se valide la campaña.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = await getSupabase();
    if (!supabase) {
      setError("No se pudo enviar. Probá de nuevo en unos minutos.");
      setBusy(false);
      return;
    }
    const { error: err } = await supabase.from("team_pledges").insert({
      team_id: campaign.id,
      donor_name: name.trim() || null,
      donor_email: email.trim(),
      amount: finalAmount,
    });
    setBusy(false);
    if (err) {
      setError("No se pudo registrar tu aporte. Probá de nuevo.");
      return;
    }
    setLive((l) => ({
      pledged_amount: l.pledged_amount + finalAmount,
      pledge_count: l.pledge_count + 1,
    }));
    setDone(true);
  }

  return (
    <div
      className="rounded-2xl p-6 sm:p-7"
      style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 18px 50px rgba(0,0,0,.4)" }}
    >
      <CampaignBar campaign={{ ...campaign, ...live }} />
      <p className="mt-2 text-[12px] text-white/40">
        {live.pledge_count > 0
          ? `${live.pledge_count} persona${live.pledge_count === 1 ? " ya comprometió" : "s ya comprometieron"} su granito.`
          : "Sé la primera persona en comprometer su granito."}
      </p>

      <div className="my-5 border-t border-white/[.08]" />

      {ended ? (
        <div
          className="rounded-[12px] p-5 text-center text-[14px] leading-relaxed"
          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)" }}
        >
          <strong className="text-white">La campaña ya cerró.</strong>
          <br />
          GRANITO está validando los aportes comprometidos. Si dejaste el tuyo,
          te llega un email con el link de pago.
        </div>
      ) : done ? (
        <div
          className="rounded-[12px] p-5 text-center text-[15px] leading-relaxed"
          style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.4)", color: "#22c55e" }}
        >
          ✓ ¡Compromiso registrado por{" "}
          <strong>{formatMoney(finalAmount)}</strong>!
          <br />
          <span className="text-[13px] opacity-85">
            No se te cobró nada. Cuando la campaña termine y se valide, te llega
            un email a <strong>{email}</strong> con el link de pago.
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="font-display text-[15px] font-600 uppercase tracking-wide text-white">
            Comprometé tu aporte
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
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre (opcional)"
            autoComplete="name"
            className="rounded-[10px] border border-white/[.14] bg-white/[.05] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="tu@email.com"
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
            {busy ? "Enviando…" : `Comprometer ${finalAmount > 0 ? formatMoney(finalAmount) : "mi aporte"}`}
          </button>

          <p className="text-center text-[12px] leading-relaxed text-white/40">
            🔒 <strong className="text-white/60">Hoy no pagás nada.</strong> Tu
            aporte queda comprometido; al cierre de la campaña, GRANITO lo valida
            y te llega el link de pago por email.
          </p>
        </form>
      )}
    </div>
  );
}
