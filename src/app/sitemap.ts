import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getProductsData } from "@/lib/data";
import { getCategoryPath, getProductCategories } from "@/lib/categories";
import { getNewsArticles, getNewsPath } from "@/lib/news";
import { buildLocalePath } from "@/lib/seo";
// Content-change dates per page and locale, written by scripts/build-lastmod.mjs (prebuild).
import lastmodJson from "../../data/sitemap-lastmod.json";

export const dynamic = "force-static";

type LastmodManifest = { pages: Record<string, Record<string, { lastmod: string }>> };
const lastmodManifest = lastmodJson as LastmodManifest;

function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function buildLocalizedUrl(baseUrl: string, locale: string, page: string): string {
  return `${baseUrl}${buildLocalePath(locale, page)}`;
}

function buildPageAlternates(baseUrl: string, page: string) {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, buildLocalizedUrl(baseUrl, locale, page)]),
    ),
    "x-default": buildLocalizedUrl(baseUrl, routing.defaultLocale, page),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lihe-preform.com";

  const pages = [
    "",
    "/about",
    "/factory",
    "/equipment",
    "/equipment/qc",
    "/equipment/machining",
    "/products",
    "/news",
    "/contact",
  ];

  const productPages = getProductsData("en").products.map(
    (p: any) => `/products/${p.id}`
  );

  const categoryPages = getProductCategories("en").map((category) =>
    getCategoryPath(category.slug),
  );

  const newsLastModified = new Map<string, Record<string, Date | undefined>>(
    getNewsArticles("en").map((article) => [
      getNewsPath(article.slug),
      Object.fromEntries(
        routing.locales.map((locale) => {
          const localized = getNewsArticles(locale).find((a) => a.slug === article.slug) ?? article;
          return [locale, toDate(localized.updated ?? localized.date)];
        }),
      ),
    ]),
  );

  function latestNewsDate(locale: string): Date | undefined {
    const dates = [...newsLastModified.values()]
      .map((byLocale) => byLocale[locale]?.getTime() ?? 0)
      .filter((time) => time > 0);
    return dates.length ? new Date(Math.max(...dates)) : undefined;
  }

  function lastModified(page: string, locale: string): Date | undefined {
    if (newsLastModified.has(page)) return newsLastModified.get(page)?.[locale];
    if (page === "/news") return latestNewsDate(locale);
    return toDate(lastmodManifest.pages[page || "/"]?.[locale]?.lastmod);
  }

  const allPages = [...pages, ...categoryPages, ...productPages, ...newsLastModified.keys()];

  return allPages.flatMap((page) =>
    routing.locales.map((locale) => {
      const modified = lastModified(page, locale);

      return {
        url: buildLocalizedUrl(baseUrl, locale, page),
        ...(modified ? { lastModified: modified } : {}),
        changeFrequency: (page === "" ? "weekly" : "monthly") as any,
        priority: page === "" ? 1.0 : page.startsWith("/products/") ? 0.7 : 0.8,
        alternates: {
          languages: buildPageAlternates(baseUrl, page),
        },
      };
    }),
  );
}
