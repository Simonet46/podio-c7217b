// Recorta `out/` para dejar SOLO el backoffice (deploy privado en
// Cloudflare Pages, detrás de Cloudflare Access). Se corre después de
// `next build` — ver script "build:admin" en package.json.
import { readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");

// Conservamos la página del backoffice y los chunks JS/CSS compartidos.
const KEEP = new Set(["backoffice", "_next"]);

for (const entry of readdirSync(OUT)) {
  if (!KEEP.has(entry)) rmSync(join(OUT, entry), { recursive: true, force: true });
}

// La raíz del deploy redirige al backoffice.
writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html><meta http-equiv="refresh" content="0; url=/backoffice/"><a href="/backoffice/">Backoffice</a>`
);

// Nada de este deploy debe indexarse (Cloudflare Access ya bloquea bots,
// pero lo declaramos igual).
writeFileSync(join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n");

console.log("✔ out/ recortado: solo backoffice + _next (deploy privado)");
