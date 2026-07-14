import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE, PLATFORM_FEE_RATE } from "@/config/site";

export const metadata: Metadata = {
  title: `Preguntas frecuentes — ${SITE.brand}`,
  description:
    "Dudas frecuentes sobre cómo apoyar atletas argentinos en GRANITO: aportes, comisión, cobros directos, postulaciones y más.",
  robots: { index: true, follow: true },
};

const FEE = Math.round(PLATFORM_FEE_RATE * 100);
const TO_ATHLETE = 100 - FEE;

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "¿Qué es GRANITO?",
    a: (
      <>
        Es una plataforma que conecta a personas que quieren apoyar con atletas y
        equipos argentinos. Elegís a quién acompañar y tu aporte va directo a esa
        persona, sin intermediarios.
      </>
    ),
  },
  {
    q: "¿Cómo apoyo a un atleta?",
    a: (
      <>
        Entrá al perfil del atleta que quieras, elegí tu aporte y completás el pago
        con Mercado Pago o PayPal. No hace falta crear una cuenta para aportar.
      </>
    ),
  },
  {
    q: "¿Cuánto del aporte llega al atleta?",
    a: (
      <>
        El <strong>{TO_ATHLETE}%</strong> de cada aporte va al atleta. GRANITO
        retiene una comisión del <strong>{FEE}%</strong> para operar y sostener la
        plataforma. La plataforma no custodia los fondos: el dinero llega directo a
        la cuenta de cobro del atleta.
      </>
    ),
  },
  {
    q: "¿El dinero pasa por algún intermediario?",
    a: (
      <>
        No. El aporte va directo a la cuenta de Mercado Pago o PayPal que el
        atleta informó, sin intermediarios ni organismos de por medio.
      </>
    ),
  },
  {
    q: "¿Puedo volver a aportar cuando quiera?",
    a: (
      <>
        Sí. Cada aporte es único y podés volver a aportar cuando quieras. No hay
        metas ni barras que llenar: lo que importa es acompañar al atleta en su día
        a día.
      </>
    ),
  },
  {
    q: "¿Cómo sé que el atleta es real?",
    a: (
      <>
        Cada postulación la revisamos a mano, una por una, antes de publicarla.
        Verificamos identidad y actividad deportiva para que apoyes con confianza.
      </>
    ),
  },
  {
    q: "Soy atleta, ¿cómo me sumo?",
    a: (
      <>
        Postulate desde{" "}
        <a href="/para-atletas" className="text-gold underline">
          esta página
        </a>
        . Revisamos tu postulación y, si la aprobamos, te enviamos el acceso para
        activar tu cuenta y editar tu perfil.
      </>
    ),
  },
  {
    q: "Ya soy atleta de GRANITO, ¿cómo edito mi perfil?",
    a: (
      <>
        Ingresá a{" "}
        <a href="/mi-perfil" className="text-gold underline">
          Mi perfil
        </a>{" "}
        con tu email y contraseña. Desde ahí actualizás tu historia, tus novedades y
        conectás tu Mercado Pago. Los cambios los revisa el equipo antes de
        publicarse.
      </>
    ),
  },
  {
    q: "¿Los aportes se pueden reembolsar?",
    a: (
      <>
        Los aportes son voluntarios y, salvo un error comprobado o lo que exija la
        ley, no son reembolsables. Ante cualquier problema, escribinos y lo
        resolvemos.
      </>
    ),
  },
  {
    q: "Tengo una empresa, ¿cómo impulso el deporte?",
    a: (
      <>
        Sumate como empresa impulsora desde{" "}
        <a href="/empresas" className="text-gold underline">
          la sección para empresas
        </a>
        . Tu marca acompaña a los atletas argentinos y forma parte de la comunidad.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="bg-ink text-white">
        <article className="mx-auto max-w-[820px] px-4 pb-24 pt-12 sm:px-6">
          <p className="eyebrow text-gold">Ayuda</p>
          <h1 className="mt-2 font-display text-[40px] font-700 uppercase leading-none tracking-tight sm:text-[52px]">
            Preguntas frecuentes
          </h1>
          <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-white/55">
            Todo lo que necesitás saber para apoyar a un atleta o sumarte a{" "}
            {SITE.brand}. ¿No encontrás tu respuesta? Escribinos y te ayudamos.
          </p>

          <div className="mt-9 flex flex-col gap-3">
            {FAQS.map((item, i) => (
              <details
                key={i}
                className="group rounded-[12px] border border-white/10 bg-[#0d2238] px-5 py-4 [&_summary]:list-none"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4">
                  <span className="font-display text-[16px] font-600 text-white sm:text-[17px]">
                    {item.q}
                  </span>
                  <span
                    className="shrink-0 text-[22px] leading-none text-gold transition-transform duration-200 group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="mt-3 text-[15px] leading-relaxed text-white/70">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
