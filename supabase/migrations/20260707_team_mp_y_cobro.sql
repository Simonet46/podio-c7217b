-- Mercado Pago para equipos + cobro automático de compromisos validados.
--
-- Flujo: el equipo conecta su MP por OAuth (igual que un atleta). Cuando la
-- campaña cierra, el admin toca "Validar y enviar links": se crea una
-- preferencia de Checkout Pro por cada compromiso (con marketplace_fee 7%)
-- EN NOMBRE del equipo, y a cada donante le llega el link de pago por email.
-- El webhook marca el compromiso como 'paid' cuando MP aprueba el pago.
--
-- Aplicada el 7/7/2026 vía Management API.

-- Tokens OAuth del equipo (espejo de athlete_mp_accounts).
CREATE TABLE IF NOT EXISTS public.team_mp_accounts (
  team_id uuid PRIMARY KEY REFERENCES public.team_applications(id) ON DELETE CASCADE,
  mp_user_id text,
  access_token text,
  refresh_token text,
  public_key text,
  token_expires_at timestamptz,
  live_mode boolean,
  connected_at timestamptz DEFAULT now(),
  updated_at timestamptz
);
ALTER TABLE public.team_mp_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tma_admin_all ON public.team_mp_accounts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Flag visible en el backoffice sin exponer tokens.
ALTER TABLE public.team_applications ADD COLUMN IF NOT EXISTS mp_connected boolean NOT NULL DEFAULT false;

-- Seguimiento del cobro por compromiso + nuevo estado 'paid'.
ALTER TABLE public.team_pledges
  ADD COLUMN IF NOT EXISTS payment_link text,
  ADD COLUMN IF NOT EXISTS mp_preference_id text,
  ADD COLUMN IF NOT EXISTS mp_payment_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE public.team_pledges DROP CONSTRAINT IF EXISTS team_pledges_status_check;
ALTER TABLE public.team_pledges ADD CONSTRAINT team_pledges_status_check CHECK (status IN ('pledged','validated','paid','cancelled'));
