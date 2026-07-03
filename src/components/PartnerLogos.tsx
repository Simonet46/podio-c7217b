"use client";

import { useState } from "react";
import { asset } from "@/config/site";

function Logo({ name, src }: { name: string; src: string }) {
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
      className="h-20 w-auto max-w-[280px] object-contain opacity-95 transition hover:opacity-100 sm:h-24"
      onError={() => setFailed(true)}
    />
  );
}

export function PartnerLogos() {
  return (
    <section className="border-t border-line bg-paper">
      <div className="mx-auto max-w-container px-4 py-14 text-center sm:px-6">
        <p className="eyebrow text-gold">Empresa impulsora</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-7">
          <Logo name="DS Connect" src="/logos/ds-connect.png" />
        </div>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-steel">
          La primera empresa que impulsa al deporte argentino con GRANITO.
        </p>
      </div>
    </section>
  );
}
