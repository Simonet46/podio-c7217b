"use client";

import { useState } from "react";
import { asset } from "@/config/site";

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
      className="h-10 w-auto max-w-[180px] object-contain opacity-90 transition hover:opacity-100 sm:h-12"
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
          <Logo name="DS Connect" src="/logos/ds-connect.png" />
        </div>
      </div>
    </section>
  );
}
