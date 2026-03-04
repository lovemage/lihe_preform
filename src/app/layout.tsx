import type { ReactNode } from "react";
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lihe-preform.com"),
  title: {
    default: "Lihe Precision | PET Mold Engineering",
    template: "%s | Lihe Precision",
  },
  description:
    "High-performance PET preform molds, blow molds, compression molds, and hot runner systems from Foshan Lihe Precision Machinery.",
  openGraph: {
    type: "website",
    siteName: "Lihe Precision Machinery",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
