import type { ReactNode } from "react";
import type { Metadata } from "next";
import YandexMetrica from "@/components/analytics/YandexMetrica";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lihe-preform.com"),
  title: {
    default: "Lihe Precision | PET Preform Mold & Blow Mold Engineering",
    template: "%s",
  },
  description:
    "High-performance PET preform molds, blow molds, compression molds, closure molds, and hot runner systems. Multi-cavity mold manufacturer serving beverage packaging industries across 50+ countries.",
  keywords: [
    "PET preform mold",
    "blow mold",
    "hot runner system",
    "multi-cavity mold",
    "preform tooling",
    "injection molding machine",
    "compression mold",
    "closure mold",
    "beverage packaging solutions",
    "PET mold manufacturer",
  ],
  openGraph: {
    type: "website",
    siteName: "Lihe Precision Machinery",
    images: [
      {
        url: "/images/banners/banner1.webp",
        width: 1920,
        height: 1080,
        alt: "Lihe Precision PET mold manufacturing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/banners/banner1.webp"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <YandexMetrica />
      </body>
    </html>
  );
}
