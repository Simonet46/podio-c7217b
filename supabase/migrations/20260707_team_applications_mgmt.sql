-- Gestión de equipos postulados desde el backoffice, igual que los atletas.
-- Los equipos, además de lo que ya tenían (competencia, fechas de campaña,
-- contacto), llevan un objetivo de recaudación (cuánto necesitan y para qué)
-- y un flag `active` para activarlos/suspenderlos una vez aprobados.
--
-- Aplicada el 7/7/2026 vía Management API.
ALTER TABLE public.team_applications
  ADD COLUMN IF NOT EXISTS goal_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goal_purpose text,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
