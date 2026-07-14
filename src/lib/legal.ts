/**
 * Helper cliente para registrar la evidencia de aceptación de documentos legales.
 * Llama a la edge function `record-acceptance`, que captura IP y user-agent del
 * lado del servidor. Ver docs/legal/plan-legal-ux.md (Fase 1).
 *
 * Es "best-effort": si falla (sin config, red caída), NO rompe el flujo del
 * usuario — la aceptación local ya quedó guardada en la propia postulación/pago.
 * Devuelve `true` si se registró la evidencia extendida.
 */
import { legalDoc, type LegalDocType } from "@/config/legal";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type LegalActorType = "atleta" | "donante" | "equipo";
export type LegalContext = "postulacion" | "alta" | "donacion" | "actualizacion";

export interface RecordAcceptanceInput {
  actorType: LegalActorType;
  context: LegalContext;
  /** Documentos aceptados en este acto (por tipo; la versión se resuelve del config). */
  docTypes: LegalDocType[];
  email?: string | null;
  userId?: string | null;
  /** id de la postulación / external_reference del pago / id del equipo. */
  relatedId?: string | null;
  /** Extra: monto, campaña, prefijo, etc. */
  meta?: Record<string, unknown>;
}

/** Registra la aceptación con evidencia técnica. No lanza; devuelve éxito. */
export async function recordAcceptance(input: RecordAcceptanceInput): Promise<boolean> {
  if (!url || !anonKey) return false;
  try {
    const documents = input.docTypes.map((t) => ({
      doc_type: t,
      doc_version: legalDoc(t).version,
    }));
    const res = await fetch(`${url}/functions/v1/record-acceptance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        actor_type: input.actorType,
        context: input.context,
        documents,
        email: input.email ?? null,
        user_id: input.userId ?? null,
        related_id: input.relatedId ?? null,
        meta: input.meta ?? {},
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
