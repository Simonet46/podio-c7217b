-- ─────────────────────────────────────────────────────────────────────
-- ESQUEMA REAL de la base de GRANITO (proyecto ruugpxfgpbtajrxbabvg).
-- Generado el 13/08/2026 leyendo los catálogos de Postgres de producción,
-- porque el schema.sql anterior describía un esquema que nunca terminó de
-- existir (declaraba increment_raised, que no está en la base) y faltaba
-- todo lo creado desde el panel (postulaciones, cuentas MP, admins, etc.).
--
-- Es la FOTO de la base, para bootstrap y consulta. Los cambios nuevos van
-- como migraciones en supabase/migrations/ y se aplican con `db push`.
-- ─────────────────────────────────────────────────────────────────────

-- Extensiones activas: pg_cron 1.6.4, pg_net 0.20.3, pg_stat_statements 1.11, pgcrypto 1.3, plpgsql 1.0, supabase_vault 0.3.1, uuid-ossp 1.1

-- ── Tablas ──────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id              uuid not null,
  email                text,
  created_at           timestamp with time zone not null default now()
);
alter table public.admins enable row level security;

create table if not exists public.application_mp_accounts (
  application_id       uuid not null,
  mp_user_id           text not null,
  access_token         text not null,
  refresh_token        text,
  public_key           text,
  token_expires_at     timestamp with time zone,
  live_mode            boolean not null default false,
  connected_at         timestamp with time zone not null default now(),
  updated_at           timestamp with time zone not null default now()
);
alter table public.application_mp_accounts enable row level security;

create table if not exists public.athlete_applications (
  id                   uuid not null default gen_random_uuid(),
  full_name            text not null,
  sport                text not null,
  discipline           text,
  location             text,
  email                text not null,
  age                  integer,
  media_url            text,
  payment_link         text,
  achievements         text,
  needs                text,
  socials              text,
  status               text not null default 'pending'::text,
  created_at           timestamp with time zone not null default now(),
  athlete_id           uuid,
  reviewed_at          timestamp with time zone,
  photo_url            text,
  photo_secondary_url  text,
  next_competition     text,
  payment_mp           text,
  payment_paypal       text,
  accepted_terms       boolean not null default false,
  accepted_at          timestamp with time zone,
  terms_version        text,
  image_consent        boolean not null default false,
  is_minor_guardian    boolean not null default false,
  mp_connected         boolean not null default false,
  dni                  text,
  phone                text,
  sport_level          text,
  club                 text,
  has_public_grant     boolean default false,
  has_sponsorship      boolean default false,
  federative_compat_declared boolean default false,
  mp_ownership_declared boolean default false
);
alter table public.athlete_applications enable row level security;

create table if not exists public.athlete_mp_accounts (
  athlete_id           uuid not null,
  mp_user_id           text not null,
  access_token         text not null,
  refresh_token        text,
  public_key           text,
  token_expires_at     timestamp with time zone,
  live_mode            boolean not null default false,
  connected_at         timestamp with time zone not null default now(),
  updated_at           timestamp with time zone not null default now()
);
alter table public.athlete_mp_accounts enable row level security;

create table if not exists public.athlete_updates (
  id                   uuid not null default gen_random_uuid(),
  athlete_id           uuid not null,
  title                text not null,
  body                 text not null,
  image_url            text,
  status               text not null default 'pending'::text,
  admin_note           text,
  created_at           timestamp with time zone not null default now(),
  reviewed_at          timestamp with time zone,
  reviewed_by          uuid
);
alter table public.athlete_updates enable row level security;

