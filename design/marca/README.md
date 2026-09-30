# Marca GRANITO

Archivos fuente de la identidad. El sitio usa el wordmark tipográfico
(`Wordmark.tsx`); estos son los originales para diseño y exportación.

- `granito-logo-podio.svg` — logo con el podio (alternativa C): wordmark en
  ink + podio plata/oro/bronce. Versión para fondos claros.
- `granito-logo-podio-blanco.svg` — ídem con letras blancas, para fondos
  oscuros (ink del sitio).
- `granito-marca-figma.svg` — lockups del wordmark con la cinta de 5 colores.
- `Granito — Marca (lockup A).pdf` — lámina de variantes del lockup A.
- `granito-comparativa-cintas.svg` — comparativa de cintas (exploración).

Para exportar PNG desde un SVG (transparente, 2000px de ancho):
`npx -y sharp-cli -i design/marca/granito-logo-podio.svg -o logo.png resize 2000`
