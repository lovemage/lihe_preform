import enProductsJson from "../../data/en/products-data.json";
import ruProductsJson from "../../data/ru/products-data.json";
import esProductsJson from "../../data/es/products-data.json";

// URL slug for each English category name. Localized `categories` arrays are index-aligned with English.
const CATEGORY_SLUGS: Record<string, string> = {
  "Blow mold": "blow-mold",
  "Compression mold": "compression-mold",
  "Closure mold": "closure-mold",
  "Preform mold": "preform-mold",
  "Hotrunner system": "hot-runner-system",
  "Accessories": "accessories",
  "High precision mold base manufacturing": "mold-base",
  "QC equipment": "qc-equipment",
  "Machining equipment": "machining-equipment",
};

// Legacy `?category=` values that don't match a current slug or name.
const CATEGORY_ALIASES: Record<string, string> = {
  "hotrunner-system": "hot-runner-system",
};

const PRODUCTS_BY_LOCALE: Record<string, any> = {
  en: enProductsJson,
  ru: ruProductsJson,
  es: esProductsJson,
};

export type ProductCategory = {
  slug: string;
  name: string;
  description: string;
  short: string;
};

export function getProductCategories(locale: string): ProductCategory[] {
  const data = PRODUCTS_BY_LOCALE[locale] ?? PRODUCTS_BY_LOCALE.en;
  const enCategories: string[] = enProductsJson.categories;
  const descriptions: Record<string, { description?: string; short?: string }> =
    data.categoryDescriptions ?? {};

  return (data.categories as string[]).map((name, index) => ({
    slug: CATEGORY_SLUGS[enCategories[index]],
    name,
    description: descriptions[name]?.description ?? "",
    short: descriptions[name]?.short ?? "",
  }));
}

export function getCategoryByName(locale: string, name: string) {
  return getProductCategories(locale).find((category) => category.name === name);
}

export function getCategoryBySlug(locale: string, slug: string) {
  return getProductCategories(locale).find((category) => category.slug === slug);
}

export function getCategoryPath(slug: string) {
  return `/products/category/${slug}`;
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "-");
}

// Maps any legacy `?category=` value (slug, English or localized name, any casing) to a slug.
export function resolveCategoryParam(value: string): string | null {
  const key = normalize(value);
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];

  for (const locale of Object.keys(PRODUCTS_BY_LOCALE)) {
    for (const category of getProductCategories(locale)) {
      if (normalize(category.slug) === key || normalize(category.name) === key) {
        return category.slug;
      }
    }
  }

  return null;
}
