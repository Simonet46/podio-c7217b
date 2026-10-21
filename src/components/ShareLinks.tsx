"use client";

import { useState } from "react";

/**
 * Botones para compartir un perfil o proyecto. Cada link lleva su
 * `utm_source` para que el dashboard sepa de dónde llegó la visita:
 * WhatsApp e Instagram no mandan referrer, así que sin esto todo cae
 * como "Directo".
 */
export function ShareLinks({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState<"ig" | "link" | null>(null);
  const withUtm = (source: string) => `${url}${url.includes("?") ? "&" : "?"}utm_source=${source}`;

  async function copy(source: "ig" | "link") {
    try {
      await navigator.clipboard.writeText(withUtm(source === "ig" ? "instagram" : "link"));
      setCopied(source);
      setTimeout(() => setCopied(null), 2200);
    } catch {
      window.prompt("Copiá el link:", withUtm(source === "ig" ? "instagram" : "link"));
    }
  }

  const btn = "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-600 transition hover:opacity-90";
  return (
    <div className="mt-3 rounded-xl border border-white/[.07] p-4" style={{ background: "#0d2238" }}>
      <p className="eyebrow text-gold">Compartí</p>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${withUtm("whatsapp")}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
          style={{ background: "rgba(37,211,102,.14)", color: "#5fd98a", border: "1px solid rgba(37,211,102,.35)" }}
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={() => copy("ig")}
          className={btn}
          style={{ background: "rgba(225,48,108,.12)", color: "#f28db0", border: "1px solid rgba(225,48,108,.35)" }}
          title="Copia el link para pegarlo en tu bio o en el sticker de link de tu historia"
        >
          {copied === "ig" ? "¡Copiado!" : "Instagram"}
        </button>
        <button
          type="button"
          onClick={() => copy("link")}
          className={btn}
          style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,.14)" }}
        >
          {copied === "link" ? "¡Copiado!" : "Copiar link"}
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-white/35">
        El de Instagram copia el link para tu bio o el sticker de link de la historia.
      </p>
    </div>
  );
}
