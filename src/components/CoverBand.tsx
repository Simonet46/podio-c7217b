import Image from "next/image";
import Link from "next/link";
import { asset } from "@/config/site";
import { Ribbon } from "./Ribbon";

/**
 * Banda de portada full-bleed con la imagen del "camino solitario".
 * Texto a la izquierda (sobre la ruta/cielo oscuro); la persona queda a la
 * derecha sin taparse (object-right + gradiente desde la izquierda).
 *
 * Imagen: public/cover.webp — reemplazala por la tuya cuando quieras
 * (mismo nombre y se cambia sola).
 */
export function CoverBand() {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <Image
        src={asset("/cover.webp")}
        alt="Atleta caminando solo por la ruta al amanecer"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-right"
      />
      {/* Gradiente desde la izquierda para que el texto tenga contraste. */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,26,47,0.94) 0%, rgba(10,26,47,0.7) 42%, rgba(10,26,47,0.15) 72%, rgba(10,26,47,0) 100%)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-container px-4 py-24 sm:px-6 sm:py-32 md:py-44">
        <div className="max-w-xl">
          <p className="eyebrow text-gold">El camino es largo</p>
          <h2 className="mt-4 font-display text-4xl font-700 uppercase leading-[1.03] tracking-tight text-white sm:text-5xl md:text-6xl">
            El camino de un atleta va mucho más allá de la competencia.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/80">
            Cada entrenamiento, cada viaje y cada torneo requieren esfuerzo y
            recursos. Tu apoyo puede marcar la diferencia.
          </p>
          <div className="mt-7 max-w-[220px]">
            <Ribbon tall />
          </div>
          <Link
            href="#atletas"
            className="mt-7 inline-block rounded-md bg-gold px-6 py-3 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
          >
            Apoyá a un atleta
          </Link>
        </div>
      </div>
    </section>
  );
}
