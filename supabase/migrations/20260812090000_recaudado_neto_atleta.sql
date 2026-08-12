-- Recaudado por atleta calculado desde `donations`, en NETO (lo que le queda
-- después del 7% de la plataforma).
--
-- Por qué: `athletes.raised_amount` es una columna que nadie actualiza. La RPC
-- `increment_raised` que debía hacerlo está en schema.sql pero no existe en la
-- base, y el webhook de Mercado Pago inserta la donación sin tocar esa columna.
-- Es decir: los montos que se ven en la web sólo coinciden con la realidad
-- mientras alguien los mantenga a mano. Esta vista los deriva de la única
-- fuente de verdad, las donaciones acreditadas.
--
-- No expone detalle de donaciones (ni montos individuales, ni emails): sólo el
-- agregado por atleta, que ya es público en su perfil.
-- Aditiva e idempotente: segura de correr sobre producción.

create or replace view public.public_athlete_raised as
  select
    d.athlete_id,
    -- net_amount lo escribe el webhook (amount - 7%). El fallback cubre filas
    -- viejas o cargadas a mano sin neto: preferimos estimarlo antes que
    -- mostrarle de menos al atleta. Si cambia la comisión, mirar también
    -- PLATFORM_FEE_RATE en src/config/site.ts y en las edge functions.
    sum(
      case when coalesce(d.net_amount, 0) > 0
           then d.net_amount
           else round(d.amount * 0.93, 2)
      end
    ) as raised_net,
    count(*) as donor_count
  from public.donations d
  where d.status = 'completed'
  group by d.athlete_id;

grant select on public.public_athlete_raised to anon, authenticated;