create table if not exists public.athletes (
  id                   uuid not null default gen_random_uuid(),
  slug                 text not null,
  full_name            text not null,
  first_name           text not null,
  sport                text not null,
  discipline           text not null,
  city                 text not null,
  province             text not null,
  bio                  text not null default ''::text,
  goal_amount          numeric not null default 0,
  raised_amount        numeric not null default 0,
  photo_url            text,
  stats                jsonb not null default '[]'::jsonb,
  fund_items           jsonb not null default '[]'::jsonb,
  verified             boolean not null default false,
  stripe_account_id    text,
  created_at           timestamp with time zone not null default now(),
  team                 text,
  role                 text,
  scope                text not null default 'la2028'::text,
  photo_secondary_url  text,
  next_competition     text,
  socials              text,
  payment_mp           text,
  payment_paypal       text,
  mp_connected         boolean not null default false,
  supporter_message    text,
  user_id              uuid,
  email                text,
  dni                  text,
  show_goal            boolean not null default false,
  gender               text,
  card_tag             text,
  hero_badge           text
);
alter table public.athletes enable row level security;

create table if not exists public.donations (
  id                   uuid not null default gen_random_uuid(),
  athlete_id           uuid not null,
  amount               numeric not null,
  type                 text not null,
  platform_fee         numeric not null default 0,
  net_amount           numeric not null default 0,
  donor_email          text,
  stripe_payment_id    text,
  status               text not null default 'pending'::text,
  created_at           timestamp with time zone not null default now(),
  provider             text not null default 'mercadopago'::text,
  mp_payment_id        text,
  mp_preference_id     text,
  donor_name           text
);
alter table public.donations enable row level security;

create table if not exists public.legal_acceptances (
  id                   uuid not null default gen_random_uuid(),
  doc_type             text not null,
  doc_version          text not null,
  actor_type           text not null,
  context              text not null,
  email                text,
  user_id              uuid,
  related_id           text,
  ip                   text,
  user_agent           text,
  meta                 jsonb not null default '{}'::jsonb,
  created_at           timestamp with time zone not null default now()
);
alter table public.legal_acceptances enable row level security;

create table if not exists public.legal_documents (
  id                   uuid not null default gen_random_uuid(),
  doc_type             text not null,
  version              text not null,
  title                text not null,
  effective_date       date,
  content_hash         text,
  path                 text,
  is_current           boolean not null default true,
  created_at           timestamp with time zone not null default now()
);
alter table public.legal_documents enable row level security;

create table if not exists public.pending_mp_connections (
  connect_token        uuid not null,
  mp_user_id           text not null,
  access_token         text not null,
  refresh_token        text,
  public_key           text,
  token_expires_at     timestamp with time zone,
  live_mode            boolean not null default false,
  created_at           timestamp with time zone not null default now()
);
alter table public.pending_mp_connections enable row level security;

create table if not exists public.profile_change_requests (
  id                   uuid not null default gen_random_uuid(),
  athlete_id           uuid not null,
  changes              jsonb not null,
  previous_values      jsonb not null,
  status               text not null default 'pending'::text,
  admin_note           text,
  created_at           timestamp with time zone not null default now(),
  reviewed_at          timestamp with time zone,
  reviewed_by          uuid
);
alter table public.profile_change_requests enable row level security;

create table if not exists public.team_applications (
  id                   uuid not null default gen_random_uuid(),
  team_name            text not null,
  sport                text not null,
  competition          text,
  fundraising_start    date,
  fundraising_end      date,
  contact_name         text,
  email                text not null,
  notes                text,
  status               text not null default 'pending'::text,
  created_at           timestamp with time zone not null default now(),
  reviewed_at          timestamp with time zone,
  team_id              uuid,
  accepted_terms       boolean not null default false,
  accepted_at          timestamp with time zone,
  terms_version        text,
  goal_amount          numeric not null default 0,
  goal_purpose         text,
  active               boolean not null default true,
  slug                 text,
  payment_mp           text,
  mp_connected         boolean not null default false,
  photo_url            text,
  photo_secondary_url  text,
  phone                text
);
alter table public.team_applications enable row level security;

create table if not exists public.team_mp_accounts (
  team_id              uuid not null,
  mp_user_id           text,
  access_token         text,
  refresh_token        text,
  public_key           text,
  token_expires_at     timestamp with time zone,
  live_mode            boolean,
  connected_at         timestamp with time zone default now(),
  updated_at           timestamp with time zone
);
alter table public.team_mp_accounts enable row level security;

