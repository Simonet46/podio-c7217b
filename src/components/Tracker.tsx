"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

/** Manda una vista de página por cada cambio de ruta del sitio público. */
export function Tracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname || pathname === last.current) return;
    last.current = pathname;
    if (/^\/(backoffice|mi-perfil)/.test(pathname)) return;
    track("pageview");
    if (pathname.startsWith("/gracias")) track("gracias");
  }, [pathname]);
  return null;
}
