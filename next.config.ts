import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const remoteImageHost = process.env.NEXT_PUBLIC_ASSET_HOSTNAME;

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
};

export default withNextIntl(nextConfig);
