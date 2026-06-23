import Link from "next/link";
import { SITE, LEGAL_DISCLAIMER, PLATFORM_FEE_RATE } from "@/config/site";
import { Ribbon } from "./Ribbon";
import { PartnerLogos } from "./PartnerLogos";

export function Footer() {
  return (
    <>
      <PartnerLogos />
      <footer className="bg-ink text-white/70">
      <Ribbon />
      <div className="mx-auto max-w-container px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-2xl font-700 tracking-wide text-white">
                {SITE.brand}
              </span>
              <span className="eyebrow text-gold">{SITE.tagline}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed">{SITE.description}</p>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <span className="eyebrow mb-1 text-white/45">Navegar</span>
            <Link href="/#atletas" className="hover:text-white">
              Atletas y equipos
            </Link>
            <Link href="/apoyar-a-todos" className="hover:text-white">
              Apoyá a todos
            </Link>
            <Link href="/hinchas" className="hover:text-white">
              Top hinchas
            </Link>
            <Link href="/#como-funciona" className="hover:text-white">
              Cómo funciona
            </Link>
            <Link href="/quienes-somos" className="hover:text-white">
              Quiénes somos
            </Link>
            <Link href="/para-atletas" className="text-gold hover:text-gold-soft">
              ¿Sos atleta? Postulate
            </Link>
            <Link href="/empresas" className="hover:text-white">
              Para empresas
            </Link>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs leading-relaxed text-white/45">
            {LEGAL_DISCLAIMER}
          </p>
          <p className="mt-3 text-xs text-white/35">
            La plataforma retiene una comisión del{" "}
            {Math.round(PLATFORM_FEE_RATE * 100)}% para operar; el resto va
            directo al atleta. Pagos procesados de forma segura vía Stripe
            Connect (modelo pass-through: la plataforma no custodia los fondos).
          </p>
          <p className="mt-3 text-xs text-white/35">
            © {SITE.brand} — Hecho en Argentina.
          </p>
        </div>
      </div>
      </footer>
    </>
  );
}
