import { SITE } from "@/config/site";

/**
 * Wordmark de la marca (variante A del rediseño): el nombre en Oswald con la
 * ÚLTIMA letra en oro (la "O" = el podio / el objetivo). El color del resto lo
 * hereda del contenedor (blanco sobre midnight, ink sobre claro).
 *
 * - `className` controla el tamaño/tipografía (ej. "text-2xl", "text-6xl").
 * - `ribbon` muestra la cinta de 5 colores debajo (para usos sueltos; en el
 *   header/footer no hace falta porque ya está la franja a lo ancho).
 */
export function Wordmark({
  className = "text-2xl",
  ribbon = false,
}: {
  className?: string;
  ribbon?: boolean;
}) {
  const name = SITE.brand;
  const head = name.slice(0, -1);
  const tail = name.slice(-1);
  return (
    <span className="inline-flex flex-col items-start leading-none">
      <span className={`font-display font-700 uppercase tracking-[0.04em] ${className}`}>
        {head}
        <span className="text-gold">{tail}</span>
      </span>
      {ribbon && (
        <span
          aria-hidden
          className="mt-1.5 block h-[6px] w-full rounded-[2px]"
          style={{
            background:
              "linear-gradient(90deg,#0072CE 0 20%,#F4C300 20% 40%,#1A1A1A 40% 60%,#009F3D 60% 80%,#DF0024 80% 100%)",
          }}
        />
      )}
    </span>
  );
}
