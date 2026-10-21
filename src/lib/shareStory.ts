/**
 * Comparte la placa vertical (1080x1920) por el menú nativo del teléfono: en
 * Android y iOS eso ofrece "Instagram → Historias" directo, sin pasar por la
 * galería. Instagram no tiene un link web para publicar historias, así que el
 * menú nativo es el único camino que termina en la historia con la imagen.
 * En escritorio (sin compartir archivos) la descarga.
 */
export type ShareStoryResult = "shared" | "downloaded" | "cancelled" | "error";

export async function shareStoryImage(opts: {
  imageUrl: string;
  fileName: string;
  text: string;
}): Promise<ShareStoryResult> {
  try {
    const res = await fetch(opts.imageUrl);
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const file = new File([blob], opts.fileName, { type: "image/jpeg" });

    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: opts.text });
      return "shared";
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = opts.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return "downloaded";
  } catch (err) {
    // Cerrar el menú de compartir tira AbortError: no es un error real.
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    return "error";
  }
}
