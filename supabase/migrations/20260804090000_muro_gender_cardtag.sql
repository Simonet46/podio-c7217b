-- Muro de hinchas real + género + pill de card editable.
-- Aditiva e idempotente: segura de correr sobre producción.

-- 1) Nombre del donante (opcional, lo escribe el hincha para el muro).
alter table public.donations add column if not exists donor_name text;

-- 2) Género del atleta (para "la/lo apoyan", "Conocela/Conocelo").
alter table public.athletes add column if not exists gender text
  check (gender in ('f','m'));

-- 3) Pill personalizable de la card del grid (la edita el admin).
alter table public.athletes add column if not exists card_tag text;

-- 4) Muro público de un atleta: nombre + nivel, NUNCA email ni monto exacto.
create or replace view public.public_supporters as
  select
    a.slug as athlete_slug,
    nullif(trim(d.donor_name), '') as donor_name,
    case
      when d.amount >= 25000 then 'oro'
      when d.amount >= 10000 then 'plata'
      else 'bronce'
    end as tier,
    d.created_at
  from public.donations d
  join public.athletes a on a.id = d.athlete_id
  where d.status = 'completed' and a.verified = true;

-- 5) Ídem para proyectos de equipo (team_pledges ya tiene donor_name).
create or replace view public.public_team_supporters as
  select
    t.slug as team_slug,
    nullif(trim(p.donor_name), '') as donor_name,
    case
      when p.amount >= 25000 then 'oro'
      when p.amount >= 10000 then 'plata'
      else 'bronce'
    end as tier,
    p.paid_at as created_at
  from public.team_pledges p
  join public.team_applications t on t.id = p.team_id
  where p.status = 'completed';

grant select on public.public_supporters to anon, authenticated;
grant select on public.public_team_supporters to anon, authenticated;