create table if not exists public.team_pledges (
  id                   uuid not null default gen_random_uuid(),
  team_id              uuid not null,
  donor_name           text,
  donor_email          text not null,
  amount               numeric not null,
  status               text not null default 'pending'::text,
  created_at           timestamp with time zone not null default now(),
  validated_at         timestamp with time zone,
  payment_link         text,
  mp_preference_id     text,
  mp_payment_id        text,
  paid_at              timestamp with time zone
);
alter table public.team_pledges enable row level security;

create table if not exists public.team_updates (
  id                   uuid not null default gen_random_uuid(),
  team_id              uuid not null,
  title                text not null,
  body                 text not null,
  image_url            text,
  status               text not null default 'approved'::text,
  created_at           timestamp with time zone not null default now()
);
alter table public.team_updates enable row level security;

create table if not exists public.teams (
  id                   uuid not null default gen_random_uuid(),
  slug                 text not null,
  name                 text not null,
  sport                text not null,
  discipline           text not null default ''::text,
  city                 text not null default ''::text,
  province             text not null default ''::text,
  bio                  text not null default ''::text,
  color                text,
  national             boolean not null default true,
  verified             boolean not null default true,
  photo_url            text,
  goal_amount          numeric not null default 0,
  raised_amount        numeric not null default 0,
  stats                jsonb not null default '[]'::jsonb,
  fund_items           jsonb not null default '[]'::jsonb,
  created_at           timestamp with time zone not null default now(),
  photo_secondary_url  text
);
alter table public.teams enable row level security;

-- ── Constraints (PK/FK/unique/check) ────────────────────────────────
alter table admins add constraint admins_pkey PRIMARY KEY (user_id);  -- p
alter table admins add constraint admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;  -- f
alter table application_mp_accounts add constraint application_mp_accounts_pkey PRIMARY KEY (application_id);  -- p
alter table application_mp_accounts add constraint application_mp_accounts_application_id_fkey FOREIGN KEY (application_id) REFERENCES athlete_applications(id) ON DELETE CASCADE;  -- f
alter table athlete_applications add constraint athlete_applications_pkey PRIMARY KEY (id);  -- p
alter table athlete_applications add constraint athlete_applications_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE SET NULL;  -- f
alter table athlete_applications add constraint athlete_applications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));  -- c
alter table athlete_mp_accounts add constraint athlete_mp_accounts_pkey PRIMARY KEY (athlete_id);  -- p
alter table athlete_mp_accounts add constraint athlete_mp_accounts_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE;  -- f
alter table athlete_updates add constraint athlete_updates_pkey PRIMARY KEY (id);  -- p
alter table athlete_updates add constraint athlete_updates_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE;  -- f
alter table athlete_updates add constraint athlete_updates_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);  -- f
alter table athlete_updates add constraint athlete_updates_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));  -- c
alter table athletes add constraint athletes_slug_key UNIQUE (slug);  -- u
alter table athletes add constraint athletes_pkey PRIMARY KEY (id);  -- p
alter table athletes add constraint athletes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;  -- f
alter table athletes add constraint athletes_gender_check CHECK ((gender = ANY (ARRAY['f'::text, 'm'::text])));  -- c
alter table donations add constraint donations_pkey PRIMARY KEY (id);  -- p
alter table donations add constraint donations_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE;  -- f
alter table donations add constraint donations_type_check CHECK ((type = ANY (ARRAY['once'::text, 'monthly'::text])));  -- c
alter table legal_acceptances add constraint legal_acceptances_pkey PRIMARY KEY (id);  -- p
alter table legal_documents add constraint legal_documents_doc_type_version_key UNIQUE (doc_type, version);  -- u
alter table legal_documents add constraint legal_documents_pkey PRIMARY KEY (id);  -- p
alter table pending_mp_connections add constraint pending_mp_connections_pkey PRIMARY KEY (connect_token);  -- p
alter table profile_change_requests add constraint profile_change_requests_pkey PRIMARY KEY (id);  -- p
alter table profile_change_requests add constraint profile_change_requests_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE;  -- f
alter table profile_change_requests add constraint profile_change_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);  -- f
alter table profile_change_requests add constraint profile_change_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));  -- c
alter table team_applications add constraint team_applications_slug_key UNIQUE (slug);  -- u
alter table team_applications add constraint team_applications_pkey PRIMARY KEY (id);  -- p
alter table team_mp_accounts add constraint team_mp_accounts_pkey PRIMARY KEY (team_id);  -- p
alter table team_mp_accounts add constraint team_mp_accounts_team_id_fkey FOREIGN KEY (team_id) REFERENCES team_applications(id) ON DELETE CASCADE;  -- f
alter table team_pledges add constraint team_pledges_pkey PRIMARY KEY (id);  -- p
alter table team_pledges add constraint team_pledges_team_id_fkey FOREIGN KEY (team_id) REFERENCES team_applications(id) ON DELETE CASCADE;  -- f
alter table team_pledges add constraint team_pledges_amount_check CHECK ((amount > (0)::numeric));  -- c
alter table team_pledges add constraint team_pledges_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text])));  -- c
alter table team_updates add constraint team_updates_pkey PRIMARY KEY (id);  -- p
alter table team_updates add constraint team_updates_team_id_fkey FOREIGN KEY (team_id) REFERENCES team_applications(id) ON DELETE CASCADE;  -- f
alter table team_updates add constraint team_updates_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));  -- c
alter table teams add constraint teams_slug_key UNIQUE (slug);  -- u
alter table teams add constraint teams_pkey PRIMARY KEY (id);  -- p

