/** Normaliza texto que escribe la gente: colapsa espacios múltiples y saca
 *  los de los bordes. El teclado del celular agrega un espacio al final al
 *  autocompletar — casi todas las postulaciones reales venían con
 *  "Pedro Martinez ". */
export function limpiarTexto(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}
