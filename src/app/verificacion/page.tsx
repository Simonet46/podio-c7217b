import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";
import { SITE } from "@/config/site";
import { LEGAL_CONTACT } from "@/config/legal";

export const metadata: Metadata = {
  title: `Política de Verificación — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const link = "text-gold underline";

export default function VerificacionPage() {
  return (
    <LegalLayout
      docType="verificacion"
      intro={
        <p>
          Cuando en {SITE.brand} ves que un atleta, equipo o campaña está{" "}
          <strong>“verificado”</strong>, esta política te explica exactamente{" "}
          <strong>qué verificamos y qué no</strong>. La transparencia sobre el alcance de
          la verificación es una obligación que asumimos con donantes y beneficiarios.
        </p>
      }
    >
      <Section n="1" title="Qué significa “verificado” en GRANITO">
        <p>
          El sello de verificado indica que el equipo de {SITE.brand} realizó controles
          razonables sobre la <strong>identidad</strong> de la persona o equipo y sobre
          algunos elementos de su perfil, con el alcance descripto abajo. No es una
          garantía absoluta ni un aval sobre el uso de los fondos o los resultados
          deportivos.
        </p>
      </Section>

      <Section n="2" title="Qué verificamos">
        <ul className="list-disc pl-5">
          <li><strong>Identidad</strong> del atleta o del representante del equipo.</li>
          <li>
            Que la <strong>cuenta de cobro (CBU/CVU) esté a nombre del beneficiario</strong>{" "}
            y su relación con él.
          </li>
          <li>
            Elementos declarados de la <strong>actividad deportiva</strong> (deporte,
            disciplina, club o categoría), en la medida de la documentación disponible.
          </li>
          <li>Revisión manual del contenido de la campaña para detectar señales de fraude o material copiado.</li>
          <li>
            En campañas con causa médica o institucional, la existencia de{" "}
            <strong>documentación de respaldo</strong> cuando se aporta.
          </li>
        </ul>
      </Section>

      <Section n="3" title="Qué NO verificamos">
        <ul className="list-disc pl-5">
          <li>El <strong>uso efectivo</strong> que el beneficiario dé a los fondos.</li>
          <li>Los <strong>resultados deportivos</strong> ni promesas de rendimiento.</li>
          <li>El cumplimiento, por parte del atleta, de sus obligaciones ante federaciones, clubes o contratos (eso lo declara y garantiza el propio atleta).</li>
          <li>La veracidad de cada afirmación subjetiva de la historia personal.</li>
        </ul>
      </Section>

      <Section n="4" title="Controles y medidas ante señales de incumplimiento">
        <p>
          Aplicamos controles mínimos: validación de identidad y de la cuenta de cobro,
          revisión de campañas, canal de denuncias, revisión reforzada de campañas de alto
          monto, y suspensión preventiva ante señales de fraude o incumplimiento, conforme
          la <Link href="/legal/campanas" className={link}>Política de Campañas</Link>.
          Conservamos prueba de los controles realizados.
        </p>
      </Section>

      <Section n="5" title="Cómo reportar un problema">
        <p>
          Si detectás una campaña sospechosa o un uso indebido del sello, escribinos a{" "}
          <strong>{LEGAL_CONTACT.denuncias}</strong> o usá el procedimiento de la{" "}
          <Link href="/legal/propiedad-intelectual" className={link}>Política de Denuncias</Link>.
        </p>
      </Section>
    </LegalLayout>
  );
}
