"use client";

import { useState } from "react";
import { asset } from "@/config/site";

/**
 * Banda "Con el apoyo de" con los logos de los partners.
 * Cada logo cae a su nombre en texto si el archivo no está (robusto).
 * Archivos en /public/logos/.
 */
const PARTNERS: { name: string; src: string }[] = [
  { name: "ENARD", src: "/logos/enard.png" },
  { name: "Globant", src: "/logos/globant.svg" },
  { name: "Mercado Pago", src: "/logos/mercado-pago.svg" },
];

function Logo({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="font-display text-lg font-700 uppercase tracking-wide text-steel">
        {name}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={asset(src)}
      alt={name}
      className="h-9 w-auto max-w-[130px] object-contain opacity-90 transition hover:opacity-100 sm:h-11 sm:max-w-[150px]"
      onError={() => setFailed(true)}
    />
  );
}

export function PartnerLogos() {
  return (
    <section className="border-t border-line bg-paper">
      <div className="mx-auto max-w-container px-4 py-10 text-center sm:px-6">
        <p className="eyebrow text-steel">Con el apoyo de</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-7">
          {PARTNERS.map((p) => (
            <Logo key={p.name} name={p.name} src={p.src} />
          ))}
        </div>
      </div>
    </section>
  );
}
