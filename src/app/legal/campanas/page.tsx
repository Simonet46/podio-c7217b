import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";
import { SITE } from "@/config/site";
import { LEGAL_CONTACT } from "@/config/legal";

export const metadata: Metadata = {
  title: `Política de Campañas — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const link = "text-gold underline";

export default function CampanasPage() {
  return (
    <LegalLayout
      docType="campanas"
      intro={
        <p>
          Esta política define qué campañas se permiten en {SITE.brand}, cuáles están
          prohibidas y cómo actuamos ante incumplimientos, fraude o denuncias.
        </p>
      }
    >
      <Section n="1" title="Campañas permitidas">
        <p>
          Se permiten campañas de atletas y equipos argentinos que buscan apoyo para su
          desarrollo deportivo (entrenamiento, competencias, viajes, equipamiento,
          recuperación de lesiones, gastos asociados a su actividad), con contenido veraz y
          propio.
        </p>
      </Section>

      <Section n="2" title="Campañas prohibidas">
        <p>No se permiten campañas que:</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Contengan información <strong>falsa, engañosa o suplantación de identidad</strong>.</li>
          <li>Sean <strong>ilícitas</strong> o infrinjan la ley, los reglamentos de una federación o contratos del beneficiario.</li>
          <li>Sean <strong>discriminatorias</strong>, ofensivas o inciten a la violencia.</li>
          <li>Promuevan apuestas, manipulación deportiva, dopaje o cualquier práctica contraria a la integridad deportiva.</li>
          <li>Usen imágenes, marcas o contenido de terceros sin autorización.</li>
          <li>Tengan fines ajenos al desarrollo deportivo declarado.</li>
        </ul>
      </Section>

      <Section n="3" title="Controles y revisión reforzada">
        <p>
          Verificamos identidad y cuenta de cobro, revisamos el contenido de las campañas y
          aplicamos <strong>revisión reforzada a las campañas de alto monto</strong>. El
          alcance de la verificación está en la{" "}
          <Link href="/verificacion" className={link}>Política de Verificación</Link>.
        </p>
      </Section>

      <Section n="4" title="Integridad deportiva">
        <p>
          El beneficiario se obliga a respetar las normas de <strong>antidopaje,
          integridad y no manipulación deportiva</strong>, y a no participar en apuestas
          sobre competencias en las que interviene. El incumplimiento habilita la
          suspensión y baja de la campaña.
        </p>
      </Section>

      <Section n="5" title="Suspensión, cierre y conservación de prueba">
        <p>
          Ante señales de incumplimiento, fraude o una denuncia fundada, podemos{" "}
          <strong>suspender preventivamente</strong> la cuenta o campaña, solicitar
          información, y —de confirmarse— <strong>cerrarla</strong>. Conservamos prueba de
          las medidas adoptadas y cooperamos con las autoridades cuando corresponda.
        </p>
      </Section>

      <Section n="6" title="Denuncias">
        <p>
          Para reportar una campaña, escribinos a <strong>{LEGAL_CONTACT.denuncias}</strong>{" "}
          o seguí el procedimiento de la{" "}
          <Link href="/legal/propiedad-intelectual" className={link}>Política de Denuncias</Link>.
        </p>
      </Section>
    </LegalLayout>
  );
}
