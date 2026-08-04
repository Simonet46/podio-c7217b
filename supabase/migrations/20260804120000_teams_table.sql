-- Selecciones gestionables desde el backoffice (antes hardcodeadas en el código).
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  sport       text not null,
  discipline  text not null default '',
  city        text not null default '',
  province    text not null default '',
  bio         text not null default '',
  color       text,
  national    boolean not null default true,
  verified    boolean not null default true,
  photo_url   text,
  goal_amount numeric not null default 0,
  raised_amount numeric not null default 0,
  stats       jsonb not null default '[]',
  fund_items  jsonb not null default '[]',
  created_at  timestamptz not null default now()
);
alter table public.teams enable row level security;
drop policy if exists teams_public_read on public.teams;
create policy teams_public_read on public.teams
  for select to anon, authenticated using (verified = true);
drop policy if exists teams_admin_all on public.teams;
create policy teams_admin_all on public.teams
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
