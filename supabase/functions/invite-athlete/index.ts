// Edge Function: invite-athlete
// El admin la llama luego de aprobar una postulación. Crea la cuenta de
// Supabase Auth del atleta (o le reenvía un magic link si ya existe) y vincula
// athletes.user_id al nuevo usuario.
//
// Requiere: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, SITE_URL.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json, serviceClient, SITE_URL } from "../_shared/util.ts";

// El sitio es static export con trailingSlash — el redirect necesita la barra final.
const REDIRECT_TO = `${SITE_URL}/bienvenida/`;

// signInWithOtp con el cliente anónimo SÍ envía el email (generateLink solo
// genera el link sin mandarlo — por eso los "reenvíos" no llegaban).
async function sendMagicLink(email: string) {
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { error } = await anon.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: REDIRECT_TO, shouldCreateUser: false },
  });
  return error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // Solo admin.
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: isAdmin } = await userClient.rpc("is_admin");
  if (isAdmin !== true) return json({ error: "No autorizado." }, 403);

  const { athlete_id } = await req.json().catch(() => ({}));
  if (!athlete_id) return json({ error: "Falta athlete_id." }, 400);

  const supa = serviceClient();

  const { data: athlete } = await supa
    .from("athletes")
    .select("email, full_name, user_id")
    .eq("id", athlete_id)
    .single();

  if (!athlete?.email) {
    return json({ error: "El atleta no tiene email registrado." }, 404);
  }

  // Si ya tiene user_id vinculado, mandarle un magic link nuevo.
  if (athlete.user_id) {
    const error = await sendMagicLink(athlete.email);
    if (error) return json({ error: "No se pudo reenviar el link: " + error.message }, 502);
    return json({ ok: true, resent: true });
  }

  // Primer invite: crea usuario en Auth y envía email.
  const { data, error } = await supa.auth.admin.inviteUserByEmail(athlete.email, {
    data: { athlete_id },
    redirectTo: REDIRECT_TO,
  });

  if (error) {
    // Usuario ya registrado (confirmó antes): vincular user_id y mandar magic link.
    if (error.message?.toLowerCase().includes("already")) {
      const { data: list } = await supa.auth.admin.listUsers();
      const existing = list?.users?.find(
        (u) => u.email?.toLowerCase() === athlete.email.toLowerCase(),
      );
      if (existing?.id) {
        await supa.from("athletes").update({ user_id: existing.id }).eq("id", athlete_id);
      }
      const sendErr = await sendMagicLink(athlete.email);
      if (sendErr) return json({ error: "No se pudo reenviar: " + sendErr.message }, 502);
      return json({ ok: true, resent: true });
    }
    return json({ error: "No se pudo invitar: " + error.message }, 502);
  }

  // Vincular user_id inmediatamente (antes de que el atleta acepte).
  if (data?.user?.id) {
    await supa
      .from("athletes")
      .update({ user_id: data.user.id })
      .eq("id", athlete_id);
  }

  return json({ ok: true, resent: false });
});
