import enNewsJson from "../../data/en/news.json";
import ruNewsJson from "../../data/ru/news.json";
import esNewsJson from "../../data/es/news.json";

export type NewsTable = {
  head: string[];
  rows: string[][];
};

export type NewsSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  steps?: string[];
  table?: NewsTable;
};

export type NewsFaq = {
  question: string;
  answer: string;
};

export type NewsImage = {
  src: string;
  alt: string;
};

export type NewsArticle = {
  slug: string;
  date: string;
  updated?: string;
  category: string;
  title: string;
  summary: string;
  heroImage?: NewsImage;
  detailImage?: NewsImage;
  ogImage?: string;
  relatedProducts?: number[];
  sections: NewsSection[];
  faq?: NewsFaq[];
};

const newsByLocale: Record<string, { articles: NewsArticle[] }> = {
  en: enNewsJson as { articles: NewsArticle[] },
  ru: ruNewsJson as { articles: NewsArticle[] },
  es: esNewsJson as { articles: NewsArticle[] },
};

function sortByDateDesc(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date));
}

export function getNewsArticles(locale: string): NewsArticle[] {
  const data = newsByLocale[locale] ?? newsByLocale.en;
  return sortByDateDesc(data.articles);
}

export function getNewsArticle(locale: string, slug: string): NewsArticle | undefined {
  return getNewsArticles(locale).find((article) => article.slug === slug);
}

/** Slugs are shared across locales; English is the source of truth. */
export function getNewsSlugs(): string[] {
  return newsByLocale.en.articles.map((article) => article.slug);
}

export function getNewsPath(slug?: string): string {
  return slug ? `/news/${slug}` : "/news";
}

const DATE_LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  ru: "ru-RU",
  es: "es-ES",
};

export function formatNewsDate(locale: string, isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(DATE_LOCALE_MAP[locale] ?? "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
