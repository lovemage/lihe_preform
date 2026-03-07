import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { routing } from "@/i18n/routing";
import { getProductsData } from "@/lib/data";

export const dynamic = "force-static";

function getLatestMtime(filePaths: string[]): Date {
  const mtimes = filePaths
    .map((filePath) => {
      try {
        return fs.statSync(filePath).mtimeMs;
      } catch {
        return 0;
      }
    })
    .filter((mtime) => mtime > 0);

  if (mtimes.length === 0) {
    return new Date("2026-01-01T00:00:00.000Z");
  }

  return new Date(Math.max(...mtimes));
}

function buildLocalizedUrl(baseUrl: string, locale: string, page: string): string {
  if (!page) return `${baseUrl}/${locale}/`;
  return `${baseUrl}/${locale}${page}/`;
}

function buildPageAlternates(baseUrl: string, page: string) {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, buildLocalizedUrl(baseUrl, locale, page)]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lihe-preform.com";
  const dataDir = path.join(process.cwd(), "data");
  const staticDataFiles = [
    path.join(dataDir, "en", "about.json"),
    path.join(dataDir, "en", "contact.json"),
    path.join(dataDir, "en", "equipment.json"),
    path.join(dataDir, "en", "factory.json"),
    path.join(dataDir, "en", "home.json"),
    path.join(dataDir, "site.json"),
  ];
  const siteLastModified = getLatestMtime(staticDataFiles);
  const productsFile = path.join(dataDir, "en", "products-data.json");

  const pages = [
    "",
    "/about",
    "/factory",
    "/equipment",
    "/equipment/qc",
    "/equipment/machining",
    "/products",
    "/contact",
  ];

  const productsData = getProductsData("en");
  const crawledAt =
    typeof productsData?.crawled_at === "string"
      ? new Date(`${productsData.crawled_at}T00:00:00.000Z`)
      : null;
  const productsLastModified = crawledAt && !Number.isNaN(crawledAt.getTime())
    ? new Date(
        Math.max(crawledAt.getTime(), getLatestMtime([productsFile]).getTime()),
      )
    : getLatestMtime([productsFile]);

  const productPages = productsData.products.map(
    (p: any) => `/products/${p.id}`
  );

  const allPages = [...pages, ...productPages];

  return allPages.flatMap((page) =>
    routing.locales.map((locale) => {
      const localizedUrl = buildLocalizedUrl(baseUrl, locale, page);

      return {
        url: localizedUrl,
        lastModified: page.startsWith("/products/")
          ? productsLastModified
          : siteLastModified,
        changeFrequency: (page === "" ? "weekly" : "monthly") as any,
        priority: page === "" ? 1.0 : page.startsWith("/products/") ? 0.7 : 0.8,
        alternates: {
          languages: buildPageAlternates(baseUrl, page),
        },
      };
    }),
  );
}
