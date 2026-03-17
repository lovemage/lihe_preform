import type { ReactNode } from "react";
import type { Metadata } from "next";
import { siteIcons } from "@/lib/metadata/icons";
import "@/styles/globals.css";

export const metadata: Metadata = {
  icons: siteIcons,
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
