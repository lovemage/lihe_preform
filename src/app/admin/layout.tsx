import type { ReactNode } from "react";
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
