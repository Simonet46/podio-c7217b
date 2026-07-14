import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";
import { SITE } from "@/config/site";
import { COMPANY, LEGAL_CONTACT } from "@/config/legal";

export const metadata: Metadata = {
  title: `Política de Privacidad — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const link = "text-gold underline";

export default function PrivacidadPage() {
  return (
    <LegalLayout docType="privacidad">
      <Section n="1" title="Quién es responsable de tus datos">
        <p>
          El responsable del tratamiento de los datos personales es{" "}
          <strong>{COMPANY.razonSocial}</strong>, CUIT <strong>{COMPANY.cuit}</strong>,
          con domicilio en <strong>{COMPANY.domicilio}</strong>, Argentina (en adelante,
          “{SITE.brand}”, “nosotros”). Para cualquier consulta sobre tus datos podés
          escribirnos a <strong>{LEGAL_CONTACT.privacidad}</strong>.
        </p>
      </Section>

      <Section n="2" title="Qué datos recopilamos">
        <p>Según cómo uses la plataforma, podemos recopilar:</p>
        <ul className="mt-1 list-disc pl-5">
          <li><strong>Identificación y contacto:</strong> nombre, apellido, edad, DNI, email, teléfono, ciudad/provincia.</li>
          <li><strong>Datos deportivos:</strong> deporte, disciplina, nivel, club, competencias, logros, tu historia.</li>
          <li><strong>Imágenes:</strong> fotos de perfil y de acción que subís.</li>
          <li><strong>Datos de cobro:</strong> alias/CVU/CBU o email de Mercado Pago u otro medio, para que recibas los aportes.</li>
          <li><strong>Datos de aportes:</strong> historial de aportes realizados o recibidos.</li>
          <li><strong>Redes sociales:</strong> el usuario o enlace que nos compartas.</li>
          <li><strong>Datos técnicos:</strong> dirección IP, navegador/dispositivo y registros de uso necesarios para operar el sitio y conservar evidencia de aceptaciones.</li>
        </ul>
        <p className="mt-2">
          Si una campaña invoca causas de salud (por ejemplo, una lesión) y aportás
          documentación al respecto, esos datos pueden considerarse{" "}
          <strong>datos sensibles</strong> y se tratan con tu consentimiento específico y
          resguardos reforzados.
        </p>
      </Section>

      <Section n="3" title="Para qué usamos tus datos">
        <ul className="list-disc pl-5">
          <li>Revisar y aprobar tu postulación, y verificar identidad y actividad deportiva.</li>
          <li>Crear y mostrar tu perfil público de atleta o la campaña de tu equipo.</li>
          <li>Permitir que las personas te apoyen y que los aportes lleguen a tu cuenta de cobro.</li>
          <li>Comunicarnos con vos sobre tu postulación, tu perfil o tus aportes.</li>
          <li>Prevenir fraudes y usos indebidos, y cumplir obligaciones legales.</li>
        </ul>
        <p className="mt-2">
          El perfil del atleta y la campaña del equipo son <strong>públicos</strong>:
          nombre, deporte, ciudad, historia y fotos se muestran en el sitio. Los datos de
          cobro, de contacto y los documentos de verificación <strong>no</strong> se
          publican.
        </p>
      </Section>

      <Section n="4" title="Base legal del tratamiento">
        <p>
          Tratamos tus datos sobre la base de tu <strong>consentimiento</strong>, que
          prestás al aceptar esta política y los Términos, y en el marco de la{" "}
          <strong>Ley 25.326 de Protección de los Datos Personales</strong> de la
          República Argentina y su normativa reglamentaria. Podés retirar tu
          consentimiento en cualquier momento (ver punto 9).
        </p>
      </Section>

      <Section n="5" title="Con quién compartimos tus datos">
        <p>No vendemos tus datos. Los compartimos únicamente con:</p>
        <ul className="mt-1 list-disc pl-5">
          <li><strong>Proveedores de infraestructura</strong> que alojan la plataforma y la base de datos (por ejemplo, Supabase).</li>
          <li><strong>Procesadores de pago</strong> (por ejemplo, Mercado Pago) para que los aportes lleguen a tu cuenta, regidos por sus propias políticas.</li>
          <li><strong>Proveedores de envío de emails y de infraestructura de red</strong> (por ejemplo, Resend y Cloudflare) para comunicaciones y operación del sitio.</li>
          <li><strong>Autoridades</strong>, cuando una ley o una orden judicial lo requiera.</li>
        </ul>
      </Section>

      <Section n="6" title="Transferencias internacionales de datos">
        <p>
          Algunos de estos proveedores alojan o procesan datos <strong>fuera de
          Argentina</strong> (por ejemplo, en Estados Unidos o la Unión Europea). En esos
          casos procuramos que existan garantías adecuadas de protección conforme la Ley
          25.326 y las disposiciones de la Agencia de Acceso a la Información Pública.
        </p>
      </Section>

      <Section n="7" title="Fotos y derechos de imagen">
        <p>
          Al subir fotos y postularte, nos autorizás a publicar y mostrar esas imágenes en
          tu perfil público y en materiales de difusión de {SITE.brand}, con el fin de
          promover tu campaña. Podés pedir que retiremos tus imágenes en cualquier momento.
          Si las fotos incluyen a otras personas, declarás contar con su autorización.
        </p>
      </Section>

      <Section n="8" title="Cuánto tiempo conservamos tus datos">
        <p>
          Conservamos tus datos mientras tu perfil esté activo o sea necesario para las
          finalidades descriptas, y luego durante los plazos que exijan las obligaciones
          legales aplicables (por ejemplo, respaldo de operaciones y de aceptaciones).
          Cumplidos esos plazos, los eliminamos o anonimizamos.
        </p>
      </Section>

      <Section n="9" title="Tus derechos">
        <p>
          Como titular de los datos, tenés derecho a <strong>acceder, rectificar,
          actualizar y suprimir</strong> tus datos personales, y a retirar tu
          consentimiento. Para ejercerlos, escribinos a{" "}
          <strong>{LEGAL_CONTACT.privacidad}</strong>. La baja de cuenta se detalla en la{" "}
          <Link href="/legal/reembolsos" className={link}>Política de Reembolsos y Baja</Link>.
        </p>
        <p className="mt-2">
          La <strong>Agencia de Acceso a la Información Pública (AAIP)</strong>, órgano de
          control de la Ley 25.326, tiene la atribución de atender denuncias y reclamos
          relativos al incumplimiento de las normas sobre protección de datos personales.
        </p>
      </Section>

      <Section n="10" title="Seguridad e incidentes">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos
          (control de acceso, cifrado en tránsito y segregación de datos sensibles). Ningún
          sistema es 100% infalible; ante un incidente de seguridad que pueda afectar tus
          datos, actuamos conforme nuestro protocolo interno y las obligaciones de
          notificación aplicables.
        </p>
      </Section>

      <Section n="11" title="Cookies">
        <p>
          El uso de cookies y tecnologías similares se describe en la{" "}
          <Link href="/legal/cookies" className={link}>Política de Cookies</Link>.
        </p>
      </Section>

      <Section n="12" title="Cambios en esta política">
        <p>
          Podemos actualizar esta política. Cuando haya cambios relevantes, lo informaremos
          en el sitio y actualizaremos la versión y su fecha de vigencia.
        </p>
      </Section>

      <Section n="13" title="Contacto">
        <p>
          Por cualquier consulta sobre privacidad o tus datos, escribinos a{" "}
          <strong>{LEGAL_CONTACT.privacidad}</strong>.
        </p>
      </Section>
    </LegalLayout>
  );
}
