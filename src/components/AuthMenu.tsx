"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Role = "atleta" | "equipo";
type Step = "role" | "creds";

/**
 * Botón "Login" (contorno dorado) + modal de acceso en dos pasos:
 *   1. elegir si sos atleta o equipo
 *   2. email + contraseña (conectado al Supabase Auth existente)
 * Al entrar, redirige a /mi-perfil (mismo dashboard que usa la cuenta).
 */
export function AuthMenu() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>("atleta");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  // El modal se monta en <body> vía portal: el header tiene backdrop-filter,
  // que rompería el position:fixed (lo confinaría al header).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function close() {
    setOpen(false);
    // Reset diferido para que no parpadee mientras cierra.
    setTimeout(() => {
      setStep("role");
      setError("");
      setForgotSent(false);
      setPass("");
    }, 200);
  }

  function pickRole(r: Role) {
    setRole(r);
    setStep("creds");
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !pass || busy) return;
    setBusy(true);
    setError("");
    const supabase = await getSupabase();
    if (!supabase) {
      setError("El acceso no está disponible en este momento.");
      setBusy(false);
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: pass });
    setBusy(false);
    if (err) {
      setError(
        "Email o contraseña incorrectos. Si nunca creaste una contraseña, usá “¿Olvidaste tu contraseña?”.",
      );
      return;
    }
    // Sesión creada: al dashboard de la cuenta.
    window.location.href = "/mi-perfil/";
  }

  async function handleForgot() {
    if (!email) {
      setError("Escribí tu email arriba y volvé a tocar “¿Olvidaste tu contraseña?”.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = await getSupabase();
    // Función inteligente: manda recuperación o alta de cuenta según corresponda.
    await supabase?.functions.invoke("athlete-recover", { body: { email } });
    setBusy(false);
    setForgotSent(true);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-gold px-4 py-2 font-display text-sm font-600 uppercase tracking-wide text-gold transition-colors hover:bg-gold hover:text-ink"
      >
        <LoginIcon />
        Login
      </button>

      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          style={{ background: "rgba(0,0,0,.72)" }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div
            className="w-full max-w-[440px] rounded-t-[20px] p-7 sm:rounded-[20px]"
            style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.1)" }}
          >
            {/* Header del modal */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-[22px] font-700 uppercase leading-none tracking-tight text-white">
                {step === "role" ? "Ingresar" : role === "atleta" ? "Acceso atleta" : "Acceso equipo"}
              </h2>
              <button onClick={close} className="text-[22px] leading-none text-white/40 hover:text-white/80" aria-label="Cerrar">
                ✕
              </button>
            </div>

            {step === "role" ? (
              <div className="flex flex-col gap-3">
                <p className="mb-1 text-[14px] text-white/55">¿Cómo querés ingresar?</p>
                <RoleCard
                  title="Soy atleta"
                  desc="Entrá a tu perfil, editá tu historia y conectá tus cobros."
                  icon={<AthleteIcon />}
                  onClick={() => pickRole("atleta")}
                />
                <RoleCard
                  title="Soy equipo"
                  desc="Armá o gestioná la campaña de tu equipo."
                  icon={<TeamIcon />}
                  onClick={() => pickRole("equipo")}
                />
                <p className="mt-3 text-center text-[13px] text-white/45">
                  ¿Todavía no tenés cuenta?{" "}
                  <Link href="/postulate" onClick={close} className="text-gold underline underline-offset-2 hover:text-gold-soft">
                    Postulate
                  </Link>
                </p>
              </div>
            ) : role === "equipo" ? (
              // Los equipos todavía no tienen cuenta propia: su campaña la
              // gestiona el equipo de GRANITO. Evitamos el login sin salida.
              <div className="flex flex-col gap-4">
                <p className="text-[14px] leading-relaxed text-white/70">
                  Por ahora los equipos <strong className="text-white">no tienen una cuenta para ingresar</strong>.
                  Tu campaña la gestionás junto al equipo de GRANITO: nos escribís y coordinamos
                  objetivo, fechas y los cobros.
                </p>
                <Link
                  href="/postulate"
                  onClick={close}
                  className="rounded-[10px] bg-gold py-[13px] text-center font-display text-[15px] font-600 uppercase tracking-wide text-ink"
                >
                  Postular mi equipo
                </Link>
                <a
                  href="mailto:hola@somosgranito.com"
                  className="text-center text-[13px] text-white/50 underline underline-offset-4 hover:text-white/80"
                >
                  Escribirnos a hola@somosgranito.com
                </a>
                <button
                  type="button"
                  onClick={() => { setStep("role"); setError(""); }}
                  className="text-center text-[13px] text-white/40 underline underline-offset-4 hover:text-white/70"
                >
                  ← Volver
                </button>
              </div>
            ) : forgotSent ? (
              <div
                className="rounded-[10px] p-5 text-center text-[15px] leading-relaxed"
                style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.4)", color: "#22c55e" }}
              >
                ✓ Si <strong>{email}</strong> corresponde a una cuenta, te llega un email
                para entrar y crear tu contraseña.
                <br />
                <span className="text-[13px] opacity-80">Revisá tu bandeja (y spam).</span>
                <button
                  onClick={() => { setForgotSent(false); }}
                  className="mt-4 block w-full text-[13px] text-white/50 underline underline-offset-4 hover:text-white/80"
                >
                  Volver
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="rounded-[10px] border border-white/[.14] bg-white/[.05] px-[15px] py-[13px] text-[15px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
                />
                <input
                  type="password"
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  className="rounded-[10px] border border-white/[.14] bg-white/[.05] px-[15px] py-[13px] text-[15px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
                />
                {error && (
                  <p className="rounded-[8px] p-3 text-[13px] leading-relaxed" style={{ background: "rgba(220,38,38,.12)", color: "#f87171" }}>
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy || !email || !pass}
                  className="rounded-[10px] bg-gold py-[14px] font-display text-[15px] font-600 uppercase tracking-wide text-ink disabled:opacity-50"
                >
                  {busy ? "Entrando…" : "Ingresar"}
                </button>
                <div className="flex items-center justify-between text-[13px]">
                  <button
                    type="button"
                    onClick={() => { setStep("role"); setError(""); }}
                    className="text-white/50 underline underline-offset-4 hover:text-white/80"
                  >
                    ← Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleForgot}
                    className="text-white/50 underline underline-offset-4 hover:text-white/80"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <p className="mt-1 text-center text-[13px] text-white/45">
                  ¿Todavía no tenés cuenta?{" "}
                  <Link href="/postulate" onClick={close} className="text-gold underline underline-offset-2 hover:text-gold-soft">
                    Postulate
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function RoleCard({ title, desc, icon, onClick }: { title: string; desc: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-[12px] border border-white/[.12] bg-white/[.03] p-4 text-left transition-colors hover:border-gold/60 hover:bg-white/[.06]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
        {icon}
      </span>
      <span>
        <span className="block font-display text-[15px] font-600 uppercase tracking-wide text-white">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-white/50">{desc}</span>
      </span>
    </button>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function AthleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="7" r="3.2" />
      <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="8" r="2.6" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M3 20v-1.5a5 5 0 0 1 10 0V20" />
      <path d="M15 20v-1a4 4 0 0 1 6-3.4" />
    </svg>
  );
}
