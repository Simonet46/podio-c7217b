-- Limpieza one-shot: espacios sobrantes en nombres y emails.
-- Casi todas las postulaciones reales venían con espacio al final
-- ("Pedro Martinez ", "Sofia Cairó "): el teclado del celular lo agrega al
-- autocompletar. Se ve mal en la web y obliga a defender con trim() cada
-- comparación por nombre. Los forms ya limpian al enviar (13/08); esto
-- arregla lo que ya estaba adentro. No toca slugs (son la identidad).
-- Idempotente: correrla dos veces no cambia nada.

update public.athletes set
  full_name  = btrim(regexp_replace(full_name,  '\s+', ' ', 'g')),
  first_name = btrim(regexp_replace(first_name, '\s+', ' ', 'g')),
  email      = btrim(email);

update public.athlete_applications set
  full_name = btrim(regexp_replace(full_name, '\s+', ' ', 'g')),
  email     = btrim(email);

update public.team_applications set
  team_name    = btrim(regexp_replace(team_name, '\s+', ' ', 'g')),
  contact_name = btrim(regexp_replace(coalesce(contact_name, ''), '\s+', ' ', 'g')),
  email        = btrim(email);
-- contact_name vacío queda '' en vez de null tras el coalesce: lo devolvemos.
update public.team_applications set contact_name = null where contact_name = '';
