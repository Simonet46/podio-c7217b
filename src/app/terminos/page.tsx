import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE, PLATFORM_FEE_RATE } from "@/config/site";

export const metadata: Metadata = {
  title: `Términos y Condiciones — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

const ACTUALIZADO = "28 de junio de 2026";
const FEE = Math.round(PLATFORM_FEE_RATE * 100);

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className="bg-ink text-white">
        <article className="mx-auto max-w-[820px] px-4 pb-24 pt-12 sm:px-6">
          <div
            className="mb-8 rounded-[12px] p-4 text-[13px] leading-relaxed"
            style={{ background: "rgba(201,162,39,.1)", border: "1px solid rgba(201,162,39,.32)", color: "#e3c768" }}
          >
            ⚠️ <strong>Borrador — pendiente de revisión legal.</strong> Este texto es
            un modelo de referencia, no asesoramiento legal. Antes de publicarlo
            definitivamente, debe revisarlo un abogado/a y deben completarse los
            datos entre [corchetes].
          </div>

          <p className="eyebrow text-gold">Legal</p>
          <h1 className="mt-2 font-display text-[40px] font-700 uppercase leading-none tracking-tight sm:text-[52px]">
            Términos y Condiciones
          </h1>
          <p className="mt-3 text-[14px] text-white/50">Última actualización: {ACTUALIZADO}</p>

          <div className="mt-8 flex flex-col gap-7 text-[15px] leading-relaxed text-white/75">
            <Section n="1" title="Qué es GRANITO y aceptación">
              <p>
                {SITE.brand} es una plataforma operada por{" "}
                <strong>[Razón social — ej. Granito Asociación Civil]</strong>, CUIT{" "}
                <strong>[CUIT]</strong>, que <strong>conecta</strong> a personas que quieren
                apoyar (“hinchas”) con atletas y equipos argentinos. Al usar el sitio o
                postularte, aceptás estos Términos y la{" "}
                <a href="/privacidad" className="text-gold underline">Política de Privacidad</a>.
                Si no estás de acuerdo, no uses la plataforma.
              </p>
            </Section>

            <Section n="2" title="Nuestro rol (y lo que no somos)">
              <p>
                {SITE.brand} <strong>facilita la conexión y la difusión</strong>; no es un
                club, una entidad deportiva, ni un asesor financiero. No garantizamos resultados
                deportivos ni montos de recaudación. La relación de apoyo se da entre el
                hincha y el atleta o equipo; {SITE.brand} provee la herramienta para que
                eso ocurra de forma directa y transparente.
              </p>
            </Section>

            <Section n="3" title="Postulación e información veraz">
              <p>
                Para postularte declarás que la información que cargás es{" "}
                <strong>veraz, completa y propia</strong>, y que tenés derecho a usar las
                fotos y los datos que subís. Sos responsable de mantener tu información
                actualizada. Podemos solicitar documentación adicional para verificar tu
                identidad o tu actividad deportiva.
              </p>
            </Section>

            <Section n="4" title="Revisión, aprobación y moderación">
              <p>
                Toda postulación es <strong>revisada a mano</strong> por el equipo de{" "}
                {SITE.brand}. Podemos aprobar, pedir más información, o rechazar una
                postulación a nuestro criterio, así como editar o dar de baja un perfil
                que incumpla estos Términos, contenga datos falsos o resulte ofensivo o
                ilícito.
              </p>
            </Section>

            <Section n="5" title="Aportes y comisión">
              <p>
                Del monto de cada aporte, {SITE.brand} retiene una comisión del{" "}
                <strong>{FEE}%</strong> para operar y sostener la plataforma, y el{" "}
                <strong>{100 - FEE}%</strong> restante se destina al atleta o se reparte
                en partes iguales entre los jugadores del equipo. Los aportes son{" "}
                <strong>voluntarios</strong> y, salvo error comprobado o lo que exija la
                ley, no son reembolsables.
              </p>
            </Section>

            <Section n="6" title="Pagos y procesadores externos">
              <p>
                Los aportes se procesan a través de <strong>proveedores de pago externos</strong>{" "}
                (por ejemplo, Mercado Pago o PayPal), que dirigen los fondos a la cuenta de
                cobro que el atleta o equipo informa. Esos servicios tienen sus propios
                términos, comisiones y tiempos de acreditación. {SITE.brand} no custodia
                fondos ni se responsabiliza por demoras, rechazos o errores atribuibles a
                esos procesadores o a datos de cobro incorrectos cargados por el atleta.
              </p>
            </Section>

            <Section n="7" title="Licencia de imagen y contenido">
              <p>
                Al cargar contenido (fotos, textos, historia), otorgás a {SITE.brand} una
                licencia <strong>gratuita y no exclusiva</strong> para usarlo, mostrarlo y
                difundirlo con el fin de promover tu campaña de apoyo, en el sitio y en
                canales de comunicación de la plataforma. Conservás la titularidad de tu
                contenido y podés solicitar que lo retiremos.
              </p>
            </Section>

            <Section n="8" title="Menores de edad">
              <p>
                Si sos menor de 18 años, sólo podés postularte con la autorización de tu
                madre, padre o tutor/a legal, quien acepta estos Términos en tu nombre,
                incluido el uso de tu imagen.
              </p>
            </Section>

            <Section n="9" title="Conducta esperada">
              <p>Te comprometés a no usar la plataforma para:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Cargar datos falsos, de terceros sin permiso, o contenido ilícito, ofensivo o engañoso.</li>
                <li>Suplantar identidad o tergiversar tu actividad deportiva.</li>
                <li>Intentar vulnerar la seguridad del sitio o de otros usuarios.</li>
              </ul>
            </Section>

            <Section n="10" title="Propiedad intelectual">
              <p>
                La marca {SITE.brand}, el diseño y el software del sitio pertenecen a{" "}
                {SITE.brand} y no pueden usarse sin autorización. El contenido que vos
                cargás sigue siendo tuyo, sujeto a la licencia del punto 7.
              </p>
            </Section>

            <Section n="11" title="Limitación de responsabilidad">
              <p>
                La plataforma se ofrece “tal cual”. En la medida que lo permita la ley,{" "}
                {SITE.brand} no será responsable por daños indirectos, ni por el accionar
                de hinchas, atletas, equipos o procesadores de pago. Nada en estos
                Términos limita responsabilidades que no puedan excluirse legalmente.
              </p>
            </Section>

            <Section n="12" title="Baja">
              <p>
                Podés pedir la baja de tu perfil y de tus datos en cualquier momento
                escribiéndonos a <strong>[email de contacto]</strong>. También podemos dar
                de baja perfiles que incumplan estos Términos.
              </p>
            </Section>

            <Section n="13" title="Cambios en los Términos">
              <p>
                Podemos modificar estos Términos. Los cambios relevantes se informarán en
                el sitio. El uso posterior implica la aceptación de la versión vigente.
              </p>
            </Section>

            <Section n="14" title="Ley aplicable y jurisdicción">
              <p>
                Estos Términos se rigen por las leyes de la <strong>República Argentina</strong>.
                Ante cualquier controversia, las partes se someten a los tribunales
                ordinarios de <strong>[ciudad/jurisdicción]</strong>, salvo normas de orden
                público que dispongan otra cosa.
              </p>
            </Section>

            <Section n="15" title="Contacto">
              <p>Consultas sobre estos Términos: <strong>[email de contacto]</strong>.</p>
            </Section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-display text-[20px] font-600 uppercase tracking-wide text-white">
        {n}. {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
