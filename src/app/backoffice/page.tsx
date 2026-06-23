import type { Metadata } from "next";
import { BackofficeApp } from "@/components/BackofficeApp";

export const metadata: Metadata = {
  title: "Backoffice",
  robots: { index: false, follow: false },
};

export default function BackofficePage() {
  return <BackofficeApp />;
}
