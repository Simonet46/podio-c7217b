// Edge Function: athlete-recover
// La llama el login de atletas cuando alguien toca "olvidé mi contraseña".
// Es inteligente y siempre hace lo correcto para un atleta real:
//   - Si el email corresponde a un atleta CON cuenta → manda recuperación.
//   - Si corresponde a un atleta SIN cuenta todavía → le crea la cuenta y le
//     manda el invite para que active y ponga contraseña.
//   - Si no corresponde a ningún atleta → no manda nada, pero devuelve ok
//     genérico (no revelamos qué emails existen).
//
// Secrets: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, SITE_URL.
// Deploy con --no-verify-jwt (lo llama el sitio público con la anon key).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json, serviceClient, SITE_URL } from "../_shared/util.ts";

const REDIRECT_TO = `${SITE_URL}/bienvenida/`;
const isEmail = (s: unknown): s is string =>
  typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const { email } = await req.json().catch(() => ({}));
  if (!isEmail(email)) return json({ error: "Email inválido." }, 400);
  const target = email.trim().toLowerCase();

  const supa = serviceClient();
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  // ¿Hay un atleta con ese email? (case-insensitive)
  const { data: athlete } = await supa
    .from("athletes")
    .select("id, user_id")
    .ilike("email", target)
    .maybeSingle();

  // No revelamos si el email existe o no: siempre ok genérico.
  if (!athlete) return json({ ok: true, kind: "none" });

  if (athlete.user_id) {
    // Ya tiene cuenta → recuperación de contraseña (cae en /bienvenida?type=recovery).
    await anon.auth.resetPasswordForEmail(target, { redirectTo: REDIRECT_TO });
    return json({ ok: true, kind: "recovery" });
  }

  // No tiene cuenta → invite (crea la cuenta y manda el link para activarla).
  const { data, error } = await supa.auth.admin.inviteUserByEmail(target, {
    data: { athlete_id: athlete.id },
    redirectTo: REDIRECT_TO,
  });
  if (error) {
    // Ya registrado en Auth pero sin vincular: vincular y mandar recuperación.
    if (error.message?.toLowerCase().includes("already")) {
      const { data: list } = await supa.auth.admin.listUsers();
      const existing = list?.users?.find(
        (u) => u.email?.toLowerCase() === target,
      );
      if (existing?.id) {
        await supa.from("athletes").update({ user_id: existing.id }).eq("id", athlete.id);
      }
      await anon.auth.resetPasswordForEmail(target, { redirectTo: REDIRECT_TO });
      return json({ ok: true, kind: "recovery" });
    }
    console.error("athlete-recover invite falló:", error.message);
    return json({ ok: true, kind: "error_silencioso" });
  }
  if (data?.user?.id) {
    await supa.from("athletes").update({ user_id: data.user.id }).eq("id", athlete.id);
  }
  return json({ ok: true, kind: "invite" });
});
