-- Salud de Mercado Pago + resumen semanal.
--
-- 1. `mp_blocked_reason`: la edge function mp-health pasa un atleta a "Sin
--    cobros" cuando MP dice que su cuenta no puede vender (status.sell.allow =
--    false). Guarda el motivo para mostrarlo en el admin y para saber que fue
--    un bloqueo automático: solo esos se re-publican solos cuando MP vuelve a
--    habilitar la cuenta (los "Sin cobros" puestos a mano no se tocan).
-- 2. dashboard_traffic() también puede llamarla el service_role (cron del
--    resumen semanal), además de los admins.
-- 3. Dos crons: mp-health (diario, 11:30 UTC) y weekly-digest (lunes 12:00 UTC).

alter table public.athletes          add column if not exists mp_blocked_reason text;
alter table public.athletes          add column if not exists mp_checked_at timestamptz;
alter table public.team_applications add column if not exists mp_blocked_reason text;
alter table public.team_applications add column if not exists mp_checked_at timestamptz;

create or replace function public.dashboard_traffic(p_days int default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from timestamptz := date_trunc('day', now() at time zone 'America/Argentina/Buenos_Aires')
                        - make_interval(days => greatest(p_days, 1) - 1);
  v_result jsonb;
begin
  if not (is_admin() or coalesce(auth.role(), '') = 'service_role') then
    raise exception 'No autorizado';
  end if;

  with base as (
    select *,
           (ts at time zone 'America/Argentina/Buenos_Aires')::date as d
    from page_views
    where ts >= v_from
  ),
  pv as (select * from base where event = 'pageview'),
  days as (
    select generate_series(v_from::date, (now() at time zone 'America/Argentina/Buenos_Aires')::date, '1 day')::date as d
  ),
  daily as (
    select days.d,
           count(pv.id)                                   as views,
           count(distinct pv.visitor)                     as visitors,
           count(pv.id) filter (where pv.device = 'mobile')  as mobile,
           count(pv.id) filter (where pv.device = 'desktop') as desktop,
           count(pv.id) filter (where pv.device = 'tablet')  as tablet
    from days left join pv on pv.d = days.d
    group by days.d order by days.d
  ),
  totals as (
    select count(*) as views,
           count(distinct visitor) as visitors,
           count(*) filter (where device = 'mobile')  as mobile,
           count(*) filter (where device = 'desktop') as desktop,
           count(*) filter (where device = 'tablet')  as tablet
    from pv
  ),
  sources as (
    select source, count(*) as views, count(distinct visitor) as visitors
    from pv group by source order by views desc
  ),
  kinds as (
    select kind, count(*) as views from pv group by kind order by views desc
  ),
  athletes as (
    select slug,
           count(*) filter (where event = 'pageview')     as views,
           count(distinct visitor) filter (where event = 'pageview') as visitors,
           count(*) filter (where event = 'apoyar_click') as apoyar,
           count(*) filter (where event = 'checkout')     as checkout
    from base where kind = 'atleta' and slug is not null
    group by slug order by views desc limit 25
  ),
  teams as (
    select slug,
           count(*) filter (where event = 'pageview')     as views,
           count(distinct visitor) filter (where event = 'pageview') as visitors,
           count(*) filter (where event = 'apoyar_click') as apoyar,
           count(*) filter (where event = 'checkout')     as checkout
    from base where kind = 'equipo' and slug is not null
    group by slug order by views desc limit 25
  ),
  paths as (
    select path, count(*) as views from pv group by path order by views desc limit 15
  ),
  funnel as (
    select count(*) filter (where event = 'pageview' and kind in ('atleta','equipo')) as perfil,
           count(*) filter (where event = 'apoyar_click') as apoyar,
           count(*) filter (where event = 'checkout')     as checkout,
           count(*) filter (where event = 'gracias')      as gracias
    from base
  )
  select jsonb_build_object(
    'days', p_days,
    'from', v_from,
    'daily',   (select coalesce(jsonb_agg(to_jsonb(daily)), '[]'::jsonb) from daily),
    'totals',  (select to_jsonb(totals) from totals),
    'sources', (select coalesce(jsonb_agg(to_jsonb(sources)), '[]'::jsonb) from sources),
    'kinds',   (select coalesce(jsonb_agg(to_jsonb(kinds)), '[]'::jsonb) from kinds),
    'athletes',(select coalesce(jsonb_agg(to_jsonb(athletes)), '[]'::jsonb) from athletes),
    'teams',   (select coalesce(jsonb_agg(to_jsonb(teams)), '[]'::jsonb) from teams),
    'paths',   (select coalesce(jsonb_agg(to_jsonb(paths)), '[]'::jsonb) from paths),
    'funnel',  (select to_jsonb(funnel) from funnel)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.dashboard_traffic(int) from public;
grant execute on function public.dashboard_traffic(int) to authenticated, service_role;

-- Crons (mismo patrón que mp-reconcile-diario; requiere vault 'service_role_key').
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'mp-health-diario',
  '30 11 * * *',
  $cron$
  select net.http_post(
    url := 'https://ruugpxfgpbtajrxbabvg.supabase.co/functions/v1/mp-health',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  )
  $cron$
);

select cron.schedule(
  'weekly-digest-lunes',
  '0 12 * * 1',
  $cron$
  select net.http_post(
    url := 'https://ruugpxfgpbtajrxbabvg.supabase.co/functions/v1/weekly-digest',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  )
  $cron$
);
