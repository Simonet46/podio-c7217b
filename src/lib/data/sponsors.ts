/**
 * Sponsors (empresas) y a quién apadrinan.
 * Demo: marcas inventadas. El logo real (si existe) va en /public/sponsors/;
 * si no, se muestra el nombre estilizado con el color de la marca.
 */
export interface Sponsor {
  id: string;
  name: string;
  /** Logo en /public/sponsors/<archivo>. Opcional (fallback a wordmark). */
  logo?: string;
  /** Color de la marca. */
  color: string;
}

// Sin marcas demo: GRANITO no muestra sponsors en los perfiles (filosofía:
// impacto, no exposición). El mecanismo queda por si algún día se usa para
// reconocer "empresas impulsoras" de forma no publicitaria.
export const SPONSORS: Record<string, Sponsor> = {};

/** Qué empresa apadrina a qué atleta/equipo (por slug). */
export const SPONSORSHIPS: Record<string, string> = {};

export function getSponsorForSlug(slug: string): Sponsor | null {
  const id = SPONSORSHIPS[slug];
  return (id && SPONSORS[id]) || null;
}
