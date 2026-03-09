import type { ReactNode } from "react";
import type { Metadata } from "next";
import YandexMetrica from "@/components/analytics/YandexMetrica";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lihe-preform.com"),
  icons: {
    icon: [
      {
        url: "/images/logo/favicon.webp",
        type: "image/webp",
        sizes: "any",
      },
    ],
    shortcut: ["/images/logo/favicon.webp"],
    apple: ["/images/logo/favicon.webp"],
  },
};

export default function RedirectRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <YandexMetrica />
      </body>
    </html>
  );
}
