/**
 * Configuración legal central de GRANITO.
 *
 * TODO lo legal-societario vive SÓLO acá: datos de la sociedad, contactos y el
 * registro de versiones de los documentos legales. El footer, /terminos,
 * /privacidad y los formularios leen de este archivo para no desincronizarse.
 *
 * Cuando exista la sociedad (ver docs/legal/plan-legal-ux.md, Fase 0):
 *   1. Completá el objeto `COMPANY` con los datos reales.
 *   2. Poné `LEGAL_DATA_COMPLETE = true`.
 *   3. Al hacerlo desaparecen los banners "Borrador" de las páginas legales.
 */

/** ¿Están cargados los datos reales de la sociedad?
 *  Mientras sea `false`, las páginas legales muestran el banner de borrador y
 *  el footer marca los datos pendientes. */
export const LEGAL_DATA_COMPLETE = false;

/** Datos de la sociedad operadora (identificación del operador — Ley 24.240).
 *  Placeholders `[PENDIENTE: …]` hasta que se constituya la sociedad. */
export const COMPANY = {
  /** Razón social de la sociedad argentina operadora. */
  razonSocial: "[PENDIENTE: razón social]",
  /** CUIT de la sociedad. */
  cuit: "[PENDIENTE: CUIT]",
  /** Domicilio legal. */
  domicilio: "[PENDIENTE: domicilio legal]",
  /** Ciudad del domicilio (para jurisdicción). */
  ciudad: "[PENDIENTE: ciudad]",
  /** Jurisdicción de los tribunales competentes. */
  jurisdiccion: "[PENDIENTE: jurisdicción, p. ej. Ciudad Autónoma de Buenos Aires]",
  /** Datos de inscripción en la IGJ (o registro público que corresponda). */
  igj: "[PENDIENTE: inscripción IGJ]",
} as const;

/** Correos de contacto. Todos ruteados vía Cloudflare Email Routing.
 *  `hola@` es el buzón real; cambiá si se crean alias dedicados. */
export const LEGAL_CONTACT = {
  general: "hola@somosgranito.com",
  /** Reclamos y atención al consumidor (Ley 24.240). */
  reclamos: "hola@somosgranito.com",
  /** Ejercicio de derechos de datos personales (Ley 25.326 / AAIP). */
  privacidad: "hola@somosgranito.com",
  /** Denuncias de campañas, PI o suplantación. */
  denuncias: "hola@somosgranito.com",
} as const;

// ── Registro de documentos legales ────────────────────────────────────────
// Cada documento tiene una versión (fecha ISO). Los formularios y páginas usan
// `legalDoc(tipo).version` para registrar QUÉ versión aceptó el usuario. Al
// publicar un texto nuevo, subí la versión acá y quedará registrado en la
// evidencia de aceptación (tabla legal_acceptances).

export type LegalDocType =
  | "terminos-generales"
  | "contrato-beneficiario"
  | "terminos-donante"
  | "privacidad"
  | "cookies"
  | "verificacion"
  | "campanas"
  | "reembolsos"
  | "propiedad-intelectual";

export type LegalDocStatus = "vigente" | "borrador";

export interface LegalDoc {
  /** Título humano del documento. */
  title: string;
  /** Versión = fecha ISO de la última publicación (YYYY-MM-DD). */
  version: string;
  /** Fecha en texto para mostrar ("14 de julio de 2026"). */
  effectiveDate: string;
  /** `vigente` = ya publicado y con texto real; `borrador` = pendiente Kahale. */
  status: LegalDocStatus;
  /** Ruta pública si el documento tiene su propia página. */
  path?: string;
}

/**
 * Todos los documentos son borradores originales (redactados por el equipo,
 * pendientes de revisión de Kahale). El `status: "borrador"` mantiene el banner
 * de aviso hasta que la abogada apruebe cada texto; al aprobar, cambiá a
 * "vigente" y actualizá `LEGAL_DATA_COMPLETE` cuando existan los datos de la
 * sociedad. Al publicar una versión nueva de un texto, subí `version` y
 * `effectiveDate` y agregá la fila correspondiente en la tabla legal_documents.
 */
export const LEGAL_DOCS: Record<LegalDocType, LegalDoc> = {
  "terminos-generales": {
    title: "Términos y Condiciones",
    version: "2026-07-14",
    effectiveDate: "14 de julio de 2026",
    status: "borrador",
    path: "/terminos",
  },
  privacidad: {
    title: "Política de Privacidad",
    version: "2026-07-14",
    effectiveDate: "14 de julio de 2026",
    status: "borrador",
    path: "/privacidad",
  },
  "contrato-beneficiario": {
    title: "Contrato del Atleta",
    version: "2026-07-14",
    effectiveDate: "14 de julio de 2026",
    status: "borrador",
    path: "/legal/contrato-atleta",
  },
  "terminos-donante": {
    title: "Términos del Donante",
    version: "2026-07-14",
    effectiveDate: "14 de julio de 2026",
    status: "borrador",
    path: "/legal/donantes",
  },
  cookies: {
    title: "Política de Cookies",
    version: "2026-07-14",
    effectiveDate: "14 de julio de 2026",
    status: "borrador",
    path: "/legal/cookies",
  },
  verificacion: {
    title: "Política de Verificación",
    version: "2026-07-14",
    effectiveDate: "14 de julio de 2026",
    status: "borrador",
    path: "/verificacion",
  },
  campanas: {
    title: "Política de Campañas",
    version: "2026-07-14",
    effectiveDate: "14 de julio de 2026",
    status: "borrador",
    path: "/legal/campanas",
  },
  reembolsos: {
    title: "Reembolsos y Baja de Cuenta",
    version: "2026-07-14",
    effectiveDate: "14 de julio de 2026",
    status: "borrador",
    path: "/legal/reembolsos",
  },
  "propiedad-intelectual": {
    title: "Propiedad Intelectual y Denuncias",
    version: "2026-07-14",
    effectiveDate: "14 de julio de 2026",
    status: "borrador",
    path: "/legal/propiedad-intelectual",
  },
};

/** Documentos que tienen página pública, en orden para el índice /legal. */
export const LEGAL_INDEX: LegalDocType[] = [
  "terminos-generales",
  "privacidad",
  "contrato-beneficiario",
  "terminos-donante",
  "verificacion",
  "campanas",
  "reembolsos",
  "propiedad-intelectual",
  "cookies",
];

/** Devuelve los metadatos de un documento legal. */
export function legalDoc(type: LegalDocType): LegalDoc {
  return LEGAL_DOCS[type];
}
