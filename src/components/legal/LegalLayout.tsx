import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LEGAL_DATA_COMPLETE, legalDoc, type LegalDocType } from "@/config/legal";

/**
 * Layout compartido de las páginas legales. Unifica el banner "Borrador", el
 * encabezado, la línea de versión y el pie. Las páginas legales pasan su
 * `docType` (para título/versión) y el contenido como children.
 */
export function LegalLayout({
  docType,
  intro,
  children,
}: {
  docType: LegalDocType;
  /** Bajada opcional bajo el título. */
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  const doc = legalDoc(docType);
  return (
    <>
      <Header />
      <main className="bg-ink text-white">
        <article className="mx-auto max-w-[820px] px-4 pb-24 pt-12 sm:px-6">
          {!LEGAL_DATA_COMPLETE && (
            <div
              className="mb-8 rounded-[12px] p-4 text-[13px] leading-relaxed"
              style={{ background: "rgba(201,162,39,.1)", border: "1px solid rgba(201,162,39,.32)", color: "#e3c768" }}
            >
              ⚠️ <strong>Borrador — pendiente de revisión legal.</strong> Este texto es
              un modelo de referencia, no asesoramiento legal. Antes de su versión
              definitiva debe revisarlo un abogado/a y deben completarse los datos de
              la sociedad (razón social, CUIT, domicilio).
            </div>
          )}

          <p className="eyebrow text-gold">Legal</p>
          <h1 className="mt-2 font-display text-[36px] font-700 uppercase leading-none tracking-tight sm:text-[48px]">
            {doc.title}
          </h1>
          <p className="mt-3 text-[14px] text-white/50">
            Versión {doc.version} — vigente desde el {doc.effectiveDate}
          </p>
          {intro && <div className="mt-5 text-[15px] leading-relaxed text-white/70">{intro}</div>}

          <div className="mt-8 flex flex-col gap-7 text-[15px] leading-relaxed text-white/75">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

/** Sección numerada dentro de una página legal. */
export function Section({
  n,
  title,
  children,
}: {
  n: string | number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 font-display text-[19px] font-600 uppercase tracking-wide text-white">
        {n}. {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
