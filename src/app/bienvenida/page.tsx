"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { Wordmark } from "@/components/Wordmark";

type Estado = "loading" | "clave" | "ok" | "error";

export default function BienvenidaPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  // Form de contraseña (solo cuando llega por invite/recovery).
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [passBusy, setPassBusy] = useState(false);
  const [passError, setPassError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setEstado("error");
      setErrorMsg("La plataforma no está configurada.");
      return;
    }

    async function activar() {
      // Si Supabase redirigió con error (link vencido o ya usado), viene en el hash.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      if (hash.get("error")) {
        setEstado("error");
        setErrorMsg(
          hash.get("error_code") === "otp_expired"
            ? "El link de acceso venció o ya fue usado. Pedí uno nuevo con tu email desde el botón de abajo."
            : "No pudimos validar el link. Pedí uno nuevo con tu email desde el botón de abajo.",
        );
        return;
      }
      // El tipo de link nos dice si corresponde crear contraseña:
      // invite/signup = cuenta nueva · recovery = "olvidé mi contraseña".
      const linkType = hash.get("type");

      const supabase = await getSupabase();
      if (!supabase) { setEstado("error"); setErrorMsg("Error interno."); return; }

      // Supabase JS v2 detecta automáticamente el access_token del hash de la URL.
      // Esperamos un tick para que lo procese.
      await new Promise((r) => setTimeout(r, 300));

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setEstado("error");
        setErrorMsg(
          "El link de activación expiró o ya fue usado. Pedí uno nuevo con tu email desde el botón de abajo.",
        );
        return;
      }

      setEmail(session.user.email ?? null);

      if (linkType === "invite" || linkType === "signup" || linkType === "recovery") {
        setEstado("clave");
        return;
      }

      setEstado("ok");
      // Redirigir al dashboard del atleta.
      setTimeout(() => router.push("/mi-perfil"), 2200);
    }

    activar();
  }, [router]);

  async function guardarClave(e: React.FormEvent) {
    e.preventDefault();
    if (passBusy) return;
    if (pass1.length < 8) {
      setPassError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (pass1 !== pass2) {
      setPassError("Las contraseñas no coinciden.");
      return;
    }
    setPassBusy(true);
    setPassError("");
    const supabase = await getSupabase();
    const { error } = (await supabase?.auth.updateUser({ password: pass1 })) ?? {};
    setPassBusy(false);
    if (error) {
      setPassError("No se pudo guardar. Probá de nuevo en unos segundos.");
      return;
    }
    setEstado("ok");
    setTimeout(() => router.push("/mi-perfil"), 1800);
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "#0A1A2F" }}
    >
      <div className="mb-10">
        <Wordmark />
      </div>

      {estado === "loading" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <Spinner />
          <p className="text-[17px] text-white/70">Activando tu cuenta…</p>
        </div>
      )}

      {estado === "clave" && (
        <div className="w-full max-w-[420px]">
          <div
            className="rounded-[16px] p-8"
            style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}
          >
            <h1 className="mb-1 font-display text-[26px] font-700 uppercase leading-none tracking-tight text-white">
              Creá tu contraseña
            </h1>
            <p className="mb-6 text-[14px] leading-relaxed text-white/55">
              {email ? <>Tu cuenta es <strong className="text-white/80">{email}</strong>. </> : null}
              Con esta contraseña vas a poder entrar a tu panel cuando quieras.
            </p>

            <form onSubmit={guardarClave} className="flex flex-col gap-4">
              <input
                type="password"
                required
                minLength={8}
                value={pass1}
                onChange={(e) => setPass1(e.target.value)}
                placeholder="Contraseña (mínimo 8 caracteres)"
                autoComplete="new-password"
                className="rounded-[10px] border border-white/[.14] bg-white/[.05] px-[15px] py-[13px] text-[15px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
              />
              <input
                type="password"
                required
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                placeholder="Repetila para confirmar"
                autoComplete="new-password"
                className="rounded-[10px] border border-white/[.14] bg-white/[.05] px-[15px] py-[13px] text-[15px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
              />
              {passError && (
                <p className="rounded-[8px] p-3 text-[13px]" style={{ background: "rgba(220,38,38,.12)", color: "#f87171" }}>
                  {passError}
                </p>
              )}
              <button
                type="submit"
                disabled={passBusy}
                className="rounded-[10px] py-[14px] font-display text-[15px] font-600 uppercase tracking-wide text-ink disabled:opacity-50"
                style={{ background: "#C9A227" }}
              >
                {passBusy ? "Guardando…" : "Guardar y entrar a mi panel"}
              </button>
            </form>

            <button
              onClick={() => { setEstado("ok"); setTimeout(() => router.push("/mi-perfil"), 600); }}
              className="mt-4 w-full text-center text-[13px] text-white/40 underline hover:text-white/70"
            >
              Ahora no — entrar sin contraseña
            </button>
          </div>
        </div>
      )}

      {estado === "ok" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-[34px]"
            style={{
              background: "rgba(34,197,94,.16)",
              border: "1px solid rgba(34,197,94,.5)",
            }}
          >
            ✓
          </div>
          <div>
            <h1
              className="font-display text-[36px] font-700 uppercase leading-none tracking-tight"
              style={{ color: "#C9A227" }}
            >
              ¡Bienvenido/a!
            </h1>
            <p className="mt-3 text-[16px] text-white/65">
              Tu cuenta está activa. Redirigiendo a tu panel…
            </p>
          </div>
        </div>
      )}

      {estado === "error" && (
        <div className="flex max-w-[420px] flex-col items-center gap-5 text-center">
          <div
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-[34px]"
            style={{
              background: "rgba(223,0,36,.12)",
              border: "1px solid rgba(223,0,36,.4)",
            }}
          >
            ✕
          </div>
          <div>
            <h1 className="font-display text-[28px] font-700 uppercase leading-none tracking-tight text-white">
              Link inválido
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/60">
              {errorMsg}
            </p>
          </div>
          <a
            href="/mi-perfil/"
            className="rounded-[10px] px-7 py-3.5 font-display text-[15px] font-600 uppercase tracking-wide text-ink"
            style={{ background: "#C9A227" }}
          >
            Pedir un link nuevo
          </a>
          <a href="/" className="text-[13px] text-white/40 underline hover:text-white/70">
            Ir al inicio
          </a>
        </div>
      )}
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke="rgba(201,162,39,.2)"
        strokeWidth="4"
      />
      <path
        d="M20 4a16 16 0 0 1 16 16"
        stroke="#C9A227"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
