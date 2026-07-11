import Link from "next/link";
import { SITE } from "@/config/site";
import { Ribbon } from "./Ribbon";
import { Wordmark } from "./Wordmark";
import { AuthMenu } from "./AuthMenu";
import { MobileMenu } from "./MobileMenu";

// Cada item en UNA sola línea (whitespace-nowrap): si una etiqueta se parte en
// dos renglones, el espaciado del menú se ve desparejo. El nav completo se
// muestra recién desde lg (1024px), que es donde entra sin apretarse; entre
// medio, la hamburguesa cubre la navegación.
const NAV_LINK =
  "whitespace-nowrap font-display text-[13.5px] uppercase tracking-wide transition-colors";

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between gap-4 px-4 sm:px-6 lg:gap-6">
          {/* Logo + tagline (el tagline recién desde xl: antes le roba lugar al nav) */}
          <Link href="/" className="flex shrink-0 items-baseline gap-2.5 text-white">
            <Wordmark className="text-2xl" />
            <span className="eyebrow hidden whitespace-nowrap text-gold 2xl:inline">
              {SITE.tagline}
            </span>
          </Link>

          {/* Nav — orden por intención: explorar (Atletas, Proyectos, Empresas)
              → confianza (Quiénes somos) → conversión secundaria (Postulate).
              Un solo dorado fuerte en el header: el CTA. */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/#atletas" className={`${NAV_LINK} text-white/75 hover:text-white`}>
              Atletas
            </Link>
            <Link href="/#equipos" className={`${NAV_LINK} text-white/75 hover:text-white`}>
              Proyectos deportivos
            </Link>
            <Link href="/empresas" className={`${NAV_LINK} text-white/75 hover:text-white`}>
              Empresas
            </Link>
            <Link href="/quienes-somos" className={`${NAV_LINK} text-white/75 hover:text-white`}>
              Quiénes somos
            </Link>
            <Link href="/postulate" className={`${NAV_LINK} text-white/75 hover:text-white`}>
              Postulate
            </Link>
          </nav>

          {/* CTA + Login + hamburguesa */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            {/* En pantallas chicas el CTA vive dentro del menú hamburguesa. */}
            <Link
              href="/#atletas"
              className="hidden whitespace-nowrap rounded-md bg-gold px-4 py-2 font-display text-sm font-600 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03] sm:inline-block"
            >
              Apoyar a un atleta
            </Link>
            <AuthMenu />
            <MobileMenu />
          </div>
        </div>
      </div>
      {/* Franja de 5 colores debajo del header */}
      <Ribbon />
    </header>
  );
}
