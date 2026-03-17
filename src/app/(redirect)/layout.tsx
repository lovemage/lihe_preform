import type { ReactNode } from "react";
import type { Metadata } from "next";
import YandexMetrica from "@/components/analytics/YandexMetrica";
import { siteIcons } from "@/lib/metadata/icons";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lihe-preform.com"),
  icons: siteIcons,
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
