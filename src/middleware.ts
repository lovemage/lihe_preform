import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { getCategoryPath, resolveCategoryParam } from "./lib/categories";

const intlMiddleware = createMiddleware(routing);

const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join("|")})(/|$)`);
const PRODUCTS_LIST = new RegExp(`^(?:/(${routing.locales.join("|")}))?/products/?$`);

function permanentRedirect(request: NextRequest, pathname: string, search = "") {
  // Plain URL: NextURL re-applies its own trailing-slash formatting and would drop the slash.
  const url = new URL(request.url);
  url.pathname = pathname.endsWith("/") ? pathname : `${pathname}/`;
  url.search = search;
  return NextResponse.redirect(url.toString(), 301);
}

export default function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Static files in /public (e.g. the Yandex verification page) must be served as-is.
  const isFile = /\.[^/]+$/.test(pathname);
  if (isFile || pathname.startsWith("/api/")) {
    return;
  }

  if (pathname.startsWith("/admin")) {
    if (!pathname.endsWith("/")) {
      return permanentRedirect(request, pathname, request.nextUrl.search);
    }
    return;
  }

  // Legacy `/products?category=<any variant>` → one canonical category path.
  const productsList = pathname.match(PRODUCTS_LIST);
  if (productsList && searchParams.has("category")) {
    const locale = productsList[1] ?? routing.defaultLocale;
    const slug = resolveCategoryParam(searchParams.get("category") ?? "");
    const rest = new URLSearchParams(searchParams);
    rest.delete("category");
    const search = rest.toString();
    return permanentRedirect(
      request,
      `/${locale}${slug ? getCategoryPath(slug) : "/products"}`,
      search ? `?${search}` : "",
    );
  }

  // Locale-less page URLs → default locale, permanently (the site root keeps locale detection).
  if (pathname !== "/" && !LOCALE_PREFIX.test(pathname)) {
    return permanentRedirect(request, `/${routing.defaultLocale}${pathname}`, request.nextUrl.search);
  }

  // Trailing-slash rule (next.config `trailingSlash: true`, redirect skipped there): one 301.
  if (!pathname.endsWith("/")) {
    return permanentRedirect(request, pathname, request.nextUrl.search);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico|robots.txt|sitemap.xml).*)"],
};
