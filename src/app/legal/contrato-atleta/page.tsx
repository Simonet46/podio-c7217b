import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";
import { SITE, PLATFORM_FEE_RATE } from "@/config/site";
import { COMPANY, LEGAL_CONTACT } from "@/config/legal";

export const metadata: Metadata = {
  title: `Contrato del Atleta — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const FEE = Math.round(PLATFORM_FEE_RATE * 100);
const NET = 100 - FEE;
const link = "text-gold underline";

export default function ContratoAtletaPage() {
  return (
    <LegalLayout
      docType="contrato-beneficiario"
      intro={
        <p>
          Este contrato regula la relación entre {SITE.brand} y el <strong>atleta o
          equipo beneficiario</strong> que publica un perfil y una campaña para recibir
          aportes. Complementa los{" "}
          <Link href="/terminos" className={link}>Términos y Condiciones</Link> generales
          y se acepta al momento de postularse y de activar el perfil.
        </p>
      }
    >
      <Section n="1" title="Partes y objeto">
        <p>
          Por un lado, <strong>{COMPANY.razonSocial}</strong>, CUIT{" "}
          <strong>{COMPANY.cuit}</strong>, operadora de {SITE.brand} (“la plataforma”).
          Por el otro, la persona atleta o quien representa al equipo (“el beneficiario”).
          El objeto es la prestación, por parte de la plataforma, de un servicio de
          intermediación tecnológica y difusión para que el beneficiario reciba aportes
          con naturaleza de donación.
        </p>
      </Section>

      <Section n="2" title="Elegibilidad del beneficiario">
        <p>El beneficiario declara que:</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Es <strong>mayor de 18 años</strong> (o, en el caso de equipos, que quien lo representa lo es y está autorizado).</li>
          <li>Es atleta argentino/a o desarrolla una actividad deportiva en Argentina.</li>
          <li>
            Indica su nivel deportivo (aficionado, federado, profesional o de alto
            rendimiento) y, si corresponde, su club y federación.
          </li>
          <li>La información y el contenido que aporta son veraces y propios.</li>
        </ul>
      </Section>

      <Section n="3" title="Documentación y verificación">
        <p>
          El beneficiario se compromete a aportar la documentación que la plataforma
          razonablemente solicite para verificar su identidad, su actividad deportiva y la
          titularidad de su cuenta de cobro. El alcance de la verificación se describe en
          la <Link href="/verificacion" className={link}>Política de Verificación</Link>.
        </p>
      </Section>

      <Section n="4" title="Contenido y destino declarado de los fondos">
        <p>
          El beneficiario define el contenido de su campaña y, si establece un objetivo,
          el <strong>destino declarado de los fondos</strong>. Se compromete a usar los
          aportes recibidos para ese destino y a no destinarlos a fines ilícitos o
          incompatibles con sus obligaciones deportivas.
        </p>
      </Section>

      <Section n="5" title="Compatibilidad federativa y con contratos vigentes">
        <p>
          El beneficiario <strong>declara y garantiza</strong> que su participación en{" "}
          {SITE.brand} y cualquier campaña son <strong>compatibles</strong> con los
          estatutos y reglamentos de su federación nacional e internacional, con las reglas
          de su club, con sus condiciones de inscripción y elegibilidad, y con los
          contratos vigentes de patrocinio, representación o beca (incluidos apoyos
          públicos como el ENARD). El beneficiario es el único responsable de verificar y
          cumplir esas obligaciones (por ejemplo, límites a publicidad, patrocinadores
          incompatibles, uso de marcas, indumentaria o imágenes de competencia).
        </p>
      </Section>

      <Section n="6" title="Cuenta de cobro">
        <p>
          El beneficiario mantendrá una <strong>cuenta de cobro (CBU/CVU) a su nombre y de
          su titularidad exclusiva</strong>, vinculada a los aportes recibidos a través de{" "}
          {SITE.brand}, y se obliga a informar a la plataforma cualquier modificación de
          forma previa a efectuarla.
        </p>
      </Section>

      <Section n="7" title="Comisión y desembolso">
        <p>
          Por su servicio, la plataforma percibe una comisión del <strong>{FEE}%</strong>{" "}
          sobre cada aporte; el <strong>{NET}%</strong> restante se acredita al
          beneficiario (o se reparte en partes iguales entre los integrantes del equipo).
          Los fondos se acreditan de forma <strong>directa e inmediata</strong> a través
          del proveedor de pagos; la plataforma no los custodia.
        </p>
      </Section>

      <Section n="8" title="Suspensión y situaciones especiales">
        <p>
          La plataforma podrá suspender preventivamente un perfil o campaña ante señales de
          incumplimiento, fraude o denuncia, conforme la{" "}
          <Link href="/legal/campanas" className={link}>Política de Campañas</Link>. Ante
          situaciones como fraude, lesión, incapacidad, fallecimiento o imposibilidad
          sobreviniente de llevar adelante una campaña, la plataforma podrá suspender la
          campaña y adoptará medidas razonables respecto de los aportes pendientes.
        </p>
      </Section>

      <Section n="9" title="Rendición de cuentas">
        <p>
          Cuando la campaña declare un objetivo o destino específico, el beneficiario podrá
          ser requerido para informar razonablemente el uso de los fondos. {SITE.brand} no
          verifica el uso efectivo de los fondos salvo que expresamente indique lo contrario
          (ver Política de Verificación).
        </p>
      </Section>

      <Section n="10" title="Licencia de contenido e imagen">
        <p>
          El beneficiario otorga a {SITE.brand} una licencia gratuita, no exclusiva y
          limitada sobre el contenido que publica, en los términos de la{" "}
          <Link href="/legal/propiedad-intelectual" className={link}>Política de Propiedad
          Intelectual</Link>, y declara contar con los derechos y autorizaciones necesarios.
        </p>
      </Section>

      <Section n="11" title="Responsabilidad e indemnidad">
        <p>
          El beneficiario es responsable por la veracidad de la información y del contenido,
          por el cumplimiento de sus obligaciones deportivas y por el uso de los fondos.
          Mantendrá <strong>indemne</strong> a {SITE.brand} frente a reclamos de terceros
          derivados de información falsa, incumplimientos o uso indebido de su parte.
        </p>
      </Section>

      <Section n="12" title="Baja y vigencia">
        <p>
          El beneficiario puede solicitar la baja de su perfil en cualquier momento,
          conforme la <Link href="/legal/reembolsos" className={link}>Política de Reembolsos
          y Baja</Link>. La plataforma puede dar de baja perfiles que incumplan este
          contrato o los Términos.
        </p>
      </Section>

      <Section n="13" title="Contacto">
        <p>Consultas sobre este contrato: <strong>{LEGAL_CONTACT.general}</strong>.</p>
      </Section>
    </LegalLayout>
  );
}
