"use client";

import { useState } from "react";
import { asset } from "@/config/site";

function Logo({
  name,
  src,
  url,
  className,
}: {
  name: string;
  src: string;
  /** Sitio de la empresa: el logo lleva a su home en otra pestaña. */
  url?: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  const inner = failed ? (
    <span className="font-display text-2xl font-700 uppercase tracking-wide text-ink">
      {name}
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(src)}
      alt={name}
      className={`w-auto object-contain opacity-95 transition hover:opacity-100 ${className}`}
      onError={() => setFailed(true)}
    />
  );
  if (!url) return inner;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title={`Ir al sitio de ${name}`} className="inline-flex">
      {inner}
    </a>
  );
}

/** Nivel mayor: aportan más y llevan el logo grande. */
const IMPULSORAS = [{ name: "iDisko", src: "/logos/idisko.png", url: "https://www.idisko.com" }];

/** Nivel de entrada: aportan y llevan el logo más chico. */
/** Sin sponsors por ahora (Kingdom Group finalmente no lo es). El bloque
 *  entero se oculta mientras la lista esté vacía. */
const SPONSORS: { name: string; src: string }[] = [];

export function PartnerLogos() {
  return (
    <section className="border-t border-line bg-paper">
      <div className="mx-auto max-w-container px-4 py-14 text-center sm:px-6">
        <p className="eyebrow text-gold">Empresas impulsoras</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-7">
          {IMPULSORAS.map((l) => (
            <Logo
              key={l.name}
              name={l.name}
              src={l.src}
              url={l.url}
              className="h-20 max-w-[280px] rounded-xl sm:h-24"
            />
          ))}
        </div>

        {SPONSORS.length > 0 && (
          <>
            <p className="eyebrow mt-12 text-steel">Empresas sponsor</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
              {SPONSORS.map((l) => (
                <Logo
                  key={l.name}
                  name={l.name}
                  src={l.src}
                  className="h-12 max-w-[200px] rounded-lg sm:h-14"
                />
              ))}
            </div>
          </>
        )}

        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-steel">
          Las empresas que impulsan al deporte argentino con GRANITO.
        </p>
      </div>
    </section>
  );
}
