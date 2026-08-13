-- Campañas públicas de equipos (crowdfunding de misiones).
--
-- Modelo de aporte: el hincha COMPROMETE un aporte (nombre, email, monto)
-- pero NO se le cobra nada en el momento. El dinero queda "en standby":
-- al finalizar el período de campaña, el equipo de GRANITO lo valida desde
-- el backoffice y recién ahí se hace efectivo el cobro (link de pago).
--
-- Aplicada el 7/7/2026 vía Management API.

-- Slug público + medio de cobro del equipo (alias/CVU de Mercado Pago).
ALTER TABLE public.team_applications
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_mp text;

-- Compromisos de aporte. Nunca hay dinero acá: solo promesas a validar.
CREATE TABLE IF NOT EXISTS public.team_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.team_applications(id) ON DELETE CASCADE,
  donor_name text,
  donor_email text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged','validated','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz
);
CREATE INDEX IF NOT EXISTS team_pledges_team_idx ON public.team_pledges (team_id, status);
ALTER TABLE public.team_pledges ENABLE ROW LEVEL SECURITY;
CREATE POLICY tp_public_insert ON public.team_pledges FOR INSERT TO anon, authenticated WITH CHECK (status = 'pledged');
CREATE POLICY tp_admin_all ON public.team_pledges FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Vista pública para el sitio estático y el widget en vivo:
-- solo equipos aprobados con slug, SIN email ni contacto, con el total
-- prometido agregado (los emails de los donantes nunca se exponen).
CREATE OR REPLACE VIEW public.public_teams AS
SELECT t.id, t.slug, t.team_name, t.sport, t.competition,
       t.goal_amount, t.goal_purpose, t.fundraising_start, t.fundraising_end, t.active,
       COALESCE((SELECT SUM(p.amount) FROM public.team_pledges p WHERE p.team_id = t.id AND p.status <> 'cancelled'), 0) AS pledged_amount,
       COALESCE((SELECT COUNT(*) FROM public.team_pledges p WHERE p.team_id = t.id AND p.status <> 'cancelled'), 0) AS pledge_count
FROM public.team_applications t
WHERE t.status = 'approved' AND t.slug IS NOT NULL;
GRANT SELECT ON public.public_teams TO anon, authenticated;
