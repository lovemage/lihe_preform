import { routing } from "@/i18n/routing";

function normalizePagePath(pagePath: string): string {
  if (!pagePath || pagePath === "/") return "";
  const withLeadingSlash = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

export function buildLocalePath(locale: string, pagePath: string): string {
  const normalized = normalizePagePath(pagePath);
  return `/${locale}${normalized}/`;
}

export function getLocaleAlternates(locale: string, pagePath: string) {
  const languages = Object.fromEntries(
    routing.locales.map((lang) => [lang, buildLocalePath(lang, pagePath)]),
  );

  return {
    canonical: buildLocalePath(locale, pagePath),
    languages: {
      ...languages,
      "x-default": buildLocalePath(routing.defaultLocale, pagePath),
    },
  };
}

const OPEN_GRAPH_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  ru: "ru_RU",
  es: "es_ES",
};

export function getOpenGraphLocale(locale: string): string {
  return OPEN_GRAPH_LOCALE_MAP[locale] ?? OPEN_GRAPH_LOCALE_MAP.en;
}

export function getOpenGraphAlternateLocales(locale: string): string[] {
  return routing.locales
    .filter((lang) => lang !== locale)
    .map((lang) => getOpenGraphLocale(lang));
}

export const META_DESCRIPTION_MIN = 150;
export const META_DESCRIPTION_MAX = 160;

export function clampDescription(text: string, maxLength = META_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const sliced = clean.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  // Cut on a word boundary only when it still leaves at least META_DESCRIPTION_MIN characters.
  const minCut = Math.min(META_DESCRIPTION_MIN, maxLength - 10);
  const safeSlice = lastSpace >= minCut ? sliced.slice(0, lastSpace) : sliced;
  return `${safeSlice.trim().replace(/[\s,;:–—-]+$/, "")}…`;
}

/**
 * Meta description from real page content: joins the given parts in order until the text
 * reaches META_DESCRIPTION_MIN characters, then trims it to META_DESCRIPTION_MAX.
 */
export function buildMetaDescription(...parts: Array<string | null | undefined>): string {
  let text = "";
  for (const part of parts) {
    const clean = (part ?? "").replace(/\s+/g, " ").trim();
    if (!clean || text.includes(clean)) continue;
    if (text.length >= META_DESCRIPTION_MIN) break;
    const joined = /[.!?…:;。]$/.test(text) ? text : `${text}.`;
    text = text ? `${joined} ${clean}` : clean;
  }
  return clampDescription(text);
}

export function getProductMetaTitle(name: string, categoryName?: string): string {
  const includesCategory =
    !categoryName || name.toLowerCase().includes(categoryName.toLowerCase());
  const category = categoryName
    ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
    : "";
  return includesCategory
    ? `${name} | Lihe Precision`
    : `${name} – ${category} | Lihe Precision`;
}
