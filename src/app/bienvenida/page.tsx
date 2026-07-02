"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { Wordmark } from "@/components/Wordmark";

export default function BienvenidaPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<"loading" | "ok" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setEstado("error");
      setErrorMsg("La plataforma no está configurada.");
      return;
    }

    async function activar() {
      const supabase = await getSupabase();
      if (!supabase) { setEstado("error"); setErrorMsg("Error interno."); return; }

      // Supabase JS v2 detecta automáticamente el access_token del hash de la URL.
      // Esperamos un tick para que lo procese.
      await new Promise((r) => setTimeout(r, 300));

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setEstado("error");
        setErrorMsg(
          "El link de activación expiró o ya fue usado. Pedile al equipo de GRANITO que te reenvíen el acceso.",
        );
        return;
      }

      setEstado("ok");

      // Redirigir al dashboard del atleta.
      setTimeout(() => router.push("/mi-perfil"), 2200);
    }

    activar();
  }, [router]);

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
              Tu cuenta está activa. Redirigiendo a tu dashboard…
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
            href="/"
            className="rounded-[10px] px-7 py-3.5 font-display text-[15px] font-600 uppercase tracking-wide text-ink"
            style={{ background: "#C9A227" }}
          >
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
