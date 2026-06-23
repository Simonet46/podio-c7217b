"use client";

import { useEffect, useRef, useState } from "react";
import { DIPLOMA_TIERS, diplomaTier, SITE } from "@/config/site";
import { formatMoney } from "@/lib/money";

const W = 1600;
const H = 1131;
const RIBBON = ["#0072CE", "#F4C300", "#1A1A1A", "#009F3D", "#DF0024"];

/**
 * Diploma de apoyo descargable. Se dibuja en un canvas (fuentes de la marca) y
 * se exporta como PNG para compartir o imprimir. Nivel bronce/plata/oro según
 * el monto del aporte.
 */
export function Diploma({
  defaultName = "",
  targetPhrase,
  amount,
  monthly = false,
}: {
  defaultName?: string;
  targetPhrase: string;
  amount: number;
  monthly?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState(defaultName);
  const tierKey = diplomaTier(amount);
  const tier = DIPLOMA_TIERS[tierKey];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = getComputedStyle(document.documentElement);
    const display =
      root.getPropertyValue("--font-oswald").trim() || "Impact, sans-serif";
    const body = root.getPropertyValue("--font-inter").trim() || "Arial, sans-serif";

    const draw = () => {
      // letterSpacing es una API reciente del canvas; casteamos para los tipos.
      const cany = ctx as CanvasRenderingContext2D & { letterSpacing: string };
      const displayName = (name.trim() || "Hincha del deporte argentino").toUpperCase();
      const date = new Date().toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Fondo
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0F2440");
      bg.addColorStop(1, "#0A1A2F");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Bordes
      ctx.strokeStyle = tier.accent;
      ctx.lineWidth = 8;
      ctx.strokeRect(36, 36, W - 72, H - 72);
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 2;
      ctx.strokeRect(52, 52, W - 104, H - 104);

      // Franja de 5 colores (arriba y abajo)
      const drawRibbon = (y: number) => {
        const x0 = 72;
        const w = (W - 144) / 5;
        RIBBON.forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.fillRect(x0 + i * w, y, w, 12);
        });
      };
      drawRibbon(76);
      drawRibbon(H - 88);

      ctx.textAlign = "center";

      // Marca
      ctx.textAlign = "left";
      ctx.fillStyle = "#C9A227";
      ctx.font = `700 44px ${display}`;
      ctx.fillText(SITE.brand, 80, 158);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = `600 18px ${display}`;
      cany.letterSpacing = "3px";
      ctx.fillText("RUMBO A LA 2028", 230, 156);
      cany.letterSpacing = "0px";

      ctx.textAlign = "center";
      const cx = W / 2;

      // Título
      ctx.fillStyle = "#C9A227";
      ctx.font = `600 30px ${display}`;
      cany.letterSpacing = "8px";
      ctx.fillText("DIPLOMA DE", cx, 290);
      cany.letterSpacing = "0px";

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `700 96px ${display}`;
      ctx.fillText("APOYO AL DEPORTE", cx, 390);
      ctx.fillText("ARGENTINO", cx, 488);

      // Otorgado a
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = `italic 30px Georgia, serif`;
      ctx.fillText("Otorgado con orgullo a", cx, 588);

      // Nombre
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `700 78px ${display}`;
      ctx.fillText(displayName, cx, 668);

      // Línea decorativa
      ctx.strokeStyle = tier.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 180, 692);
      ctx.lineTo(cx + 180, 692);
      ctx.stroke();

      // Frase del aporte (con wrap)
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = `26px ${body}`;
      const phrase = `por apoyar a ${targetPhrase} en su camino a Los Ángeles 2028`;
      wrapText(ctx, phrase, cx, 752, 1180, 38);

      // Sello del nivel (medalla)
      const sx = cx;
      const sy = 900;
      const r = 70;
      const grad = ctx.createRadialGradient(sx - 20, sy - 20, 8, sx, sy, r);
      grad.addColorStop(0, tier.accent);
      grad.addColorStop(1, tier.color);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#0A1A2F";
      ctx.font = `600 16px ${display}`;
      cany.letterSpacing = "2px";
      ctx.fillText("NIVEL", sx, sy - 14);
      ctx.font = `700 34px ${display}`;
      ctx.fillText(tier.label.toUpperCase(), sx, sy + 22);
      cany.letterSpacing = "0px";

      // Pie: aporte + fecha
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = `20px ${body}`;
      ctx.textAlign = "left";
      ctx.fillText(
        `Aporte: ${formatMoney(amount)}${monthly ? " / mes" : ""}`,
        90,
        H - 130,
      );
      ctx.textAlign = "right";
      ctx.fillText(date, W - 90, H - 130);
      ctx.textAlign = "center";
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(draw);
    } else {
      draw();
    }
  }, [name, targetPhrase, amount, monthly, tier]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diploma-podio-${tierKey}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-paper p-5 text-left sm:p-6">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: tier.color }}
          aria-hidden
        />
        <h2 className="font-display text-xl font-700 uppercase tracking-wide text-ink">
          Tu diploma de apoyo · Nivel {tier.label}
        </h2>
      </div>
      <p className="mt-1 text-sm text-steel">
        Sos parte de los que apoyan al deporte argentino. Descargá tu diploma y
        compartilo.
      </p>

      <label className="mt-4 block">
        <span className="eyebrow text-steel">Tu nombre (para el diploma)</span>
        <input
          type="text"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder="Escribí tu nombre"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 font-display text-lg text-ink outline-none focus:border-celeste"
        />
      </label>

      {/* Vista previa del diploma */}
      <div className="mt-4 overflow-hidden rounded-xl border border-line shadow-sm">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block h-auto w-full"
          aria-label="Vista previa del diploma de apoyo"
        />
      </div>

      <button
        onClick={download}
        className="mt-4 w-full rounded-lg bg-ink py-3.5 font-display text-base font-700 uppercase tracking-wide text-white transition-colors hover:bg-ink-2"
      >
        Descargar diploma
      </button>
    </div>
  );
}

/** Dibuja texto centrado con salto de línea por ancho máximo. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = word;
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, curY);
}
