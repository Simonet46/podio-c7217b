-- Teléfono de contacto en las postulaciones (atletas y proyectos deportivos).
-- Lo pedimos para poder verificar la identidad por otra vía antes de aprobar.
-- Se guarda con prefijo internacional (ej: "+54 9 11 5555-5555").
--
-- Aplicada el 11/7/2026 vía Management API.
ALTER TABLE public.athlete_applications ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.team_applications ADD COLUMN IF NOT EXISTS phone text;
