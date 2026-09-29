import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const remoteImageHost = process.env.NEXT_PUBLIC_ASSET_HOSTNAME;

// Duplicate product pages removed from products-data.json → the product kept in their place.
const mergedProductIds: Record<number, number> = {
  35: 19,
  32: 21,
  33: 20,
  36: 27,
  41: 38,
  61: 30, 62: 30, 63: 30, 64: 30, 65: 30, 66: 30, 67: 30,
  44: 18, 45: 18, 46: 18, 47: 18, 48: 18,
  49: 17, 50: 17, 51: 17, 52: 17, 53: 17,
};

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: remoteImageHost
      ? [
          {
            protocol: "https",
            hostname: remoteImageHost,
          },
        ]
      : [],
  },
  trailingSlash: true,
  async redirects() {
    return Object.entries(mergedProductIds).flatMap(([from, to]) => [
      {
        source: `/:locale(en|ru|es)/products/${from}`,
        destination: `/:locale/products/${to}/`,
        permanent: true,
      },
      // Locale-less legacy URLs would otherwise chain through the locale middleware's 307.
      {
        source: `/products/${from}`,
        destination: `/en/products/${to}/`,
        permanent: true,
      },
    ]);
  },
};

export default withNextIntl(nextConfig);
