import { ImageResponse } from "next/og";
import type { ReactElement } from "react";

/**
 * Rinde una tarjeta de compartir y la devuelve en JPEG.
 *
 * next/og solo emite PNG, y una card con foto de fondo pesa ~700 KB. WhatsApp
 * descarta las previsualizaciones que pasan los ~600 KB: en vez de una imagen
 * grande, el mensaje sale con el link pelado. El mismo diseño en JPEG queda
 * cerca de 150 KB. Si sharp no estuviera disponible, devolvemos el PNG.
 *
 * Acordate de exportar `contentType = "image/jpeg"` en la ruta que use esto.
 */
export async function ogJpeg(
  element: ReactElement,
  size: { width: number; height: number },
): Promise<Response> {
  try {
    const png = new ImageResponse(element, size);
    const buf = Buffer.from(await png.arrayBuffer());
    const sharp = (await import("sharp")).default;
    const jpeg = await sharp(buf).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new ImageResponse(element, size);
  }
}
