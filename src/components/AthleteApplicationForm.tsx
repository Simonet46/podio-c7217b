"use client";

import { useState } from "react";
import { SPORT_LIST } from "@/config/sports";
import { WEB3FORMS_ACCESS_KEY, APPLICATIONS_EMAIL, SITE } from "@/config/site";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { MercadoPagoConnect } from "./MercadoPagoConnect";

type Status = "idle" | "loading" | "ok" | "error";

export function AthleteApplicationForm() {
  const [status, setStatus] = useState<Status>("idle");

  /** Guarda la postulación en Supabase como atleta PENDIENTE de revisión. */
  async function saveToSupabase(data: Record<string, string>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const supabase = await getSupabase();
      if (!supabase) return false;
      const { error } = await supabase.from("athlete_applications").insert({
        full_name: data.nombre || "",
        sport: data.deporte || "",
        discipline: data.disciplina || null,
        location: data.ciudad || null,
        email: data.email || "",
        age: data.edad ? Number(data.edad) : null,
        media_url: data.foto || null,
        payment_link: data.mercadopago || null,
        achievements: data.logros || null,
        needs: data.necesidad || null,
        socials: data.redes || null,
        status: "pending",
      });
      return !error;
    } catch {
      return false;
    }
  }

  /** Notificación por email (Web3Forms) o, si no hay key, fallback a mailto. */
  async function notifyByEmail(data: Record<string, string>): Promise<boolean> {
    if (WEB3FORMS_ACCESS_KEY) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `Nueva postulación de atleta — ${SITE.brand}`,
            from_name: data.nombre || "Postulante",
            ...data,
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    // Sin key → abrimos el cliente de mail (gratis, funciona igual).
    const body = [
      `Nombre: ${data.nombre ?? ""}`,
      `Deporte: ${data.deporte ?? ""}`,
      `Disciplina: ${data.disciplina ?? ""}`,
      `Ciudad / Provincia: ${data.ciudad ?? ""}`,
      `Email: ${data.email ?? ""}`,
      `Edad: ${data.edad ?? ""}`,
      `Foto/video: ${data.foto ?? ""}`,
      `Mercado Pago: ${data.mercadopago || "(no vinculado)"}`,
      `Nivel y logros: ${data.logros ?? ""}`,
      `Para qué necesita apoyo: ${data.necesidad ?? ""}`,
      `Redes / links: ${data.redes ?? ""}`,
    ].join("\n");
    window.location.href = `mailto:${APPLICATIONS_EMAIL}?subject=${encodeURIComponent(
      "Postulación a " + SITE.brand,
    )}&body=${encodeURIComponent(body)}`;
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    setStatus("loading");

    // 1) Fuente de verdad: la postulación queda en Supabase como pendiente.
    const savedToDb = await saveToSupabase(data);

    if (savedToDb) {
      // Notificación best-effort por Web3Forms (si está configurado).
      // No abrimos mailto: ya quedó registrada en la DB.
      if (WEB3FORMS_ACCESS_KEY) void notifyByEmail(data);
      setStatus("ok");
      form.reset();
      return;
    }

    // 2) Sin DB (o falló): el email es el canal principal (Web3Forms o mailto).
    const notified = await notifyByEmail(data);
    if (notified) {
      setStatus("ok");
      if (WEB3FORMS_ACCESS_KEY) form.reset();
    } else {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-line bg-paper p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-gold" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 font-display text-2xl font-700 uppercase tracking-tight text-ink">
          ¡Postulación enviada!
        </h3>
        <p className="mt-2 text-steel">
          La revisamos a mano (somos atletas, miramos cada una) y te escribimos.
          Gracias por querer sumarte.
        </p>
      </div>
    );
  }

  const input =
    "mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-celeste";
  const label = "block text-sm";
  const labelText = "eyebrow text-steel";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>
          <span className={labelText}>Nombre y apellido *</span>
          <input name="nombre" required className={input} />
        </label>
        <label className={label}>
          <span className={labelText}>Deporte *</span>
          <select name="deporte" required defaultValue="" className={input}>
            <option value="" disabled>
              Elegí tu deporte
            </option>
            {SPORT_LIST.map((s) => (
              <option key={s.key} value={s.label}>
                {s.label}
              </option>
            ))}
            <option value="Otro">Otro</option>
          </select>
        </label>
        <label className={label}>
          <span className={labelText}>Disciplina / prueba *</span>
          <input name="disciplina" required placeholder="Ej. K1 1000m" className={input} />
        </label>
        <label className={label}>
          <span className={labelText}>Ciudad / Provincia *</span>
          <input name="ciudad" required className={input} />
        </label>
        <label className={label}>
          <span className={labelText}>Email de contacto *</span>
          <input name="email" type="email" required className={input} />
        </label>
        <label className={label}>
          <span className={labelText}>Edad *</span>
          <input name="edad" type="number" min={8} max={80} required className={input} />
        </label>
        <label className={label}>
          <span className={labelText}>Foto o video tuyo (link) *</span>
          <input
            name="foto"
            type="url"
            required
            placeholder="Instagram, YouTube, Drive…"
            className={input}
          />
        </label>
        <div className="sm:col-span-2">
          <MercadoPagoConnect />
        </div>
        <label className={`${label} sm:col-span-2`}>
          <span className={labelText}>Nivel y logros *</span>
          <textarea
            name="logros"
            required
            rows={3}
            placeholder="Contanos tu palmarés y dónde estás hoy en tu camino competitivo."
            className={input}
          />
        </label>
        <label className={`${label} sm:col-span-2`}>
          <span className={labelText}>¿Para qué necesitás el apoyo? *</span>
          <textarea
            name="necesidad"
            required
            rows={3}
            placeholder="Viajes, entrenador, equipo, concentraciones…"
            className={input}
          />
        </label>
        <label className={`${label} sm:col-span-2`}>
          <span className={labelText}>Redes / links (Instagram, prensa, video)</span>
          <input name="redes" placeholder="@tu_usuario · enlaces" className={input} />
        </label>
      </div>

      {status === "error" && (
        <p className="mt-3 text-sm text-ribbon-red">
          No se pudo enviar. Probá de nuevo o escribinos a {APPLICATIONS_EMAIL}.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 w-full rounded-lg bg-gold py-3.5 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === "loading" ? "Enviando…" : "Enviar postulación"}
      </button>
      <p className="mt-3 text-center text-xs text-steel">
        Revisamos cada postulación a mano antes de publicar. Sin costo para el atleta.
        Si sos menor de edad, te contactamos junto a tu madre, padre o tutor.
      </p>
    </form>
  );
}
