import { routing } from "@/i18n/routing";

function normalizePagePath(pagePath: string): string {
  if (!pagePath || pagePath === "/") return "";
  const withLeadingSlash = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function buildLocalePath(locale: string, pagePath: string): string {
  const normalized = normalizePagePath(pagePath);
  return normalized ? `/${locale}${normalized}` : `/${locale}`;
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

export function clampDescription(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const sliced = clean.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const safeSlice = lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced;
  return `${safeSlice.trim()}…`;
}

export function getProductMetaTitle(name: string, id: string): string {
  return `${name} (Model ${id}) | Lihe Precision`;
}
