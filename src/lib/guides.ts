import enGuidesJson from "../../data/en/guides.json";
import ruGuidesJson from "../../data/ru/guides.json";
import esGuidesJson from "../../data/es/guides.json";
import type { NewsFaq, NewsSection, NewsSource } from "./news";

export type PageGuide = {
  key: string;
  updated: string;
  heading: string;
  intro: string;
  sections: NewsSection[];
  faq: NewsFaq[];
  sources: NewsSource[];
};

type GuideFile = { guides: Record<string, PageGuide> };

const guidesByLocale: Record<string, GuideFile> = {
  en: enGuidesJson as GuideFile,
  ru: ruGuidesJson as GuideFile,
  es: esGuidesJson as GuideFile,
};

/** Guide keys: `page-<name>`, `product-<id>`, `category-<slug>`. */
export function getPageGuide(locale: string, key: string): PageGuide | undefined {
  return (guidesByLocale[locale] ?? guidesByLocale.en).guides[key];
}
