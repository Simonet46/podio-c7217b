import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Prepara una foto para las tarjetas de compartir (next/og).
 *
 * satori —el motor de next/og— solo entiende JPEG y PNG: un WebP/AVIF/HEIC lo
 * hace crashear con "a is not iterable". Como casi todas nuestras fotos son
 * WebP (seed) o vienen del celular del atleta (HEIC/WebP vía Supabase), antes
 * la tarjeta caía SIEMPRE al monograma de iniciales. Acá pasamos todo por
 * sharp y devolvemos un JPEG ya recortado a la medida exacta del hueco.
 *
 * Acepta URLs absolutas (Supabase Storage) y rutas de /public ("/athletes/x.webp").
 * Ante cualquier problema devuelve null y la tarjeta cae al monograma: una foto
 * rota nunca puede romper el build.
 */
export async function ogPhoto(
  src: string | null | undefined,
  opts: { width: number; height: number; blur?: number },
): Promise<string | null> {
  if (!src) return null;
  try {
    let input: Buffer;
    if (/^https?:\/\//.test(src)) {
      const res = await fetch(src);
      if (!res.ok) return null;
      input = Buffer.from(await res.arrayBuffer());
    } else {
      input = await readFile(path.join(process.cwd(), "public", src.replace(/^\//, "")));
    }

    const sharp = (await import("sharp")).default;
    let pipeline = sharp(input)
      // .rotate() sin argumentos aplica la orientación EXIF: sin esto, las
      // fotos sacadas con el celular salen acostadas.
      .rotate()
      .resize(opts.width, opts.height, {
        fit: "cover",
        // Recorte inteligente: encuadra la zona con más contraste (la cara del
        // atleta) en vez del centro geométrico.
        position: "attention",
      });
    if (opts.blur) pipeline = pipeline.blur(opts.blur);

    const jpeg = await pipeline.jpeg({ quality: 80 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}
