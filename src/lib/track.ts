/**
 * Medidor propio de visitas (sin cookies, sin datos personales).
 * Manda un beacon a la edge function `track`, que clasifica la página y guarda
 * dispositivo, origen e idioma. Ver supabase/functions/track/index.ts.
 *
 * Es "best-effort": nunca lanza ni bloquea la navegación. Si no hay Supabase
 * configurado (dev sin .env), no hace nada.
 */

export type TrackEvent = "pageview" | "apoyar_click" | "checkout" | "gracias";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function track(event: TrackEvent, path?: string): void {
  if (!url || typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      event,
      path: path ?? window.location.pathname + window.location.search,
      ref: document.referrer || null,
      lang: navigator.language || null,
    });
    const endpoint = `${url}/functions/v1/track`;
    // text/plain evita el preflight CORS (sendBeacon no puede hacerlo).
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(endpoint, new Blob([payload], { type: "text/plain" }));
      if (ok) return;
    }
    fetch(endpoint, { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
  } catch {
    /* nunca rompe la página */
  }
}
