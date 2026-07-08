"use client";

import { useState } from "react";
import Link from "next/link";
import { SPORT_LIST } from "@/config/sports";
import { WEB3FORMS_ACCESS_KEY, APPLICATIONS_EMAIL, SITE } from "@/config/site";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const inputCls =
  "w-full rounded-[10px] border border-white/[.14] bg-white/[.05] px-[15px] py-[13px] text-[15px] text-white outline-none placeholder:text-white/35 focus:border-white/40";
const labelCls = "block text-[13px] font-500 text-white/60";
const TERMS_VERSION = "2026-06-28";

export function TeamApplicationForm() {
  const [equipo, setEquipo] = useState("");
  const [deporte, setDeporte] = useState("");
  const [deporteOtro, setDeporteOtro] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [contacto, setContacto] = useState("");
  const [email, setEmail] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [proposito, setProposito] = useState("");
  const [notas, setNotas] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const esOtro = deporte === "Otro";
  const deporteEfectivo = esOtro ? deporteOtro.trim() : deporte;
  const valido =
    equipo.trim() &&
    email.trim() &&
    deporteEfectivo &&
    (!esOtro || deporteOtro.trim()) &&
    acepta;

  async function saveToSupabase(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const supabase = await getSupabase();
      if (!supabase) return false;
      const { error } = await supabase.from("team_applications").insert({
        team_name: equipo,
        sport: deporteEfectivo,
        competition: competencia || null,
        fundraising_start: desde || null,
        fundraising_end: hasta || null,
        goal_amount: Number(objetivo) || 0,
        goal_purpose: proposito || null,
        contact_name: contacto || null,
        email,
        notes: notas || null,
        accepted_terms: acepta,
        accepted_at: new Date().toISOString(),
        terms_version: TERMS_VERSION,
        status: "pending",
      });
      return !error;
    } catch {
      return false;
    }
  }

  async function notifyByEmail(): Promise<boolean> {
    const data = {
      equipo,
      deporte: deporteEfectivo,
      competencia,
      recaudacion: [desde, hasta].filter(Boolean).join(" → "),
      objetivo: objetivo ? `$${objetivo} — ${proposito}` : proposito,
      contacto,
      email,
      notas,
    };
    if (WEB3FORMS_ACCESS_KEY) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `Nueva postulación de EQUIPO — ${SITE.brand}`,
            from_name: equipo || "Equipo",
            ...data,
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
    window.location.href = `mailto:${APPLICATIONS_EMAIL}?subject=${encodeURIComponent(
      "Postulación de equipo a " + SITE.brand,
    )}&body=${encodeURIComponent(body)}`;
    return true;
  }

  async function handleSubmit() {
    if (!valido || status === "loading") return;
    setStatus("loading");
    const saved = await saveToSupabase();
    if (saved) {
      if (WEB3FORMS_ACCESS_KEY) void notifyByEmail();
      setStatus("ok");
      return;
    }
    const notified = await notifyByEmail();
    setStatus(notified ? "ok" : "error");
  }

  if (status === "ok") {
    return (
      <section className="mx-auto max-w-[620px] px-4 pb-28 pt-10 text-center sm:px-6">
        <div
          className="mx-auto mb-[22px] flex h-[76px] w-[76px] items-center justify-center rounded-full text-[36px]"
          style={{ background: "rgba(34,197,94,.16)", border: "1px solid rgba(34,197,94,.5)" }}
        >
          ✓
        </div>
        <h2 className="font-display text-[40px] font-700 uppercase leading-none tracking-tight">
          ¡Equipo postulado!
        </h2>
        <p className="mx-auto mt-[14px] max-w-[460px] text-[17px] leading-relaxed text-white/70">
          Recibimos la postulación de <strong className="text-white">{equipo}</strong>.
          La revisamos a mano y te escribimos a <span className="text-white">{email}</span>.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="rounded-[10px] bg-gold px-[26px] py-[14px] font-display text-[15px] font-600 uppercase tracking-wide text-ink transition-opacity hover:opacity-90"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[760px] px-4 pb-24 pt-[30px] sm:px-6">
      <h2 className="mb-2 font-display text-[32px] font-700 uppercase leading-none tracking-tight">
        Postulá a tu equipo
      </h2>
      <p className="mb-6 text-[15px] text-white/60">
        Contanos del equipo, tu objetivo y cuándo querés correr la campaña. Lo
        revisamos a mano y, una vez aprobado, los aportes van directo a la cuenta
        de Mercado Pago del equipo.
      </p>

      <div className="mb-[18px]">
        <label className={labelCls}>Nombre del equipo</label>
        <input
          value={equipo}
          onChange={(e) => setEquipo(e.target.value)}
          placeholder="Ej: Selección Argentina de Handball"
          className={`${inputCls} mt-[7px]`}
        />
      </div>

      <div className="mb-[18px]">
        <div className={`${labelCls} mb-3`}>¿Qué deporte?</div>
        <div className="flex flex-wrap gap-2.5">
          {[
            ...SPORT_LIST.filter((s) => s.team),
            ...SPORT_LIST.filter((s) => !s.team),
            { key: "otro", label: "Otro", color: "#C9A227" } as const,
          ].map((s) => {
            const active = s.label === deporte;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setDeporte(s.label)}
                className="cursor-pointer rounded-full font-display text-[13px] font-600 uppercase tracking-wide text-white transition-all"
                style={{
                  padding: "11px 18px",
                  border: `1px solid ${active ? s.color : "rgba(255,255,255,.16)"}`,
                  background: active ? s.color : "transparent",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {esOtro && (
          <div className="mt-4">
            <label className={labelCls}>¿Cuál es el deporte?</label>
            <input
              value={deporteOtro}
              onChange={(e) => setDeporteOtro(e.target.value)}
              placeholder="Ej: Rugby, Waterpolo, Beach handball…"
              className={`${inputCls} mt-[7px]`}
            />
          </div>
        )}
      </div>

      <div className="mb-[18px]">
        <label className={labelCls}>Competencia que va a disputar</label>
        <input
          value={competencia}
          onChange={(e) => setCompetencia(e.target.value)}
          placeholder="Ej: Mundial 2027, Panamericano, Liga Nacional…"
          className={`${inputCls} mt-[7px]`}
        />
      </div>

      {/* Período de recaudación */}
      <div
        className="mb-[18px] rounded-[12px] border border-white/[.08] p-[18px]"
        style={{ background: "#0d2238" }}
      >
        <div className="mb-1 font-display text-[15px] font-600 uppercase tracking-wide">
          Período de recaudación
        </div>
        <p className="mb-4 text-[13px] leading-relaxed text-white/55">
          Entre qué fechas querés que la gente pueda apoyar al equipo.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Inicio</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className={`${inputCls} mt-[7px]`}
              style={{ colorScheme: "dark" }}
            />
          </div>
          <div>
            <label className={labelCls}>Fin</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className={`${inputCls} mt-[7px]`}
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>
      </div>

      {/* Objetivo de recaudación */}
      <div
        className="mb-[18px] rounded-[12px] border border-white/[.08] p-[18px]"
        style={{ background: "#0d2238" }}
      >
        <div className="mb-1 font-display text-[15px] font-600 uppercase tracking-wide">
          Objetivo de recaudación
        </div>
        <p className="mb-4 text-[13px] leading-relaxed text-white/55">
          ¿Cuánto necesitan juntar y para qué? El objetivo es una referencia
          visual: aunque no se llegue, el equipo recibe todo lo recaudado.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Monto a recaudar (ARS)</label>
            <input
              type="number"
              min={0}
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ej: 500000"
              className={`${inputCls} mt-[7px]`}
            />
          </div>
          <div>
            <label className={labelCls}>¿Para qué?</label>
            <input
              value={proposito}
              onChange={(e) => setProposito(e.target.value)}
              placeholder="Ej: pasajes al Mundial, indumentaria…"
              className={`${inputCls} mt-[7px]`}
            />
          </div>
        </div>
      </div>

      <div className="mb-[18px] grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Tu nombre (contacto)</label>
          <input
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            placeholder="Quién gestiona la campaña"
            className={`${inputCls} mt-[7px]`}
          />
        </div>
        <div>
          <label className={labelCls}>Email de contacto</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="equipo@email.com"
            className={`${inputCls} mt-[7px]`}
          />
        </div>
      </div>

      <div className="mb-8">
        <label className={labelCls}>Algo más que quieras contarnos (opcional)</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={4}
          placeholder="Cantidad de jugadores, objetivo, qué necesitan…"
          className={`${inputCls} mt-[7px] resize-none leading-relaxed`}
        />
      </div>

      {/* Consentimiento legal */}
      <div
        className="mb-5 rounded-[12px] border border-white/[.1] p-[16px]"
        style={{ background: "rgba(255,255,255,.03)" }}
      >
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#C9A227]"
          />
          <span className="text-[13px] leading-relaxed text-white/70">
            En representación del equipo, leí y acepto la{" "}
            <Link href="/privacidad" target="_blank" className="text-gold underline">
              Política de Privacidad
            </Link>{" "}
            y los{" "}
            <Link href="/terminos" target="_blank" className="text-gold underline">
              Términos y Condiciones
            </Link>{" "}
            de {SITE.brand}, y cuento con autorización para postular al equipo.
          </span>
        </label>
      </div>

      {status === "error" && (
        <p className="mb-4 text-[13px]" style={{ color: "#DF0024" }}>
          No se pudo enviar. Probá de nuevo o escribinos a {APPLICATIONS_EMAIL}.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!valido || status === "loading"}
        className="w-full cursor-pointer rounded-[10px] border-0 bg-gold py-[16px] font-display text-[16px] font-600 uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 hover:bg-[#dcb433] disabled:opacity-50"
        style={{ boxShadow: "0 14px 34px rgba(201,162,39,.3)" }}
      >
        {status === "loading" ? "Enviando…" : "Postular al equipo"}
      </button>
    </section>
  );
}
