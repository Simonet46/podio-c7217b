"use client";

import { useState } from "react";
import { asset } from "@/config/site";

function Logo({
  name,
  src,
  className,
}: {
  name: string;
  src: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="font-display text-2xl font-700 uppercase tracking-wide text-ink">
        {name}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={asset(src)}
      alt={name}
      className={`w-auto object-contain opacity-95 transition hover:opacity-100 ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

/** Nivel mayor: aportan más y llevan el logo grande. */
const IMPULSORAS = [{ name: "DS Connect", src: "/logos/ds-connect.png" }];

/** Nivel de entrada: aportan y llevan el logo más chico. */
const SPONSORS = [
  { name: "Kingdom Group Yacht Supply", src: "/logos/kingdom-group.jpeg" },
];

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
              className="h-20 max-w-[280px] sm:h-24"
            />
          ))}
        </div>

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

        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-steel">
          Las empresas que impulsan al deporte argentino con GRANITO.
        </p>
      </div>
    </section>
  );
}
