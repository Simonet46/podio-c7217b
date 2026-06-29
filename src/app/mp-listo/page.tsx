"use client";

import { useEffect, useState } from "react";

/**
 * Página "popup" del flujo de conexión de Mercado Pago durante la postulación.
 * MP → mp-oauth-callback → redirige acá. Avisa a la ventana que la abrió
 * (el formulario) si la conexión salió bien y se cierra sola.
 */
export default function MpListoPage() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const success =
      new URLSearchParams(window.location.search).get("mp") === "ok";
    setOk(success);
    try {
      window.opener?.postMessage({ type: "mp-connect", ok: success }, "*");
    } catch {}
    const t = setTimeout(() => {
      try {
        window.close();
      } catch {}
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A1A2F",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div>
        <div style={{ fontSize: 52, marginBottom: 12 }}>
          {ok === false ? "⚠️" : "✓"}
        </div>
        <h1 style={{ fontSize: 22, margin: 0 }}>
          {ok === false
            ? "No se pudo conectar"
            : "¡Mercado Pago conectado!"}
        </h1>
        <p style={{ opacity: 0.7, marginTop: 8, fontSize: 15 }}>
          Podés cerrar esta ventana y volver a tu postulación.
        </p>
      </div>
    </div>
  );
}
