-- Medidor propio de visitas + agregados para el Dashboard del admin.
--
-- page_views: una fila por vista de página o evento del sitio público, sin
-- cookies ni datos personales. `visitor` es un hash diario de ip+navegador que
-- sirve solo para contar visitantes únicos aproximados por día.
--
-- Escribe únicamente la edge function `track` (service role). Lee únicamente
-- `dashboard_traffic()`, gateada por is_admin().

create table if not exists public.page_views (
  id            bigint generated always as identity primary key,
  ts            timestamptz not null default now(),
  event         text not null default 'pageview',   -- pageview | apoyar_click | checkout | gracias
  path          text not null,
  kind          text not null,                      -- home | atleta | equipo | postulacion | empresas | legal | otro
  slug          text,
  device        text not null,                      -- mobile | tablet | desktop
  source        text not null,                      -- instagram | whatsapp | facebook | google | tiktok | x | linkedin | directo | otro
  referrer_host text,
  lang          text,
  visitor       text
);

create index if not exists page_views_ts_idx on public.page_views (ts desc);
create index if not exists page_views_kind_slug_idx on public.page_views (kind, slug, ts desc);
create index if not exists page_views_event_idx on public.page_views (event, ts desc);

alter table public.page_views enable row level security;
-- Sin policies a propósito: nadie lee ni escribe por la API directa.
revoke all on table public.page_views from anon, authenticated;

-- Agregados de tráfico para el Dashboard. Devuelve un solo JSON con todo lo
-- que la pantalla necesita, así el admin hace una sola llamada.
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
  if not is_admin() then
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
grant execute on function public.dashboard_traffic(int) to authenticated;
