// Edge Function: invite-athlete
// El admin la llama luego de aprobar una postulación. Crea la cuenta de
// Supabase Auth del atleta (o reenvía el link si ya existe) y vincula
// athletes.user_id al nuevo usuario.
//
// Requiere: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, SITE_URL.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json, serviceClient, SITE_URL } from "../_shared/util.ts";

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

  // Si ya tiene user_id vinculado, reenviar magic link.
  if (athlete.user_id) {
    const { error } = await supa.auth.admin.generateLink({
      type: "magiclink",
      email: athlete.email,
      options: { redirectTo: `${SITE_URL}/bienvenida` },
    });
    if (error) return json({ error: "No se pudo reenviar el link: " + error.message }, 502);
    return json({ ok: true, resent: true });
  }

  // Primer invite: crea usuario en Auth y envía email.
  const { data, error } = await supa.auth.admin.inviteUserByEmail(athlete.email, {
    data: { athlete_id },
    redirectTo: `${SITE_URL}/bienvenida`,
  });

  if (error) {
    // Usuario ya registrado (confirmó antes): vincular y reenviar magic link.
    if (error.message?.toLowerCase().includes("already")) {
      const { data: link, error: linkErr } = await supa.auth.admin.generateLink({
        type: "magiclink",
        email: athlete.email,
        options: { redirectTo: `${SITE_URL}/bienvenida` },
      });
      if (linkErr) return json({ error: "No se pudo reenviar: " + linkErr.message }, 502);
      // Vincular user_id si lo tenemos en link.properties
      const uid = (link as { user?: { id?: string } })?.user?.id;
      if (uid) {
        await supa.from("athletes").update({ user_id: uid }).eq("id", athlete_id);
      }
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
