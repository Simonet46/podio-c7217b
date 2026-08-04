/**
 * Copys que dependen del género del atleta (campo `gender`, editable desde el
 * admin). Sin género cargado caemos a una forma neutra: nunca inventamos.
 */
export type Gender = "f" | "m" | null | undefined;

/** "la apoyan" / "lo apoyan" / "apoyan" (stats del perfil). */
export function apoyanLabel(g: Gender): string {
  return g === "f" ? "la apoyan" : g === "m" ? "lo apoyan" : "apoyan";
}

/** "Conocela →" / "Conocelo →" / "Su historia →" (cards del grid). */
export function conoceLabel(g: Gender): string {
  return g === "f" ? "Conocela →" : g === "m" ? "Conocelo →" : "Su historia →";
}

/** "…en apoyarla" / "…en apoyarlo" / "…en apoyar" (empty state del muro). */
export function apoyarSuffix(g: Gender): string {
  return g === "f" ? "apoyarla" : g === "m" ? "apoyarlo" : "apoyar";
}

/** "Los que la/lo apoyan" (eyebrow del muro). */
export function losQueApoyan(g: Gender): string {
  return g === "f" ? "Las personas que la apoyan" : g === "m" ? "Las personas que lo apoyan" : "Las personas que apoyan";
}
