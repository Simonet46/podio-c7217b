-- Moderación de cambios de perfil: permitir que un atleta tenga VARIOS
-- cambios pendientes en cola (antes solo se permitía uno a la vez).
--
-- El WITH CHECK anterior tenía un `NOT EXISTS (... status = 'pending')` que
-- bloqueaba cualquier segundo cambio. Peor: el front interpretaba CUALQUIER
-- error de policy como "ya tenés un cambio pendiente", así que el cartel
-- aparecía incluso sin cambios en cola. Lo sacamos: el atleta puede enviar
-- todos los cambios que quiera y el backoffice los valida uno por uno, en orden.
--
-- Aplicada el 6/7/2026 vía Management API.
DROP POLICY IF EXISTS pcr_athlete_insert_own ON public.profile_change_requests;
CREATE POLICY pcr_athlete_insert_own ON public.profile_change_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    athlete_id IN (SELECT id FROM public.athletes WHERE user_id = auth.uid())
    AND status = 'pending'
  );