-- ── Índices ─────────────────────────────────────────────────────────
CREATE INDEX applications_status_idx ON public.athlete_applications USING btree (status, created_at DESC);
CREATE INDEX athlete_updates_feed_idx ON public.athlete_updates USING btree (athlete_id, status, created_at DESC);
CREATE UNIQUE INDEX athletes_user_id_unique ON public.athletes USING btree (user_id) WHERE (user_id IS NOT NULL);
CREATE INDEX athletes_verified_idx ON public.athletes USING btree (verified);
CREATE INDEX donations_athlete_idx ON public.donations USING btree (athlete_id);
CREATE UNIQUE INDEX donations_mp_payment_id_key ON public.donations USING btree (mp_payment_id) WHERE (mp_payment_id IS NOT NULL);
CREATE INDEX legal_acceptances_doc_idx ON public.legal_acceptances USING btree (doc_type, doc_version);
CREATE INDEX legal_acceptances_email_idx ON public.legal_acceptances USING btree (email);
CREATE INDEX legal_acceptances_related_idx ON public.legal_acceptances USING btree (related_id);
CREATE INDEX legal_documents_current_idx ON public.legal_documents USING btree (doc_type) WHERE is_current;
CREATE UNIQUE INDEX team_pledges_mp_payment_id_key ON public.team_pledges USING btree (mp_payment_id) WHERE (mp_payment_id IS NOT NULL);
CREATE INDEX team_pledges_team_idx ON public.team_pledges USING btree (team_id, status);
CREATE INDEX team_updates_feed_idx ON public.team_updates USING btree (team_id, status, created_at DESC);

