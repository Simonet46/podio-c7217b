-- Los equipos pasan a cobrar IGUAL QUE LOS ATLETAS: cobro directo e inmediato,
-- sin standby ni validación nuestra. El objetivo pasa a ser solo una barra
-- visual (el dinero se entrega aunque no se llegue).
--
-- team_pledges deja de ser "compromisos": ahora guarda DONACIONES reales que
-- crea el webhook de MP al confirmarse el pago (nadie inserta desde el cliente;
-- el widget redirige a Checkout Pro como los atletas).
--
-- Aplicada el 8/7/2026 vía Management API.

-- Ya no hay inserts públicos: las donaciones las crea el webhook (service_role).
DROP POLICY IF EXISTS tp_public_insert ON public.team_pledges;

-- Estados de donación reales.
ALTER TABLE public.team_pledges DROP CONSTRAINT IF EXISTS team_pledges_status_check;
ALTER TABLE public.team_pledges ADD CONSTRAINT team_pledges_status_check CHECK (status IN ('pending','completed','failed','refunded'));
ALTER TABLE public.team_pledges ALTER COLUMN status SET DEFAULT 'pending';

-- Idempotencia por pago (reintentos del webhook no duplican).
CREATE UNIQUE INDEX IF NOT EXISTS team_pledges_mp_payment_id_key ON public.team_pledges (mp_payment_id) WHERE mp_payment_id IS NOT NULL;

-- Vista pública: recaudado real (donaciones completadas) y solo equipos con MP
-- conectado (sin MP no se puede cobrar, igual que un atleta sin MP no se publica).
DROP VIEW IF EXISTS public.public_teams;
CREATE VIEW public.public_teams AS
SELECT t.id, t.slug, t.team_name, t.sport, t.competition,
       t.goal_amount, t.goal_purpose, t.fundraising_start, t.fundraising_end, t.active,
       COALESCE((SELECT SUM(p.amount) FROM public.team_pledges p WHERE p.team_id = t.id AND p.status = 'completed'), 0) AS raised_amount,
       COALESCE((SELECT COUNT(*) FROM public.team_pledges p WHERE p.team_id = t.id AND p.status = 'completed'), 0) AS donor_count
FROM public.team_applications t
WHERE t.status = 'approved' AND t.slug IS NOT NULL AND t.mp_connected;
GRANT SELECT ON public.public_teams TO anon, authenticated;
