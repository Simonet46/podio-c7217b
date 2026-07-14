import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";
import { SITE, PLATFORM_FEE_RATE } from "@/config/site";
import { LEGAL_CONTACT } from "@/config/legal";

export const metadata: Metadata = {
  title: `Términos del Donante — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const FEE = Math.round(PLATFORM_FEE_RATE * 100);
const NET = 100 - FEE;
const link = "text-gold underline";

export default function DonantesPage() {
  return (
    <LegalLayout
      docType="terminos-donante"
      intro={
        <p>
          Estos términos regulan la relación con las personas que realizan aportes
          (“donantes”) a través de {SITE.brand}. Se aceptan al momento de confirmar un
          aporte y complementan los{" "}
          <Link href="/terminos" className={link}>Términos y Condiciones</Link> generales.
        </p>
      }
    >
      <Section n="1" title="Naturaleza del aporte: es una donación, no una inversión">
        <p>
          Al aportar declarás que tu contribución es una <strong>donación voluntaria y sin
          contraprestación económica</strong>. <strong>No es una inversión</strong>, no
          genera participación, interés, rendimiento ni derecho alguno sobre los
          resultados deportivos o económicos del beneficiario. Los reconocimientos
          simbólicos (por ejemplo, un diploma digital de agradecimiento) no constituyen
          una contraprestación económica ni alteran la naturaleza gratuita de la donación.
        </p>
      </Section>

      <Section n="2" title="A quién va tu aporte y rol de la plataforma">
        <p>
          Tu aporte se destina al <strong>atleta o equipo</strong> que elegís. {SITE.brand}{" "}
          actúa como intermediario tecnológico: <strong>no custodia los fondos</strong>,
          que se acreditan de forma directa e inmediata en la cuenta del beneficiario a
          través de un proveedor de pagos autorizado (por ejemplo, Mercado Pago).
        </p>
      </Section>

      <Section n="3" title="Comisión y transparencia">
        <p>
          Antes de confirmar tu aporte verás el detalle: del monto, {SITE.brand} percibe
          una comisión del <strong>{FEE}%</strong> por su servicio y el{" "}
          <strong>{NET}%</strong> restante se destina al beneficiario. El procesador de
          pagos puede aplicar sus propios costos, informados en su plataforma.
        </p>
      </Section>

      <Section n="4" title="Identidad del beneficiario y verificación">
        <p>
          Confirmás que aportás al beneficiario que identificaste. {SITE.brand} verifica
          identidad y elementos de los perfiles con el alcance descripto en la{" "}
          <Link href="/verificacion" className={link}>Política de Verificación</Link>, pero{" "}
          <strong>no garantiza</strong> el uso efectivo de los fondos ni los resultados
          deportivos.
        </p>
      </Section>

      <Section n="5" title="Qué pasa si la campaña tiene un objetivo">
        <p>
          Algunas campañas muestran una meta de recaudación. Salvo que se indique lo
          contrario, los aportes se acreditan al beneficiario <strong>aunque la meta no se
          alcance</strong>. La meta es de referencia y no condiciona la acreditación del
          aporte.
        </p>
      </Section>

      <Section n="6" title="Reembolsos">
        <p>
          Como los aportes se acreditan de forma directa e inmediata al beneficiario, en
          principio <strong>no son reembolsables</strong>, salvo error comprobado, fraude o
          los supuestos previstos en la{" "}
          <Link href="/legal/reembolsos" className={link}>Política de Reembolsos</Link> o
          exigidos por la ley. Ante cualquier problema, escribinos a{" "}
          <strong>{LEGAL_CONTACT.reclamos}</strong>.
        </p>
      </Section>

      <Section n="7" title="Reclamos y datos personales">
        <p>
          Podés canalizar reclamos en <strong>{LEGAL_CONTACT.reclamos}</strong>. El
          tratamiento de tus datos (por ejemplo, email y datos de la operación) se rige por
          la <Link href="/privacidad" className={link}>Política de Privacidad</Link>.
        </p>
      </Section>

      <Section n="8" title="Aportes recurrentes">
        <p>
          Si en el futuro se habilitan aportes recurrentes, se informarán sus condiciones
          particulares (importe, periodicidad y forma de cancelarlos) antes de activarlos.
        </p>
      </Section>
    </LegalLayout>
  );
}
