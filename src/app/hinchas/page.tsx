import { notFound } from "next/navigation";

// OCULTA a propósito. El ranking "Top hinchas" mostraba datos derivados/inventados
// (no había un sistema real de puntos de hinchas). Se oculta del sitio hasta poder
// construirlo con datos reales de donantes. Para reactivarlo: rehacer esta página
// leyendo aportes reales de la tabla `donations` (la versión demo original vive en
// el historial de git) y volver a agregar el link en Header/Footer.
export default function HinchasPage() {
  notFound();
}
