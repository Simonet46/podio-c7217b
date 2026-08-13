-- Campos de perfil deportivo y declaraciones legales del atleta (Fase 3 del plan
-- de Kahale). Ver docs/legal/plan-legal-ux.md.
--
-- Kahale secc. 1.B y 2.b: definir el perfil del beneficiario (nivel, club) y que
-- el atleta declare compatibilidad federativa, apoyos públicos (ENARD),
-- patrocinios vigentes y titularidad de su cuenta de cobro.
--
-- Aplicada el 14/7/2026 vía Management API.

ALTER TABLE public.athlete_applications
  ADD COLUMN IF NOT EXISTS sport_level              text,     -- aficionado | federado | profesional | alto-rendimiento
  ADD COLUMN IF NOT EXISTS club                     text,
  ADD COLUMN IF NOT EXISTS has_public_grant         boolean DEFAULT false,  -- beca ENARD u otro apoyo público
  ADD COLUMN IF NOT EXISTS has_sponsorship          boolean DEFAULT false,  -- contratos de patrocinio/representación
  ADD COLUMN IF NOT EXISTS federative_compat_declared boolean DEFAULT false, -- declaró compatibilidad federativa
  ADD COLUMN IF NOT EXISTS mp_ownership_declared    boolean DEFAULT false;  -- declaró titularidad de la cuenta de cobro
