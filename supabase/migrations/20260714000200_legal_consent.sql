-- Infraestructura de consentimiento legal (Fase 1 del plan de Kahale).
-- Ver docs/legal/plan-legal-ux.md.
--
-- El análisis de Kahale (secc. 10, "Firma electrónica, evidencia y conservación")
-- exige conservar evidencia técnica de cada aceptación: versión del documento,
-- fecha/hora, usuario, IP, dispositivo, campaña. Estas dos tablas cubren eso.
--
-- Aplicada el 14/7/2026 vía Management API.

-- ── Catálogo de documentos legales y sus versiones ─────────────────────────
-- Cada publicación de un texto nuevo = una fila. Es de lectura pública para que
-- el sitio muestre "Versión X — vigente desde …".
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type       text NOT NULL,            -- terminos-generales, privacidad, contrato-beneficiario, …
  version        text NOT NULL,            -- fecha ISO de publicación (YYYY-MM-DD)
  title          text NOT NULL,
  effective_date date,
  content_hash   text,                     -- hash del texto publicado (opcional)
  path           text,                     -- ruta pública si tiene página
  is_current     boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doc_type, version)
);

COMMENT ON TABLE public.legal_documents IS
  'Catálogo de documentos legales y sus versiones. Lectura pública; escritura solo service_role.';

CREATE INDEX IF NOT EXISTS legal_documents_current_idx
  ON public.legal_documents (doc_type) WHERE is_current;

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ld_public_read ON public.legal_documents;
CREATE POLICY ld_public_read ON public.legal_documents
  FOR SELECT TO anon, authenticated
  USING (true);
-- Sin políticas de INSERT/UPDATE/DELETE para anon: solo el service_role escribe.

-- ── Evidencia de aceptaciones ──────────────────────────────────────────────
-- Contiene datos personales (email, IP, user-agent) → NO es legible públicamente.
-- RLS habilitado SIN políticas para anon/authenticated = denegado. Solo el
-- service_role (edge function record-acceptance) inserta y lee.
CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type    text NOT NULL,               -- qué documento se aceptó
  doc_version text NOT NULL,               -- qué versión
  actor_type  text NOT NULL,               -- atleta | donante | equipo
  context     text NOT NULL,               -- postulacion | alta | donacion | actualizacion
  email       text,                        -- email del que aceptó (si se conoce)
  user_id     uuid,                        -- usuario logueado (si aplica)
  related_id  text,                        -- application id / external_reference del pago / team id
  ip          text,                        -- IP de origen (x-forwarded-for)
  user_agent  text,                        -- navegador/dispositivo
  meta        jsonb NOT NULL DEFAULT '{}'::jsonb,  -- extra: monto, campaña, prefijo, etc.
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.legal_acceptances IS
  'Evidencia de aceptación de documentos legales (Kahale secc. 10). Contiene PII: solo service_role.';

CREATE INDEX IF NOT EXISTS legal_acceptances_related_idx
  ON public.legal_acceptances (related_id);
CREATE INDEX IF NOT EXISTS legal_acceptances_email_idx
  ON public.legal_acceptances (email);
CREATE INDEX IF NOT EXISTS legal_acceptances_doc_idx
  ON public.legal_acceptances (doc_type, doc_version);

ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;
-- Sin políticas: anon/authenticated no pueden leer ni escribir. El registro se
-- hace exclusivamente desde la edge function record-acceptance (service_role),
-- para poder capturar la IP y el user-agent del request de forma confiable.

-- ── Seed de los documentos vigentes ────────────────────────────────────────
INSERT INTO public.legal_documents (doc_type, version, title, effective_date, path, is_current)
VALUES
  ('terminos-generales', '2026-06-28', 'Términos y Condiciones', '2026-06-28', '/terminos', true),
  ('privacidad',         '2026-06-28', 'Política de Privacidad',  '2026-06-28', '/privacidad', true)
ON CONFLICT (doc_type, version) DO NOTHING;
