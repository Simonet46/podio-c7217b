-- Meta de recaudación opcional (opt-in por el admin). Aplicada vía Management API.
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS show_goal boolean NOT NULL DEFAULT false;
-- (La columna athletes.team ya existía; las selecciones nacionales usan ese campo.)

-- (4/7/2026, más tarde) El admin necesita leer donaciones para estadísticas reales.
-- Aplicada vía Management API:
--   CREATE POLICY donations_admin_read ON public.donations
--     FOR SELECT TO authenticated USING (public.is_admin());
