-- Endurece el insert de compromisos de aporte (team_pledges).
--
-- Antes: cualquier anónimo podía insertar un compromiso para CUALQUIER team_id
-- (WITH CHECK solo exigía status='pledged'). Como el total prometido es público
-- (vista public_teams), se podía inflar por llamadas directas a la API, o cargar
-- compromisos a equipos rechazados/inexistentes.
--
-- Ahora: solo se aceptan compromisos a equipos APROBADOS y ACTIVOS. Usamos la
-- vista public_teams (que corre como owner e ignora RLS, y anon tiene GRANT
-- SELECT), así el subquery funciona para el rol anónimo.
--
-- Aplicada el 8/7/2026 vía Management API.
DROP POLICY IF EXISTS tp_public_insert ON public.team_pledges;
CREATE POLICY tp_public_insert ON public.team_pledges
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pledged'
    AND team_id IN (SELECT id FROM public.public_teams WHERE active)
  );
