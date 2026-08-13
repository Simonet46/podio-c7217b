-- Novedades que el atleta publica en su perfil (posts cortos). Moderadas:
-- nacen 'pending' y solo se muestran al público cuando el equipo las aprueba.
-- Aplicada el 4/7/2026 vía Management API.
CREATE TABLE IF NOT EXISTS public.athlete_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS athlete_updates_feed_idx ON public.athlete_updates (athlete_id, status, created_at DESC);
ALTER TABLE public.athlete_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY au_public_read_approved ON public.athlete_updates FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY au_athlete_read_own ON public.athlete_updates FOR SELECT TO authenticated USING (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()));
CREATE POLICY au_athlete_insert_own ON public.athlete_updates FOR INSERT TO authenticated WITH CHECK (athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid()) AND status = 'pending');
CREATE POLICY au_admin_all ON public.athlete_updates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
