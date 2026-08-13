/**
 * Validación de emails en los formularios de postulación.
 *
 * Existe porque ya pasó: 2 de 19 postulantes escribieron su apellido en el
 * campo de email (se corrieron un campo al completar) y quedaron aprobados
 * e ilocalizables — todos los mails de la plataforma rebotaban en silencio.
 */

/** ¿Tiene forma de email? (usuario@dominio.tld) */
export function emailValido(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
}

/** Errores de tipeo comunes en dominios (es-AR): typo → dominio correcto. */
const TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.com.ar": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotnail.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yahoo.com.a": "yahoo.com.ar",
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
};

/** Si el dominio parece un typo conocido, devuelve el email corregido. */
export function sugerenciaEmail(s: string): string | null {
  const partes = s.trim().toLowerCase().split("@");
  if (partes.length !== 2 || !partes[0]) return null;
  const fix = TYPOS[partes[1]];
  return fix ? `${partes[0]}@${fix}` : null;
}
