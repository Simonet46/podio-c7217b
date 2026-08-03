"use client";

import { useState } from "react";

/**
 * Descarga/comparte la placa vertical para historias de Instagram.
 *
 * La imagen ya viene generada del build (1080x1920), así que acá solo la
 * buscamos y la mandamos al menú de compartir del teléfono: en Android y iOS
 * eso abre Instagram directo, sin pasar por la galería. Si el navegador no
 * soporta compartir archivos (casi toda la web de escritorio), cae a descarga.
 */
export function ShareStoryButton({
  imageUrl,
  fileName,
  shareText,
}: {
  imageUrl: string;
  fileName: string;
  shareText: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  async function handleClick() {
    setState("working");
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/jpeg" });

      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
        setState("idle");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("done");
    } catch (err) {
      // Cancelar el menú de compartir tira AbortError: no es un error real.
      if (err instanceof DOMException && err.name === "AbortError") {
        setState("idle");
        return;
      }
      setState("error");
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-white/[.07] p-4" style={{ background: "#0d2238" }}>
      <div className="flex items-start gap-3">
        {/* Miniatura: que se vea qué placa vas a bajar antes de tocar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="h-[104px] w-[59px] shrink-0 rounded-md border border-white/10 object-cover"
        />
        <div className="min-w-0">
          <p className="eyebrow text-gold">Para tu historia</p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/70">
            Placa vertical lista para Instagram. Sumale el sticker de link para que
            puedan entrar de una.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={state === "working"}
        className="mt-3 w-full rounded-lg px-4 py-2.5 font-display text-[14px] font-700 text-ink transition disabled:opacity-60"
        style={{ background: "#C9A227" }}
      >
        {state === "working" ? "Preparando…" : "Compartir en tu historia"}
      </button>

      {state === "done" && (
        <p className="mt-2 text-center text-[12px] text-white/55">
          Listo, se descargó. Subila a tu historia desde Instagram.
        </p>
      )}
      {state === "error" && (
        <p className="mt-2 text-center text-[12px] text-white/55">
          No se pudo preparar la placa.{" "}
          <a href={imageUrl} target="_blank" rel="noreferrer" className="text-gold underline">
            Abrila acá
          </a>{" "}
          y mantené apretado para guardarla.
        </p>
      )}
    </div>
  );
}
