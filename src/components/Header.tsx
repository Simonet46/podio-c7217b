import Link from "next/link";
import { SITE } from "@/config/site";
import { Ribbon } from "./Ribbon";
import { Wordmark } from "./Wordmark";
import { AuthMenu } from "./AuthMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo + tagline */}
          <Link href="/" className="flex items-baseline gap-2.5 text-white">
            <Wordmark className="text-2xl" />
            <span className="eyebrow hidden text-gold sm:inline">
              {SITE.tagline}
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/#atletas"
              className="font-display text-sm uppercase tracking-wide text-white/75 transition-colors hover:text-white"
            >
              Atletas
            </Link>
            <Link
              href="/quienes-somos"
              className="font-display text-sm uppercase tracking-wide text-white/75 transition-colors hover:text-white"
            >
              Quiénes somos
            </Link>
            <Link
              href="/para-atletas"
              className="font-display text-sm uppercase tracking-wide text-gold transition-colors hover:text-gold-soft"
            >
              ¿Sos atleta?
            </Link>
            <Link
              href="/para-equipos"
              className="font-display text-sm uppercase tracking-wide text-gold transition-colors hover:text-gold-soft"
            >
              Equipos
            </Link>
            <Link
              href="/empresas"
              className="font-display text-sm uppercase tracking-wide text-white/75 transition-colors hover:text-white"
            >
              Empresas
            </Link>
          </nav>

          {/* CTA + Login */}
          <div className="flex items-center gap-3">
            <Link
              href="/#atletas"
              className="rounded-md bg-gold px-4 py-2 font-display text-sm font-600 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
            >
              Apoyar a un atleta
            </Link>
            <AuthMenu />
          </div>
        </div>
      </div>
      {/* Franja de 5 colores debajo del header */}
      <Ribbon />
    </header>
  );
}
