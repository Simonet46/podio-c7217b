import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/config/site";
import { LEGAL_INDEX, LEGAL_DOCS, LEGAL_DATA_COMPLETE } from "@/config/legal";

export const metadata: Metadata = {
  title: `Centro legal — ${SITE.brand}`,
  robots: { index: true, follow: true },
};

export default function LegalIndexPage() {
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
              ⚠️ <strong>Documentos en borrador — pendientes de revisión legal.</strong>{" "}
              Son modelos de referencia; su versión definitiva requiere revisión de un
              abogado/a y los datos de la sociedad.
            </div>
          )}

          <p className="eyebrow text-gold">Legal</p>
          <h1 className="mt-2 font-display text-[36px] font-700 uppercase leading-none tracking-tight sm:text-[48px]">
            Centro legal
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70">
            Todas las políticas y contratos que rigen el uso de {SITE.brand}.
          </p>

          <ul className="mt-8 flex flex-col divide-y divide-white/10 border-y border-white/10">
            {LEGAL_INDEX.map((type) => {
              const doc = LEGAL_DOCS[type];
              if (!doc.path) return null;
              return (
                <li key={type}>
                  <Link
                    href={doc.path}
                    className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-gold"
                  >
                    <span className="text-[16px] font-500">{doc.title}</span>
                    <span className="shrink-0 text-[12px] text-white/40">v{doc.version}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </article>
      </main>
      <Footer />
    </>
  );
}
