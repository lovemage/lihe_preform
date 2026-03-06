import type { ReactNode } from "react";
import type { Metadata } from "next";
import YandexMetrica from "@/components/analytics/YandexMetrica";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lihe-preform.com"),
  icons: {
    icon: [
      {
        url: "/images/logo/favicon.png",
        type: "image/png",
        sizes: "any",
      },
    ],
    shortcut: ["/images/logo/favicon.png"],
    apple: ["/images/logo/favicon.png"],
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
