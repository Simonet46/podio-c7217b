"use client";

import { useEffect, useState } from "react";

/**
 * Página "popup" del flujo de conexión de Mercado Pago durante la postulación.
 * MP → mp-oauth-callback → redirige acá. Avisa al formulario (ventana que la
 * abrió) y se cierra sola si salió bien. Si hubo error, muestra el motivo y NO
 * se cierra (para poder leerlo).
 */
export default function MpListoPage() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const success = p.get("mp") === "ok";
    setOk(success);
    setReason(p.get("reason") || "");
    try {
      window.opener?.postMessage({ type: "mp-connect", ok: success }, "*");
    } catch {}
    if (success) {
      const t = setTimeout(() => {
        try {
          window.close();
        } catch {}
      }, 900);
      return () => clearTimeout(t);
    }
    // En error NO cerramos: dejamos el motivo a la vista.
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
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>
          {ok === false ? "⚠️" : "✓"}
        </div>
        <h1 style={{ fontSize: 22, margin: 0 }}>
          {ok === false ? "No se pudo conectar" : "¡Mercado Pago conectado!"}
        </h1>
        {ok === false ? (
          <>
            {reason && (
              <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  opacity: 0.85,
                  wordBreak: "break-word",
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                {decodeURIComponent(reason)}
              </p>
            )}
            <p style={{ opacity: 0.6, marginTop: 12, fontSize: 13 }}>
              Cerrá esta ventana y probá de nuevo. Si el error menciona la cuenta,
              recordá usar tu cuenta de Mercado Pago (no la de la app).
            </p>
          </>
        ) : (
          <p style={{ opacity: 0.7, marginTop: 8, fontSize: 15 }}>
            Podés cerrar esta ventana y volver a tu postulación.
          </p>
        )}
      </div>
    </div>
  );
}
