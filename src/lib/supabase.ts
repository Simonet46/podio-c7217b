/**
 * Cliente de Supabase modular.
 * Devuelve `null` si no hay variables de entorno → la app cae al seed local.
 * El paquete @supabase/supabase-js se importa de forma dinámica para que la
 * app compile y corra aunque la dependencia no esté instalada.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** ¿Está Supabase configurado? Usado por la capa de datos para decidir la fuente. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/** Cliente público (lectura/sesión). `null` si no hay config.
 *  Singleton: crear un GoTrueClient por llamada comparte la misma storage key
 *  entre instancias y puede colgar getSession() (lock contention). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any | null = null;
export async function getSupabase() {
  if (!url || !anonKey) return null;
  if (_client) return _client;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    _client = createClient(url, anonKey);
    return _client;
  } catch {
    // Dependencia no instalada — corremos con seed local.
    return null;
  }
}

/** Cliente de servicio (escritura: webhooks). NUNCA exponer al cliente. */
export async function getSupabaseAdmin() {
  if (!url || !serviceKey) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  } catch {
    return null;
  }
}
