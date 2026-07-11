"use client";

import { useState } from "react";
import { WEB3FORMS_ACCESS_KEY, APPLICATIONS_EMAIL, SITE } from "@/config/site";

type Status = "idle" | "loading" | "ok" | "error";

const OPCIONES = [
  "Ser Empresa Impulsora de GRANITO",
  "Apoyar a todos los atletas",
  "Convenio o activación a medida",
  "Todavía no sé / quiero explorar",
];

const inputCls =
  "w-full rounded-lg border border-white/14 bg-white/[.05] px-4 py-3.5 text-white placeholder-white/35 outline-none transition-colors focus:border-celeste text-[15px] font-inter";

const selectCls =
  "w-full rounded-lg border border-white/14 bg-[#0d2238] px-4 py-3.5 text-white outline-none transition-colors focus:border-celeste text-[15px] cursor-pointer";

export function CompanyContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [emailVal, setEmailVal] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    if (!WEB3FORMS_ACCESS_KEY) {
      const body = [
        `Empresa: ${data.empresa ?? ""}`,
        `Contacto: ${data.contacto ?? ""}`,
        `Email: ${data.email ?? ""}`,
        `Presupuesto: ${data.presupuesto ?? ""}`,
        `Interés: ${data.interes ?? ""}`,
        `Mensaje: ${data.mensaje ?? ""}`,
      ].join("\n");
      window.location.href = `mailto:${APPLICATIONS_EMAIL}?subject=${encodeURIComponent(
        "Empresa quiere conectar con atletas — " + SITE.brand,
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
          subject: `Empresa quiere conectar con atletas — ${SITE.brand}`,
          from_name: data.empresa || "Empresa",
          ...data,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ background: "rgba(34,197,94,.16)", border: "1px solid rgba(34,197,94,.5)" }}
        >
          ✓
        </div>
        <div className="font-display text-[28px] font-700 uppercase leading-none text-white">
          ¡Gracias!
        </div>
        <p className="mx-auto mt-3 max-w-[300px] text-[15px] leading-[1.55] text-white/70">
          Recibimos tu consulta. Te escribimos a{" "}
          <span className="text-white">{emailVal}</span> con una propuesta de match en menos de 48 hs.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <input
        name="empresa"
        required
        placeholder="Nombre de tu empresa"
        className={inputCls}
      />
      <input
        name="contacto"
        required
        placeholder="Tu nombre y cargo"
        className={inputCls}
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email corporativo"
        className={inputCls}
        value={emailVal}
        onChange={(e) => setEmailVal(e.target.value)}
      />
      <select name="presupuesto" className={selectCls} defaultValue="">
        <option value="" style={{ background: "#0d2238" }}>
          Presupuesto mensual estimado
        </option>
        <option value="Hasta $100k" style={{ background: "#0d2238" }}>Hasta $100.000</option>
        <option value="$100k–$500k" style={{ background: "#0d2238" }}>$100.000 – $500.000</option>
        <option value="$500k+" style={{ background: "#0d2238" }}>Más de $500.000</option>
        <option value="A definir" style={{ background: "#0d2238" }}>A definir</option>
      </select>
      <select name="interes" required className={selectCls} defaultValue="">
        <option value="" disabled style={{ background: "#0d2238" }}>
          ¿Cómo querés sumarte?
        </option>
        {OPCIONES.map((o) => (
          <option key={o} value={o} style={{ background: "#0d2238" }}>
            {o}
          </option>
        ))}
      </select>
      <textarea
        name="mensaje"
        rows={3}
        placeholder="Contanos de tu empresa y qué te gustaría impulsar…"
        className={inputCls}
        style={{ resize: "none" }}
      />

      {status === "error" && (
        <p className="text-sm text-red-400">
          No se pudo enviar. Intentá de nuevo o escribinos a {APPLICATIONS_EMAIL}.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-1 w-full rounded-[10px] bg-gold py-4 font-display text-[16px] font-700 uppercase tracking-[.04em] text-ink transition-all hover:-translate-y-0.5 disabled:opacity-60"
        style={{ boxShadow: "0 14px 34px rgba(201,162,39,.3)" }}
      >
        {status === "loading" ? "Enviando…" : "Enviar consulta"}
      </button>
      <p className="text-center text-[12px] text-white/40">
        Sin compromiso. Te contactamos para explorar el match.
      </p>
    </form>
  );
}
