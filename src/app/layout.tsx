import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import { SITE } from "@/config/site";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  // Base para resolver las URLs de las imágenes OG (share cards) al dominio
  // real. Sin esto, Next las apunta a localhost y WhatsApp/redes no las cargan.
  metadataBase: new URL(SITE.url),
  title: `${SITE.brand} — ${SITE.tagline}`,
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.brand,
    title: `${SITE.brand} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.brand} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${oswald.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
