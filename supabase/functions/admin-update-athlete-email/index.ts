// Edge Function: admin-update-athlete-email
// El admin corrige el email de un atleta (el caso real: el postulante escribió
// cualquier cosa en el campo email y quedó ilocalizable).
//
// No alcanza con actualizar la fila de `athletes`: si el atleta ya tiene
// usuario de Auth (se le mandó el acceso), ese usuario quedó creado con el
// email viejo y el login/magic-link seguiría roto. Acá se actualizan los dos.
//
// Solo admins. Secrets: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json, serviceClient } from "../_shared/util.ts";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: isAdmin } = await userClient.rpc("is_admin");
  if (isAdmin !== true) return json({ error: "No autorizado." }, 403);

  const { athlete_id, email } = await req.json().catch(() => ({}));
  const nuevo = String(email ?? "").trim().toLowerCase();
  if (!athlete_id || !isEmail(nuevo)) {
    return json({ error: "Faltan athlete_id o un email válido." }, 400);
  }

  const supa = serviceClient();
  const { data: athlete } = await supa
    .from("athletes")
    .select("id, user_id, email")
    .eq("id", athlete_id)
    .maybeSingle();
  if (!athlete) return json({ error: "Atleta no encontrado." }, 404);

  // Primero Auth (es lo que puede fallar); recién después la fila del atleta.
  let authActualizado = false;
  if (athlete.user_id) {
    const { error } = await supa.auth.admin.updateUserById(athlete.user_id, {
      email: nuevo,
      email_confirm: true,
    });
    if (error) {
      return json(
        { error: "No se pudo actualizar el usuario de acceso: " + error.message },
        502,
      );
    }
    authActualizado = true;
  }

  const { error: updErr } = await supa
    .from("athletes")
    .update({ email: nuevo })
    .eq("id", athlete_id);
  if (updErr) return json({ error: updErr.message }, 500);

  return json({ ok: true, auth_actualizado: authActualizado });
});
