"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Ribbon } from "@/components/Ribbon";
import { Diploma } from "@/components/Diploma";
import { SEED_ATHLETES } from "@/lib/data/seed";
import { SEED_TEAMS } from "@/lib/data/teams";
import { breakdown, formatMoney } from "@/lib/money";
import type { DonationType } from "@/lib/data/types";

/**
 * Página de éxito post-aporte (modo demo, sitio estático).
 * Lee kind/slug/amount/type/split de la URL del lado del cliente.
 */
function GraciasContent() {
  const sp = useSearchParams();
  const kind = sp.get("kind") ?? "athlete";
  const slug = sp.get("slug") ?? "";
  const amount = parseFloat(sp.get("amount") ?? "0") || 0;
  const type: DonationType = sp.get("type") === "monthly" ? "monthly" : "once";
  const split = parseInt(sp.get("split") ?? "0", 10) || 0;
  const perMonth = type === "monthly";
  const { net } = breakdown(amount);

  const athlete =
    kind === "athlete" && slug
      ? SEED_ATHLETES.find((a) => a.slug === slug) ?? null
      : null;
  const team =
    kind === "team" && slug ? SEED_TEAMS.find((t) => t.slug === slug) ?? null : null;

  // Texto del destinatario y de la línea "recibe".
  const targetName =
    kind === "all"
      ? `los ${split} atletas`
      : kind === "team"
        ? team?.name ?? "todo el equipo"
        : athlete?.full_name ?? null;
  const isSplit = kind === "all" || kind === "team";
  const perEach = split > 0 ? net / split : net;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
        <Ribbon tall />
        <div className="p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-gold"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden
            >
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="mt-5 font-display text-3xl font-700 uppercase tracking-tight text-ink">
            ¡Gracias por apoyar!
          </h1>

          {targetName ? (
            <p className="mt-3 text-steel">
              Tu aporte {perMonth ? "mensual " : ""}a{" "}
              <span className="font-600 text-ink">{targetName}</span> se registró
              correctamente.
            </p>
          ) : (
            <p className="mt-3 text-steel">Tu aporte se registró correctamente.</p>
          )}

          {amount > 0 && (
            <dl className="mt-6 space-y-2 rounded-xl bg-ice p-5 text-left">
              <div className="flex justify-between">
                <dt className="text-steel">Tu aporte</dt>
                <dd className="font-display font-600 text-ink">
                  {formatMoney(amount, { cents: true })}
                  {perMonth && " / mes"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel">
                  {isSplit
                    ? perMonth
                      ? "Cada atleta recibe / mes"
                      : `Cada atleta recibe (de ${split})`
                    : perMonth
                      ? "El atleta recibe / mes"
                      : "El atleta recibe (neto del 7%)"}
                </dt>
                <dd className="font-display text-lg font-700 text-celeste-deep">
                  {formatMoney(perEach, { cents: true })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel">Tipo</dt>
                <dd className="font-display font-600 uppercase text-ink">
                  {perMonth ? "Mensual" : "Único"}
                </dd>
              </div>
            </dl>
          )}

          <p className="mt-5 rounded-lg bg-ice px-4 py-3 text-xs text-steel">
            Esto es una demo: todavía no se procesa un cobro real. Próximamente,
            pagos seguros vía Stripe.
          </p>

          {amount > 0 && (
            <Diploma
              amount={amount}
              monthly={perMonth}
              targetPhrase={
                kind === "all"
                  ? "todos los atletas argentinos"
                  : targetName ?? "el deporte argentino"
              }
            />
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {athlete && (
              <Link
                href={`/atleta/${athlete.slug}`}
                className="rounded-md border border-ink px-5 py-2.5 font-display text-sm font-600 uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Volver al perfil
              </Link>
            )}
            {team && (
              <Link
                href={`/equipo/${team.slug}`}
                className="rounded-md border border-ink px-5 py-2.5 font-display text-sm font-600 uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Volver al equipo
              </Link>
            )}
            <Link
              href="/#atletas"
              className="rounded-md bg-gold px-5 py-2.5 font-display text-sm font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
            >
              Ver más campañas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <>
      <Header />
      <main className="bg-ice">
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <GraciasContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
