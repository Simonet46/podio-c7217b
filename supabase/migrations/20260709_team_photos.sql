-- Fotos de la campaña de equipo (1 obligatoria + 1 opcional), igual que atletas.
-- Se exponen en public_teams para mostrarlas en la card del home y la página.
--
-- Aplicada el 9/7/2026 vía Management API.
ALTER TABLE public.team_applications
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS photo_secondary_url text;

DROP VIEW IF EXISTS public.public_teams;
CREATE VIEW public.public_teams AS
SELECT t.id, t.slug, t.team_name, t.sport, t.competition,
       t.goal_amount, t.goal_purpose, t.fundraising_start, t.fundraising_end, t.active,
       t.photo_url, t.photo_secondary_url,
       COALESCE((SELECT SUM(p.amount) FROM public.team_pledges p WHERE p.team_id = t.id AND p.status = 'completed'), 0) AS raised_amount,
       COALESCE((SELECT COUNT(*) FROM public.team_pledges p WHERE p.team_id = t.id AND p.status = 'completed'), 0) AS donor_count
FROM public.team_applications t
WHERE t.status = 'approved' AND t.slug IS NOT NULL AND t.mp_connected;
GRANT SELECT ON public.public_teams TO anon, authenticated;
