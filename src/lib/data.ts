import fs from "fs";
import path from "path";

function loadJson<T>(locale: string, filename: string): T {
  const localePath = path.join(process.cwd(), "data", locale, filename);
  const fallbackPath = path.join(process.cwd(), "data", "en", filename);
  const filePath = fs.existsSync(localePath) ? localePath : fallbackPath;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function loadSharedJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getSiteData(locale: string) {
  const siteData = loadSharedJson<any>("site.json");
  const productsData = getProductsData(locale);
  const rawCategories: unknown[] = Array.isArray(productsData?.categories)
    ? productsData.categories
    : [];

  const categories = Array.from(
    new Set(
      rawCategories.filter(
        (category: unknown): category is string =>
          typeof category === "string" && category.trim().length > 0,
      ),
    ),
  );

  siteData.nav = [
    { label: "Factory", href: "/factory" },
    {
      label: "Products",
      href: "/products",
      children: categories.map((category) => ({
        label: category,
        href: `/products?category=${encodeURIComponent(category)}`,
      })),
    },
    { label: "Contact Us", href: "/contact" },
  ];

  return siteData;
}

export function getHomeData(locale: string) {
  return loadJson<any>(locale, "home.json");
}

export function getAboutData(locale: string) {
  return loadJson<any>(locale, "about.json");
}

export function getFactoryData(locale: string) {
  return loadJson<any>(locale, "factory.json");
}

export function getEquipmentData(locale: string) {
  return loadJson<any>(locale, "equipment.json");
}

export function getContactData(locale: string) {
  return loadJson<any>(locale, "contact.json");
}

export function getProductsData(locale: string = "en") {
  return loadJson<any>(locale, "products-data.json");
}
