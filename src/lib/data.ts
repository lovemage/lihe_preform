import fs from "fs";
import path from "path";

function loadJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getSiteData() {
  const siteData = loadJson<any>("site.json");
  const productsData = getProductsData();
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

export function getHomeData() {
  return loadJson<any>("home.json");
}

export function getAboutData() {
  return loadJson<any>("about.json");
}

export function getFactoryData() {
  return loadJson<any>("factory.json");
}

export function getEquipmentData() {
  return loadJson<any>("equipment.json");
}

export function getContactData() {
  return loadJson<any>("contact.json");
}

export function getProductsData() {
  const filePath = path.join(process.cwd(), "products-data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
