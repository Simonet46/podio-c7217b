-- Crédito de foto: quién sacó las fotos del atleta o del proyecto (opcional).
--
-- El derecho de imagen es del atleta (art. 53 CCyC) pero la foto es del
-- fotógrafo (ley 11.723), y las fotos "en acción" suelen ser de fotógrafos de
-- evento, federación o prensa. Pedir el crédito baja el conflicto y queda
-- visible en el perfil como "Foto: …".
--
-- Circuito atletas: se declara en la postulación (athlete_applications), el
-- backoffice lo copia al atleta al aprobar, y después se edita desde Mi perfil
-- (vía profile_change_requests, jsonb) o desde el backoffice.
-- Circuito proyectos: vive en team_applications y sale por la vista pública.
--
-- Aditiva e idempotente: segura de correr sobre producción.
-- Aplicada el 17/9/2026 vía MCP de Supabase.

alter table public.athlete_applications add column if not exists photo_credit text;
alter table public.athletes            add column if not exists photo_credit text;
alter table public.team_applications   add column if not exists photo_credit text;

-- La vista pública expone la columna nueva. Va AL FINAL a propósito: así
-- alcanza con or-replace (sin drop), la vista nunca deja de existir y no se
-- pierden los grants.
create or replace view public.public_teams as
select t.id, t.slug, t.team_name, t.sport, t.competition,
       t.goal_amount, t.goal_purpose, t.fundraising_start, t.fundraising_end,
       t.active, t.photo_url, t.photo_secondary_url, t.hero_badge,
       coalesce((select sum(p.amount) from public.team_pledges p
                  where p.team_id = t.id and p.status = 'completed'), 0) as raised_amount,
       coalesce((select count(*) from public.team_pledges p
                  where p.team_id = t.id and p.status = 'completed'), 0) as donor_count,
       t.photo_credit
from public.team_applications t
where t.status = 'approved' and t.slug is not null and t.mp_connected;
grant select on public.public_teams to anon, authenticated;
