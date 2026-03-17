import type { Metadata } from "next";

export const siteIcons: NonNullable<Metadata["icons"]> = {
  icon: [
    {
      url: "/favicon.ico",
      sizes: "any",
    },
    {
      url: "/images/logo/favicon.png",
      type: "image/png",
      sizes: "600x600",
    },
    {
      url: "/images/logo/favicon.webp",
      type: "image/webp",
      sizes: "2048x2048",
    },
  ],
  shortcut: ["/favicon.ico"],
  apple: [
    {
      url: "/images/logo/favicon.png",
      type: "image/png",
      sizes: "180x180",
    },
  ],
};
