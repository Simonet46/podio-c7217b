"use client";

import { useState } from "react";
import { WEB3FORMS_ACCESS_KEY, APPLICATIONS_EMAIL, SITE } from "@/config/site";

type Status = "idle" | "loading" | "ok" | "error";

const OPCIONES = [
  "Apadrinar un atleta",
  "Apoyar un equipo",
  "Sponsor de la plataforma",
  "A definir / quiero que me asesoren",
];

export function CompanyContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    if (!WEB3FORMS_ACCESS_KEY) {
      const body = [
        `Empresa: ${data.empresa ?? ""}`,
        `Contacto: ${data.contacto ?? ""}`,
        `Email: ${data.email ?? ""}`,
        `Teléfono: ${data.telefono ?? ""}`,
        `Interés: ${data.interes ?? ""}`,
        `Mensaje: ${data.mensaje ?? ""}`,
      ].join("\n");
      window.location.href = `mailto:${APPLICATIONS_EMAIL}?subject=${encodeURIComponent(
        "Empresa interesada en sponsorear — " + SITE.brand,
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
          subject: `Empresa interesada en sponsorear — ${SITE.brand}`,
          from_name: data.empresa || "Empresa",
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
          ¡Gracias por el interés!
        </h3>
        <p className="mt-2 text-steel">
          Te contactamos para presentarte a los atletas que mejor van con tu marca.
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
        <label className={label}>
          <span className={labelText}>Empresa *</span>
          <input name="empresa" required className={input} />
        </label>
        <label className={label}>
          <span className={labelText}>Persona de contacto *</span>
          <input name="contacto" required className={input} />
        </label>
        <label className={label}>
          <span className={labelText}>Email *</span>
          <input name="email" type="email" required className={input} />
        </label>
        <label className={label}>
          <span className={labelText}>Teléfono / WhatsApp</span>
          <input name="telefono" className={input} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          <span className={labelText}>¿Cómo te gustaría sumarte? *</span>
          <select name="interes" required defaultValue="" className={input}>
            <option value="" disabled>
              Elegí una opción
            </option>
            {OPCIONES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className={`${label} sm:col-span-2`}>
          <span className={labelText}>Mensaje</span>
          <textarea
            name="mensaje"
            rows={4}
            placeholder="Contanos qué busca tu marca y a quién te gustaría apoyar."
            className={input}
          />
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
        {status === "loading" ? "Enviando…" : "Quiero sumar mi empresa"}
      </button>
    </form>
  );
}
