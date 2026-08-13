-- Reconciliación diaria contra Mercado Pago (red de seguridad del webhook).
-- Contexto: el 04/08/2026 el webhook estuvo 9 días rebotando notificaciones
-- (verify_jwt mal) y se perdieron donaciones reales. La edge function
-- mp-reconcile compara MP contra donations/team_pledges y reinyecta lo que
-- falte; este cron la corre todos los días a las 12:00 UTC (09:00 AR).
--
-- APLICADA el 13/08/2026 vía Management API. Idempotente.
-- REQUISITO MANUAL (no va en el repo): el service_role tiene que existir en
-- Vault con nombre 'service_role_key':
--   select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- cron.schedule con el mismo jobname actualiza el job si ya existe.
select cron.schedule(
  'mp-reconcile-diario',
  '0 12 * * *',
  $cron$
  select net.http_post(
    url := 'https://ruugpxfgpbtajrxbabvg.supabase.co/functions/v1/mp-reconcile',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  )
  $cron$
);
