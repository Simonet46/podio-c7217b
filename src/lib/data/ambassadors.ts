/**
 * Embajadores: referentes del deporte argentino que prestan su cara al
 * proyecto. Aparecen en una banda discreta del home, con recorte PNG/WebP
 * SIN FONDO (el deportista solo, sin rectángulo de foto).
 *
 * Para sumar uno: recortá la foto sin fondo (WebP con transparencia, ~560px
 * de alto), guardala en /public/embajadores/ y agregá la entrada acá.
 */
export interface Ambassador {
  name: string;
  /** Etiqueta de deporte que se muestra (texto libre). */
  sportLabel: string;
  /** Color del chip del deporte (mismo criterio que config/sports). */
  color: string;
  /** Ruta del recorte sin fondo en /public. */
  image: string;
}

export const AMBASSADORS: Ambassador[] = [
  {
    name: "Facundo Campazzo",
    sportLabel: "Básquet",
    color: "#C25A28",
    image: "/embajadores/facundo-campazzo.webp",
  },
  {
    name: "Diego Simonet",
    sportLabel: "Handball",
    color: "#9C3B5A",
    image: "/embajadores/diego-simonet.webp",
  },
  {
    name: "Luciano De Cecco",
    sportLabel: "Vóley",
    color: "#B5882A",
    image: "/embajadores/luciano-de-cecco.webp",
  },
  {
    name: "Delfina Brea",
    // El pádel no está en config/sports (no hay atletas de pádel todavía):
    // etiqueta y color propios de la sección.
    sportLabel: "Pádel",
    color: "#227D9B",
    image: "/embajadores/delfina-brea.webp",
  },
];
