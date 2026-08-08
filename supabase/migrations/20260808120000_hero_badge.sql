-- Píldora del hero editable por atleta.
-- Es el cartelito que flota sobre la card grande del desfile de la home.
-- Hasta ahora decía "Historia real, revisada a mano" en todos; ahora el admin
-- puede escribir uno propio por atleta. Vacío o null = sigue la frase por
-- defecto, que es un sello de confianza de la plataforma.
-- Aditiva e idempotente: segura de correr sobre producción.

alter table public.athletes add column if not exists hero_badge text;
