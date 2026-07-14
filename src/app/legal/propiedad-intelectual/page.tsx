import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";
import { SITE } from "@/config/site";
import { LEGAL_CONTACT } from "@/config/legal";

export const metadata: Metadata = {
  title: `Propiedad Intelectual y Denuncias — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const link = "text-gold underline";

export default function PropiedadIntelectualPage() {
  return (
    <LegalLayout
      docType="propiedad-intelectual"
      intro={
        <p>
          Esta política regula los derechos sobre el contenido que se publica en{" "}
          {SITE.brand} y el procedimiento para denunciar y retirar contenido que infrinja
          derechos de terceros.
        </p>
      }
    >
      <Section n="1" title="Contenido del beneficiario y garantía de derechos">
        <p>
          El beneficiario puede publicar fotografías, videos, marcas, historias personales,
          música, documentos u otro material. Al hacerlo, <strong>declara y garantiza que
          cuenta con los derechos o autorizaciones suficientes</strong> sobre ese contenido
          y sobre la imagen de las personas que aparecen en él.
        </p>
      </Section>

      <Section n="2" title="Licencia a favor de la plataforma">
        <p>
          El beneficiario otorga a {SITE.brand} una licencia <strong>gratuita, no
          exclusiva y limitada</strong> para <strong>alojar, reproducir, adaptar
          técnicamente, distribuir y promocionar</strong> la campaña, en el sitio y en los
          canales de comunicación de la plataforma. La titularidad del contenido permanece
          en el beneficiario, quien puede solicitar su retiro.
        </p>
      </Section>

      <Section n="3" title="Marca y software de GRANITO">
        <p>
          La marca {SITE.brand}, su diseño y el software del sitio pertenecen a{" "}
          {SITE.brand} y no pueden usarse sin autorización.
        </p>
      </Section>

      <Section n="4" title="Procedimiento de denuncia y retiro">
        <p>
          Si considerás que un contenido publicado en {SITE.brand} infringe tus derechos o
          los de un tercero, escribinos a <strong>{LEGAL_CONTACT.denuncias}</strong>{" "}
          indicando:
        </p>
        <ul className="mt-1 list-disc pl-5">
          <li>El contenido o la campaña específica (enlace o descripción).</li>
          <li>El derecho afectado y por qué (autoría, imagen, marca, datos personales, suplantación, difamación, falsedad o contenido ilícito).</li>
          <li>Tus datos de contacto y una declaración de buena fe.</li>
        </ul>
        <p className="mt-2">
          Revisaremos la denuncia y podremos <strong>retirar o suspender preventivamente</strong>{" "}
          el contenido mientras se analiza, conforme la{" "}
          <Link href="/legal/campanas" className={link}>Política de Campañas</Link>.
        </p>
      </Section>
    </LegalLayout>
  );
}
