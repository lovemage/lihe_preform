import siteJson from "../../data/site.json";
import enHomeJson from "../../data/en/home.json";
import enAboutJson from "../../data/en/about.json";
import enFactoryJson from "../../data/en/factory.json";
import enEquipmentJson from "../../data/en/equipment.json";
import enContactJson from "../../data/en/contact.json";
import enProductsJson from "../../data/en/products-data.json";
import ruHomeJson from "../../data/ru/home.json";
import ruAboutJson from "../../data/ru/about.json";
import ruFactoryJson from "../../data/ru/factory.json";
import ruEquipmentJson from "../../data/ru/equipment.json";
import ruContactJson from "../../data/ru/contact.json";
import ruProductsJson from "../../data/ru/products-data.json";
import esHomeJson from "../../data/es/home.json";
import esAboutJson from "../../data/es/about.json";
import esFactoryJson from "../../data/es/factory.json";
import esEquipmentJson from "../../data/es/equipment.json";
import esContactJson from "../../data/es/contact.json";
import esProductsJson from "../../data/es/products-data.json";

const localizedData = {
  en: {
    home: enHomeJson,
    about: enAboutJson,
    factory: enFactoryJson,
    equipment: enEquipmentJson,
    contact: enContactJson,
    products: enProductsJson,
  },
  ru: {
    home: ruHomeJson,
    about: ruAboutJson,
    factory: ruFactoryJson,
    equipment: ruEquipmentJson,
    contact: ruContactJson,
    products: ruProductsJson,
  },
  es: {
    home: esHomeJson,
    about: esAboutJson,
    factory: esFactoryJson,
    equipment: esEquipmentJson,
    contact: esContactJson,
    products: esProductsJson,
  },
} as const;

type SupportedLocale = keyof typeof localizedData;
type LocalizedDataset = (typeof localizedData)[SupportedLocale];
type LocalizedKey = keyof LocalizedDataset;

function getLocaleKey(locale: string): SupportedLocale {
  if (locale === "ru") return "ru";
  if (locale === "es") return "es";
  return "en";
}

function loadJson<T>(locale: string, key: LocalizedKey): T {
  return localizedData[getLocaleKey(locale)][key] as T;
}

function loadSharedJson<T>(): T {
  return siteJson as T;
}

export function getSiteData(locale: string) {
  const siteData = structuredClone(loadSharedJson<any>());
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
  return loadJson<any>(locale, "home");
}

export function getAboutData(locale: string) {
  return loadJson<any>(locale, "about");
}

export function getFactoryData(locale: string) {
  return loadJson<any>(locale, "factory");
}

export function getEquipmentData(locale: string) {
  return loadJson<any>(locale, "equipment");
}

export function getContactData(locale: string) {
  return loadJson<any>(locale, "contact");
}

export function getProductsData(locale: string = "en") {
  return loadJson<any>(locale, "products");
}
