-- Novedades de EQUIPOS en campaña ("ya juntamos el 60%", "ganamos el torneo").
-- Como los equipos no tienen cuenta propia, las publica el equipo de GRANITO
-- desde el backoffice: nacen 'approved' directamente (sin moderación).
-- Se muestran en la página pública de la campaña (/equipos/[slug]).
--
-- Aplicada el 10/7/2026 vía Management API.
CREATE TABLE IF NOT EXISTS public.team_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.team_applications(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS team_updates_feed_idx ON public.team_updates (team_id, status, created_at DESC);
ALTER TABLE public.team_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tu_public_read_approved ON public.team_updates FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY tu_admin_all ON public.team_updates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
