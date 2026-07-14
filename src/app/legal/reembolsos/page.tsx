import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";
import { SITE } from "@/config/site";
import { LEGAL_CONTACT } from "@/config/legal";

export const metadata: Metadata = {
  title: `Reembolsos y Baja de Cuenta — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const link = "text-gold underline";

export default function ReembolsosPage() {
  return (
    <LegalLayout
      docType="reembolsos"
      intro={
        <p>
          Esta política explica cuándo procede un reembolso y cómo el atleta puede dar de
          baja su cuenta y sus datos en {SITE.brand}.
        </p>
      }
    >
      <Section n="1" title="Reembolsos de aportes">
        <p>
          Los aportes se acreditan de forma <strong>directa e inmediata</strong> en la
          cuenta del beneficiario; {SITE.brand} no custodia los fondos. Por eso, en
          principio los aportes <strong>no son reembolsables</strong>. Un reembolso puede
          proceder únicamente en casos de:
        </p>
        <ul className="mt-1 list-disc pl-5">
          <li><strong>Error comprobado</strong> en la operación (por ejemplo, un cobro duplicado).</li>
          <li><strong>Fraude</strong> confirmado en la campaña.</li>
          <li>Los supuestos que exija la <strong>legislación aplicable</strong>.</li>
        </ul>
        <p className="mt-2">
          En esos casos, la devolución se gestiona a través del procesador de pagos y puede
          estar sujeta a sus tiempos y condiciones. Escribinos a{" "}
          <strong>{LEGAL_CONTACT.reclamos}</strong> para iniciar el trámite.
        </p>
      </Section>

      <Section n="2" title="Baja de cuenta del atleta (derecho de arrepentimiento y supresión)">
        <p>
          El atleta puede <strong>dar de baja su cuenta en cualquier momento</strong>, sin
          expresar causa, y solicitar la <strong>supresión de sus datos personales</strong>{" "}
          conforme la Ley 25.326. Al hacerlo:
        </p>
        <ul className="mt-1 list-disc pl-5">
          <li>Se despublica su perfil y sus campañas activas.</li>
          <li>Se eliminan o anonimizan sus datos personales, salvo aquellos que debamos conservar por obligaciones legales (por ejemplo, respaldo de operaciones y de aceptaciones).</li>
        </ul>
        <p className="mt-2">
          Para solicitar la baja, escribí a <strong>{LEGAL_CONTACT.privacidad}</strong>{" "}
          desde el email de tu cuenta, o usá la opción de baja en tu perfil cuando esté
          disponible. Los aportes ya acreditados a la fecha de la baja no se ven afectados.
        </p>
      </Section>

      <Section n="3" title="Baja por parte de la plataforma">
        <p>
          {SITE.brand} puede dar de baja o suspender perfiles y campañas que incumplan los{" "}
          <Link href="/terminos" className={link}>Términos</Link>, la{" "}
          <Link href="/legal/campanas" className={link}>Política de Campañas</Link> o el{" "}
          <Link href="/legal/contrato-atleta" className={link}>Contrato del Atleta</Link>.
        </p>
      </Section>

      <Section n="4" title="Reclamos">
        <p>
          Ante cualquier duda sobre reembolsos o baja, escribinos a{" "}
          <strong>{LEGAL_CONTACT.reclamos}</strong>.
        </p>
      </Section>
    </LegalLayout>
  );
}
