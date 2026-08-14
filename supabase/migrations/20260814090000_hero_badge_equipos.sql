-- Píldora del hero editable también para PROYECTOS DEPORTIVOS.
-- Los atletas ya tienen athletes.hero_badge (08/08); los equipos del desfile
-- seguían clavados en "Historia real, revisada a mano". Misma mecánica:
-- vacío = frase por defecto.
-- Aditiva e idempotente: segura de correr sobre producción.

alter table public.team_applications add column if not exists hero_badge text;

-- La vista pública expone la columna nueva (drop+create porque or-replace no
-- puede insertar columnas en el medio; mismo patrón que 20260709).
drop view if exists public.public_teams;
create view public.public_teams as
select t.id, t.slug, t.team_name, t.sport, t.competition,
       t.goal_amount, t.goal_purpose, t.fundraising_start, t.fundraising_end,
       t.active, t.photo_url, t.photo_secondary_url, t.hero_badge,
       coalesce((select sum(p.amount) from public.team_pledges p
                  where p.team_id = t.id and p.status = 'completed'), 0) as raised_amount,
       coalesce((select count(*) from public.team_pledges p
                  where p.team_id = t.id and p.status = 'completed'), 0) as donor_count
from public.team_applications t
where t.status = 'approved' and t.slug is not null and t.mp_connected;
grant select on public.public_teams to anon, authenticated;
