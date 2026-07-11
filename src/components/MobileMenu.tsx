"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/#atletas", label: "Atletas" },
  { href: "/#equipos", label: "Proyectos deportivos" },
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/empresas", label: "Empresas" },
  { href: "/faq", label: "Preguntas frecuentes" },
];

/**
 * Menú hamburguesa (solo mobile: el nav de escritorio sigue en el Header).
 * El panel se monta en <body> vía portal: el header tiene backdrop-filter,
 * que confinaría un position:fixed al header (mismo caso que el modal de login).
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Bloquear el scroll del fondo mientras el menú está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "#0A1A2F" }}>
          {/* Barra superior del panel: logo + cerrar */}
          <div
            className="flex h-16 items-center justify-between px-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}
          >
            <Link href="/" onClick={close} className="text-white">
              <Wordmark className="text-2xl" />
            </Link>
            <button
              onClick={close}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-[20px] leading-none text-white"
            >
              ✕
            </button>
          </div>

          {/* Franja de 5 colores (misma identidad que el header) */}
          <div className="flex h-[6px]" aria-hidden>
            {["#0072CE", "#F4C300", "#111111", "#009F3D", "#DF0024"].map((c) => (
              <div key={c} className="flex-1" style={{ background: c }} />
            ))}
          </div>

          {/* Links */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pt-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className="rounded-lg px-3 py-4 font-display text-[22px] font-600 uppercase tracking-wide text-white/85 transition-colors hover:bg-white/[.05] hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/postulate"
              onClick={close}
              className="rounded-lg px-3 py-4 font-display text-[22px] font-600 uppercase tracking-wide text-gold transition-colors hover:bg-white/[.05]"
            >
              ¿Sos atleta o un proyecto?
            </Link>
          </nav>

          {/* CTA fija abajo */}
          <div className="px-4 pb-8 pt-4">
            <Link
              href="/#atletas"
              onClick={close}
              className="block rounded-md bg-gold py-4 text-center font-display text-base font-700 uppercase tracking-wide text-ink"
            >
              Apoyar a un atleta
            </Link>
            <Link
              href="/mi-perfil"
              onClick={close}
              className="mt-4 block text-center text-[13px] text-white/45 underline underline-offset-4"
            >
              Ya soy atleta GRANITO
            </Link>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
