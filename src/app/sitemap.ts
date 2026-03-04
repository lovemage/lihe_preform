import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getProductsData } from "@/lib/data";

export const dynamic = "force-static";

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
    "/contact",
    "/download",
  ];

  const productsData = getProductsData();
  const productPages = productsData.products.map(
    (p: any) => `/products/${p.id}`
  );

  const allPages = [...pages, ...productPages];

  return allPages.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: (page === "" ? "weekly" : "monthly") as any,
      priority: page === "" ? 1.0 : page.startsWith("/products/") ? 0.7 : 0.8,
    }))
  );
}
