import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";
import { SITE, PLATFORM_FEE_RATE } from "@/config/site";
import { COMPANY, LEGAL_CONTACT } from "@/config/legal";

export const metadata: Metadata = {
  title: `Términos y Condiciones — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const FEE = Math.round(PLATFORM_FEE_RATE * 100);
const NET = 100 - FEE;

const link = "text-gold underline";

export default function TerminosPage() {
  return (
    <LegalLayout
      docType="terminos-generales"
      intro={
        <p>
          Estos Términos y Condiciones regulan el uso de {SITE.brand} por parte de
          todas las personas que la utilizan: atletas y equipos que se postulan
          (“beneficiarios”), personas que aportan (“donantes”) y empresas. Al usar
          el sitio aceptás estos Términos y las políticas que se enlazan más abajo.
        </p>
      }
    >
      <Section n="1" title="Qué es GRANITO y aceptación de los Términos">
        <p>
          {SITE.brand} es una plataforma digital operada por{" "}
          <strong>{COMPANY.razonSocial}</strong>, CUIT <strong>{COMPANY.cuit}</strong>,
          con domicilio en <strong>{COMPANY.domicilio}</strong>, Argentina (en adelante,
          “{SITE.brand}”, “la plataforma”, “nosotros”). {SITE.brand} conecta a personas
          que quieren apoyar el deporte argentino con atletas y equipos verificados, y
          facilita que ese apoyo llegue de forma directa.
        </p>
        <p>
          Al registrarte, postularte o realizar un aporte, declarás haber leído y
          aceptado estos Términos, la{" "}
          <Link href="/privacidad" className={link}>Política de Privacidad</Link> y las
          demás políticas aplicables. Si no estás de acuerdo, no uses la plataforma.
        </p>
      </Section>

      <Section n="2" title="Nuestro rol: intermediario tecnológico (y lo que no somos)">
        <p>
          {SITE.brand} actúa exclusivamente como <strong>intermediario tecnológico y
          de difusión</strong> entre donantes y beneficiarios. <strong>No</strong> es
          un club ni una entidad deportiva, <strong>no</strong> es una entidad
          financiera, <strong>no</strong> realiza intermediación financiera ni oferta
          pública de valores, y <strong>no</strong> brinda asesoramiento financiero,
          impositivo ni de inversión.
        </p>
        <p>
          {SITE.brand} <strong>no custodia ni administra los fondos</strong> de los
          aportes: el dinero se procesa a través de un proveedor de pagos autorizado y
          se acredita directamente en la cuenta del beneficiario (ver punto 6). No
          garantizamos resultados deportivos ni montos de recaudación.
        </p>
      </Section>

      <Section n="3" title="Quiénes pueden usar la plataforma">
        <p>
          Para postularte como atleta o para aportar debés ser{" "}
          <strong>mayor de 18 años</strong>. Por el momento {SITE.brand}{" "}
          <strong>no acepta la postulación de personas menores de edad</strong>; cuando
          se habilite, requerirá la autorización y aceptación de su madre, padre o
          representante legal. Los equipos se postulan a través de una persona mayor de
          edad que declara estar autorizada a representarlos.
        </p>
      </Section>

      <Section n="4" title="Registro e información veraz">
        <p>
          Al postularte o registrarte declarás que la información que cargás es{" "}
          <strong>veraz, completa, actualizada y propia</strong>, y que tenés derecho a
          usar las fotos, imágenes y datos que subís. Sos responsable de mantener tu
          información actualizada y de la confidencialidad de tu cuenta. Podemos
          solicitar documentación adicional para verificar tu identidad o tu actividad
          deportiva.
        </p>
      </Section>

      <Section n="5" title="Verificación y moderación">
        <p>
          Toda postulación es <strong>revisada</strong> por el equipo de {SITE.brand}.
          El alcance de lo que verificamos —y de lo que no— está detallado en nuestra{" "}
          <Link href="/verificacion" className={link}>Política de Verificación</Link>.
          Podemos aprobar, pedir más información, rechazar, editar, suspender o dar de
          baja una postulación o campaña que incumpla estos Términos, contenga datos
          falsos, o resulte engañosa, ofensiva o ilícita, conforme la{" "}
          <Link href="/legal/campanas" className={link}>Política de Campañas</Link>.
        </p>
      </Section>

      <Section n="6" title="Aportes, comisión y pagos">
        <p>
          Los aportes que reciben los atletas y equipos tienen naturaleza de{" "}
          <strong>donación</strong>, sin contraprestación económica ni derecho sobre
          resultados. Los reconocimientos simbólicos (por ejemplo, un diploma digital de
          agradecimiento) no alteran esa naturaleza. Las condiciones para quienes
          aportan están en los{" "}
          <Link href="/legal/donantes" className={link}>Términos del Donante</Link>.
        </p>
        <p>
          Del monto de cada aporte, {SITE.brand} percibe una comisión del{" "}
          <strong>{FEE}%</strong> por su servicio de intermediación, y el{" "}
          <strong>{NET}%</strong> restante se destina al atleta o se reparte en partes
          iguales entre los integrantes del equipo. La comisión se informa de forma
          clara antes de confirmar cada aporte.
        </p>
        <p>
          Los pagos se procesan a través de <strong>proveedores de pago autorizados</strong>{" "}
          (por ejemplo, Mercado Pago), que acreditan los fondos directamente en la cuenta
          de cobro que el beneficiario informa y que debe ser de su titularidad exclusiva.
          Esos servicios tienen sus propios términos, comisiones y tiempos de acreditación.
          {SITE.brand} no custodia fondos ni responde por demoras, rechazos o errores
          atribuibles a esos procesadores o a datos de cobro incorrectos.
        </p>
      </Section>

      <Section n="7" title="Obligaciones específicas del atleta o equipo">
        <p>El beneficiario se obliga a:</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Usar los fondos para el destino declarado en su campaña.</li>
          <li>
            Declarar y garantizar que su participación y su campaña son{" "}
            <strong>compatibles con las obligaciones que tenga ante su federación,
            club o contratos vigentes</strong> de patrocinio, representación o beca
            (incluidos apoyos públicos como el ENARD), y que no las infringen.
          </li>
          <li>Mantener una cuenta de cobro a su nombre e informar cualquier cambio antes de efectuarlo.</li>
          <li>Cumplir las políticas de campañas, propiedad intelectual, integridad, antidopaje y no manipulación deportiva.</li>
          <li>Responder por la veracidad de la información y del contenido que publica.</li>
        </ul>
      </Section>

      <Section n="8" title="Contenido, imagen y propiedad intelectual">
        <p>
          Al cargar contenido (fotos, videos, textos, tu historia) declarás tener los
          derechos o autorizaciones necesarios y otorgás a {SITE.brand} una licencia{" "}
          <strong>gratuita, no exclusiva y limitada</strong> para alojar, reproducir,
          adaptar técnicamente, distribuir y promocionar tu campaña en el sitio y en los
          canales de comunicación de la plataforma. Conservás la titularidad de tu
          contenido. El detalle y el procedimiento de denuncia y retiro están en la{" "}
          <Link href="/legal/propiedad-intelectual" className={link}>Política de
          Propiedad Intelectual y Denuncias</Link>. La marca {SITE.brand}, el diseño y
          el software del sitio pertenecen a {SITE.brand} y no pueden usarse sin
          autorización.
        </p>
      </Section>

      <Section n="9" title="Conducta esperada">
        <p>Te comprometés a no usar la plataforma para:</p>
        <ul className="mt-1 list-disc pl-5">
          <li>Cargar datos falsos, de terceros sin permiso, o contenido ilícito, ofensivo, discriminatorio o engañoso.</li>
          <li>Suplantar identidad o tergiversar tu actividad deportiva.</li>
          <li>Realizar campañas prohibidas conforme la Política de Campañas.</li>
          <li>Intentar vulnerar la seguridad del sitio o de otros usuarios.</li>
        </ul>
      </Section>

      <Section n="10" title="Defensa del consumidor">
        <p>
          En lo que resulte aplicable, la relación con los usuarios se rige por la{" "}
          <strong>Ley 24.240 de Defensa del Consumidor</strong>. Ponemos a disposición
          información clara sobre el servicio y sus comisiones, un canal de atención y
          reclamos en <strong>{LEGAL_CONTACT.reclamos}</strong>, y documentación
          electrónica de cada operación. No aplicamos cláusulas abusivas.
        </p>
      </Section>

      <Section n="11" title="Baja de cuenta y reembolsos">
        <p>
          Podés solicitar la <strong>baja de tu perfil y la supresión de tus datos</strong>{" "}
          en cualquier momento. Las condiciones de baja, así como los supuestos de
          reembolso, están en la{" "}
          <Link href="/legal/reembolsos" className={link}>Política de Reembolsos y Baja
          de Cuenta</Link>. Como los aportes se acreditan de forma directa e inmediata en
          la cuenta del beneficiario, los reembolsos proceden únicamente en los supuestos
          allí previstos.
        </p>
      </Section>

      <Section n="12" title="Datos personales">
        <p>
          El tratamiento de tus datos personales se rige por la{" "}
          <Link href="/privacidad" className={link}>Política de Privacidad</Link>, en el
          marco de la Ley 25.326. El uso de cookies está descripto en la{" "}
          <Link href="/legal/cookies" className={link}>Política de Cookies</Link>.
        </p>
      </Section>

      <Section n="13" title="Aceptación electrónica y evidencia">
        <p>
          La aceptación de estos Términos y de las políticas se realiza por medios
          electrónicos (por ejemplo, marcando “Acepto” al registrarte, postularte o
          aportar) y constituye una manifestación válida de voluntad. {SITE.brand}{" "}
          conserva evidencia técnica de la aceptación (versión del documento, fecha y
          hora, y datos técnicos de la sesión) a los fines de acreditarla.
        </p>
      </Section>

      <Section n="14" title="Limitación de responsabilidad">
        <p>
          La plataforma se ofrece “tal cual”. En la medida que lo permita la ley,{" "}
          {SITE.brand} no será responsable por daños indirectos, ni por el accionar de
          donantes, atletas, equipos o procesadores de pago, ni por el uso que el
          beneficiario dé a los fondos. Nada en estos Términos limita responsabilidades
          que no puedan excluirse legalmente.
        </p>
      </Section>

      <Section n="15" title="Cambios en los Términos">
        <p>
          Podemos modificar estos Términos. Los cambios relevantes se informarán en el
          sitio, indicando la nueva versión y su fecha de vigencia. El uso posterior
          implica la aceptación de la versión vigente.
        </p>
      </Section>

      <Section n="16" title="Ley aplicable y jurisdicción">
        <p>
          Estos Términos se rigen por las leyes de la <strong>República Argentina</strong>.
          Ante cualquier controversia, las partes se someten a los tribunales ordinarios
          de <strong>{COMPANY.jurisdiccion}</strong>, salvo normas de orden público que
          dispongan otra cosa.
        </p>
      </Section>

      <Section n="17" title="Contacto">
        <p>Consultas sobre estos Términos: <strong>{LEGAL_CONTACT.general}</strong>.</p>
      </Section>
    </LegalLayout>
  );
}
