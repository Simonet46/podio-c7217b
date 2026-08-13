// Edge Function: deploy-status
// Devuelve el estado del último deploy del sitio público (workflow deploy.yml
// de GitHub Actions), para que el backoffice muestre un semáforo al lado de
// "Publicar ahora". Antes el botón era dispara-y-olvida: si el deploy fallaba
// (pasó el 06/08 con una caída de GitHub) nadie se enteraba.
//
// Solo admins. Reusa los mismos secrets que trigger-rebuild:
//   GITHUB_TOKEN, GITHUB_REPO (opcional), GITHUB_WORKFLOW (opcional).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors, json } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // Admin del backoffice (JWT propio) o service_role (pruebas/monitoreo).
  // El gateway ya validó la firma del token, así que el claim es confiable.
  const authHeader = req.headers.get("Authorization") ?? "";
  let autorizado = false;
  try {
    const payload = JSON.parse(atob(authHeader.replace(/^Bearer\s+/i, "").split(".")[1] ?? ""));
    autorizado = payload?.role === "service_role";
  } catch { /* sigue el chequeo de admin */ }
  if (!autorizado) {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: isAdmin } = await supabase.rpc("is_admin");
    autorizado = isAdmin === true;
  }
  if (!autorizado) return json({ error: "No autorizado." }, 403);

  const token = Deno.env.get("GITHUB_TOKEN");
  const repo = Deno.env.get("GITHUB_REPO") ?? "Simonet46/podio-c7217b";
  const workflow = Deno.env.get("GITHUB_WORKFLOW") ?? "deploy.yml";
  if (!token) return json({ error: "Falta GITHUB_TOKEN." }, 500);

  const r = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/runs?per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "ayudin-backoffice",
      },
    },
  );
  if (!r.ok) return json({ error: `GitHub respondió ${r.status}` }, 502);

  const data = await r.json();
  const run = data.workflow_runs?.[0];
  if (!run) return json({ status: "none" });

  return json({
    // "queued" | "in_progress" | "completed"
    status: run.status,
    // "success" | "failure" | "cancelled" | null (si sigue corriendo)
    conclusion: run.conclusion ?? null,
    created_at: run.created_at,
    updated_at: run.updated_at,
    html_url: run.html_url,
  });
});