-- ── Funciones ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.claim_application_mp(p_app_id uuid, p_athlete_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count int := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  INSERT INTO public.athlete_mp_accounts (
    athlete_id, mp_user_id, access_token, refresh_token, public_key,
    token_expires_at, live_mode, connected_at, updated_at
  )
  SELECT p_athlete_id, mp_user_id, access_token, refresh_token, public_key,
         token_expires_at, live_mode, connected_at, now()
  FROM public.application_mp_accounts
  WHERE application_id = p_app_id
  ON CONFLICT (athlete_id) DO UPDATE SET
    mp_user_id = EXCLUDED.mp_user_id,
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    public_key = EXCLUDED.public_key,
    token_expires_at = EXCLUDED.token_expires_at,
    live_mode = EXCLUDED.live_mode,
    updated_at = now();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count > 0 THEN
    UPDATE public.athletes SET mp_connected = true WHERE id = p_athlete_id;
    DELETE FROM public.application_mp_accounts WHERE application_id = p_app_id;
  END IF;

  RETURN v_count > 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select exists(select 1 from public.admins where user_id = auth.uid()) $function$;

CREATE OR REPLACE FUNCTION public.sync_raised_amount()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'completed' THEN
      UPDATE public.athletes
         SET raised_amount = COALESCE(raised_amount, 0) + NEW.amount
       WHERE id = NEW.athlete_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF COALESCE(OLD.status, '') <> 'completed' AND NEW.status = 'completed' THEN
      UPDATE public.athletes
         SET raised_amount = COALESCE(raised_amount, 0) + NEW.amount
       WHERE id = NEW.athlete_id;
    ELSIF OLD.status = 'completed' AND NEW.status <> 'completed' THEN
      UPDATE public.athletes
         SET raised_amount = GREATEST(0, COALESCE(raised_amount, 0) - NEW.amount)
       WHERE id = NEW.athlete_id;
    END IF;
  END IF;
  RETURN NEW;
END $function$;

-- ── Vistas ──────────────────────────────────────────────────────────
create or replace view public.application_mp_status as
 SELECT application_id
   FROM application_mp_accounts
  WHERE is_admin();

create or replace view public.public_athlete_raised as
 SELECT athlete_id,
    sum(
        CASE
            WHEN COALESCE(net_amount, 0::numeric) > 0::numeric THEN net_amount
            ELSE round(amount * 0.93, 2)
        END) AS raised_net,
    count(*) AS donor_count
   FROM donations d
  WHERE status = 'completed'::text
  GROUP BY athlete_id;

create or replace view public.public_supporters as
 SELECT a.slug AS athlete_slug,
    NULLIF(TRIM(BOTH FROM d.donor_name), ''::text) AS donor_name,
        CASE
            WHEN d.amount >= 25000::numeric THEN 'oro'::text
            WHEN d.amount >= 10000::numeric THEN 'plata'::text
            ELSE 'bronce'::text
        END AS tier,
    d.created_at
   FROM donations d
     JOIN athletes a ON a.id = d.athlete_id
  WHERE d.status = 'completed'::text AND a.verified = true;

create or replace view public.public_team_supporters as
 SELECT t.slug AS team_slug,
    NULLIF(TRIM(BOTH FROM p.donor_name), ''::text) AS donor_name,
        CASE
            WHEN p.amount >= 25000::numeric THEN 'oro'::text
            WHEN p.amount >= 10000::numeric THEN 'plata'::text
            ELSE 'bronce'::text
        END AS tier,
    p.paid_at AS created_at
   FROM team_pledges p
     JOIN team_applications t ON t.id = p.team_id
  WHERE p.status = 'completed'::text;

create or replace view public.public_teams as
 SELECT id,
    slug,
    team_name,
    sport,
    competition,
    goal_amount,
    goal_purpose,
    fundraising_start,
    fundraising_end,
    active,
    photo_url,
    photo_secondary_url,
    COALESCE(( SELECT sum(p.amount) AS sum
           FROM team_pledges p
          WHERE p.team_id = t.id AND p.status = 'completed'::text), 0::numeric) AS raised_amount,
    COALESCE(( SELECT count(*) AS count
           FROM team_pledges p
          WHERE p.team_id = t.id AND p.status = 'completed'::text), 0::bigint) AS donor_count
   FROM team_applications t
  WHERE status = 'approved'::text AND slug IS NOT NULL AND mp_connected;

-- ── Policies (RLS) ──────────────────────────────────────────────────
create policy applications_anon_insert on public.athlete_applications for insert to anon,authenticated with check ((status = 'pending'::text));
create policy apps_admin_read on public.athlete_applications for select to authenticated using (is_admin());
create policy apps_admin_update on public.athlete_applications for update to authenticated using (is_admin()) with check (is_admin());
create policy amp_admin_all on public.athlete_mp_accounts for all to public using (is_admin()) with check (is_admin());
create policy amp_athlete_read_own on public.athlete_mp_accounts for select to public using ((athlete_id IN ( SELECT athletes.id
   FROM athletes
  WHERE (athletes.user_id = auth.uid()))));
create policy au_admin_all on public.athlete_updates for all to authenticated using (is_admin()) with check (is_admin());
create policy au_athlete_insert_own on public.athlete_updates for insert to authenticated with check (((athlete_id IN ( SELECT athletes.id
   FROM athletes
  WHERE (athletes.user_id = auth.uid()))) AND (status = 'pending'::text)));
create policy au_athlete_read_own on public.athlete_updates for select to authenticated using ((athlete_id IN ( SELECT athletes.id
   FROM athletes
  WHERE (athletes.user_id = auth.uid()))));
create policy au_public_read_approved on public.athlete_updates for select to anon,authenticated using ((status = 'approved'::text));
create policy athletes_admin_all on public.athletes for all to authenticated using (is_admin()) with check (is_admin());
create policy athletes_public_read on public.athletes for select to public using ((verified = true));
create policy athletes_self_read on public.athletes for select to public using ((user_id = auth.uid()));
create policy donations_admin_read on public.donations for select to authenticated using (is_admin());
create policy donations_athlete_read_own on public.donations for select to authenticated using ((athlete_id IN ( SELECT athletes.id
   FROM athletes
  WHERE (athletes.user_id = auth.uid()))));
create policy ld_public_read on public.legal_documents for select to anon,authenticated using (true);
create policy pcr_admin_all on public.profile_change_requests for all to public using (is_admin()) with check (is_admin());
create policy pcr_athlete_insert_own on public.profile_change_requests for insert to authenticated with check (((athlete_id IN ( SELECT athletes.id
   FROM athletes
  WHERE (athletes.user_id = auth.uid()))) AND (status = 'pending'::text)));
create policy pcr_athlete_read_own on public.profile_change_requests for select to public using ((athlete_id IN ( SELECT athletes.id
   FROM athletes
  WHERE (athletes.user_id = auth.uid()))));
create policy team_apps_admin_select on public.team_applications for select to public using (is_admin());
create policy team_apps_admin_update on public.team_applications for update to public using (is_admin());
create policy team_apps_insert_public on public.team_applications for insert to public with check (true);
create policy tma_admin_all on public.team_mp_accounts for all to authenticated using (is_admin()) with check (is_admin());
create policy tp_admin_all on public.team_pledges for all to authenticated using (is_admin()) with check (is_admin());
create policy tu_admin_all on public.team_updates for all to authenticated using (is_admin()) with check (is_admin());
create policy tu_public_read_approved on public.team_updates for select to anon,authenticated using ((status = 'approved'::text));
create policy teams_admin_all on public.teams for all to authenticated using (is_admin()) with check (is_admin());
create policy teams_public_read on public.teams for select to anon,authenticated using ((verified = true));

-- ── Grants a los roles de la API ─────────────────────────────────────
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admins to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admins to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.application_mp_accounts to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.application_mp_accounts to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.application_mp_status to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.application_mp_status to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.athlete_applications to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.athlete_applications to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.athlete_mp_accounts to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.athlete_mp_accounts to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.athlete_updates to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.athlete_updates to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.athletes to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.athletes to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.donations to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.donations to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.legal_acceptances to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.legal_acceptances to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.legal_documents to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.legal_documents to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.pending_mp_connections to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.pending_mp_connections to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.profile_change_requests to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.profile_change_requests to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_athlete_raised to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_athlete_raised to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_supporters to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_supporters to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_team_supporters to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_team_supporters to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_teams to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.public_teams to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.team_applications to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.team_applications to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.team_mp_accounts to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.team_mp_accounts to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.team_pledges to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.team_pledges to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.team_updates to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.team_updates to authenticated;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.teams to anon;
grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.teams to authenticated;
-- ── Triggers ─────────────────────────────────────────────────────────
-- OJO: este trigger mantenía athletes.raised_amount (en BRUTO) y fue creado
-- desde el panel — el sitio YA NO lee esa columna (usa public_athlete_raised,
-- en neto). Queda documentado; si algún día se borra la columna, borrar
-- también el trigger y la función sync_raised_amount.
create trigger trg_sync_raised_amount
  after insert or update of status on public.donations
  for each row execute function sync_raised_amount();
