"use client";

import { useState } from "react";
import { shareStoryImage, type ShareStoryResult } from "@/lib/shareStory";

/**
 * Botones para compartir un perfil o proyecto. Cada link lleva su
 * `utm_source` para que el dashboard sepa de dónde llegó la visita:
 * WhatsApp e Instagram no mandan referrer, así que sin esto todo cae
 * como "Directo".
 *
 * "Instagram" abre el menú nativo de compartir con la placa vertical, que en
 * el teléfono ofrece "Instagram → Historias" directo. En computadora, como
 * no se puede compartir archivos, descarga la placa y copia el link.
 */
export function ShareLinks({
  url,
  text,
  storyImageUrl,
  storyFileName,
}: {
  url: string;
  text: string;
  /** Placa vertical para la historia (1080x1920). */
  storyImageUrl: string;
  storyFileName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [ig, setIg] = useState<"idle" | "working" | ShareStoryResult>("idle");
  const withUtm = (source: string) => `${url}${url.includes("?") ? "&" : "?"}utm_source=${source}`;

  async function copyLink(source: string) {
    try {
      await navigator.clipboard.writeText(withUtm(source));
      return true;
    } catch {
      return false;
    }
  }

  async function copy() {
    const ok = await copyLink("link");
    if (!ok) { window.prompt("Copiá el link:", withUtm("link")); return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  async function instagram() {
    if (ig === "working") return;
    setIg("working");
    const r = await shareStoryImage({
      imageUrl: storyImageUrl,
      fileName: storyFileName,
      text: `${text} ${withUtm("instagram")}`,
    });
    // En computadora se descarga la placa: dejamos el link copiado para la bio
    // o el sticker de link.
    if (r === "downloaded") await copyLink("instagram");
    setIg(r);
    if (r === "shared" || r === "cancelled") setTimeout(() => setIg("idle"), 1500);
  }

  const btn = "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-600 transition hover:opacity-90 disabled:opacity-60";
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
          onClick={instagram}
          disabled={ig === "working"}
          className={btn}
          style={{ background: "rgba(225,48,108,.12)", color: "#f28db0", border: "1px solid rgba(225,48,108,.35)" }}
          title="Comparte la placa en tu historia de Instagram"
        >
          {ig === "working" ? "Preparando…" : "Instagram"}
        </button>
        <button
          type="button"
          onClick={copy}
          className={btn}
          style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,.14)" }}
        >
          {copied ? "¡Copiado!" : "Copiar link"}
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-white/35">
        {ig === "downloaded"
          ? "Se descargó la placa y el link quedó copiado: subila a tu historia desde Instagram y pegá el link en el sticker."
          : ig === "error"
            ? "No se pudo preparar la placa. Probá con el botón \u201cCompartir en tu historia\u201d."
            : "Instagram abre el menú para compartir la placa directo en tu historia."}
      </p>
    </div>
  );
}
