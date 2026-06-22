"use client";

import { useState } from "react";
import { SPORT_LIST } from "@/config/sports";
import { WEB3FORMS_ACCESS_KEY, APPLICATIONS_EMAIL, SITE } from "@/config/site";

type Status = "idle" | "loading" | "ok" | "error";

export function AthleteApplicationForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    // Sin access key configurada → fallback por mail (funciona igual, gratis).
    if (!WEB3FORMS_ACCESS_KEY) {
      const body = [
        `Nombre: ${data.nombre ?? ""}`,
        `Deporte: ${data.deporte ?? ""}`,
        `Disciplina: ${data.disciplina ?? ""}`,
        `Ciudad / Provincia: ${data.ciudad ?? ""}`,
        `Email: ${data.email ?? ""}`,
        `Nivel y logros: ${data.logros ?? ""}`,
        `Para qué necesita apoyo: ${data.necesidad ?? ""}`,
        `Redes / links: ${data.redes ?? ""}`,
      ].join("\n");
      window.location.href = `mailto:${APPLICATIONS_EMAIL}?subject=${encodeURIComponent(
        "Postulación a " + SITE.brand,
      )}&body=${encodeURIComponent(body)}`;
      setStatus("ok");
      return;
    }

    setStatus("loading");
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
      if (!res.ok) throw new Error();
      setStatus("ok");
      form.reset();
    } catch {
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
      </p>
    </form>
  );
}
