import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";
import { SITE } from "@/config/site";
import { LEGAL_CONTACT } from "@/config/legal";

export const metadata: Metadata = {
  title: `Política de Cookies — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const link = "text-gold underline";

export default function CookiesPage() {
  return (
    <LegalLayout
      docType="cookies"
      intro={
        <p>
          Esta política explica qué cookies y tecnologías similares usa {SITE.brand} y cómo
          podés gestionarlas.
        </p>
      }
    >
      <Section n="1" title="Qué son las cookies">
        <p>
          Las cookies son pequeños archivos que un sitio guarda en tu dispositivo para que
          funcione correctamente y para recordar información entre visitas.
        </p>
      </Section>

      <Section n="2" title="Qué cookies usamos">
        <ul className="list-disc pl-5">
          <li>
            <strong>Cookies técnicas o necesarias:</strong> imprescindibles para que el
            sitio funcione (por ejemplo, mantener tu sesión iniciada y procesar pagos de
            forma segura). No requieren consentimiento.
          </li>
          <li>
            <strong>Cookies de terceros:</strong> algunos servicios que integramos (por
            ejemplo, el procesador de pagos) pueden establecer sus propias cookies,
            regidas por sus políticas.
          </li>
        </ul>
        <p className="mt-2">
          Si en el futuro incorporamos cookies de análisis o marketing, lo informaremos y
          solicitaremos tu consentimiento cuando corresponda.
        </p>
      </Section>

      <Section n="3" title="Cómo gestionarlas">
        <p>
          Podés configurar tu navegador para bloquear o eliminar cookies. Tené en cuenta
          que si bloqueás las cookies técnicas, algunas funciones del sitio pueden dejar de
          funcionar.
        </p>
      </Section>

      <Section n="4" title="Datos personales y contacto">
        <p>
          El tratamiento de datos asociado a cookies se rige por nuestra{" "}
          <Link href="/privacidad" className={link}>Política de Privacidad</Link>. Consultas:{" "}
          <strong>{LEGAL_CONTACT.privacidad}</strong>.
        </p>
      </Section>
    </LegalLayout>
  );
}
