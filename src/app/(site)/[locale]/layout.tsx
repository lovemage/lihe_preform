import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getSiteData } from "@/lib/data";
import { getOpenGraphAlternateLocales, getOpenGraphLocale } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import YandexMetrica from "@/components/analytics/YandexMetrica";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const keywordsMap: Record<string, string[]> = {
    en: [
      "PET preform mold",
      "blow mold",
      "hot runner system",
      "multi-cavity mold",
      "preform tooling",
      "injection molding machine",
      "compression mold",
      "closure mold",
      "beverage packaging solutions",
      "PET mold manufacturer",
    ],
    ru: [
      "пресс-форма для ПЭТ-преформ",
      "выдувная форма",
      "горячеканальная система",
      "многогнездная пресс-форма",
      "оснастка для преформ",
      "термопластавтомат",
      "компрессионная форма",
      "форма для колпачков",
      "упаковка для напитков",
      "производитель пресс-форм для ПЭТ",
      "пресс-формы для HUSKY",
      "формы для NETSTAL",
      "формы для ПЭТ-бутылок для воды",
      "пресс-формы для пищевой упаковки",
    ],
    es: [
      "PET preform mold",
      "blow mold",
      "hot runner system",
      "multi-cavity mold",
      "preform tooling",
      "injection molding machine",
      "compression mold",
      "closure mold",
      "beverage packaging solutions",
      "PET mold manufacturer",
    ],
  };

  return {
    metadataBase: new URL("https://lihe-preform.com"),
    title: {
      default: "Lihe Precision | PET Preform Mold & Blow Mold Engineering",
      template: "%s",
    },
    description:
      "High-performance PET preform molds, blow molds, compression molds, closure molds, and hot runner systems. Multi-cavity mold manufacturer serving beverage packaging industries across 50+ countries.",
    keywords: keywordsMap[locale] ?? keywordsMap.en,
    icons: {
      icon: [
        {
          url: "/images/logo/favicon.png",
          type: "image/png",
          sizes: "any",
        },
      ],
      shortcut: ["/images/logo/favicon.png"],
      apple: ["/images/logo/favicon.png"],
    },
    openGraph: {
      type: "website",
      siteName: "Lihe Precision Machinery",
      images: [
        {
          url: "/images/banners/banner1.webp",
          width: 1920,
          height: 1080,
          alt: "Lihe Precision PET mold manufacturing",
        },
      ],
      locale: getOpenGraphLocale(locale),
      alternateLocale: getOpenGraphAlternateLocales(locale),
    },
    twitter: {
      card: "summary_large_image",
      images: ["/images/banners/banner1.webp"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const siteData = getSiteData(locale);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Foshan Lihe Precision Machinery Co.,Ltd.",
    url: "https://lihe-preform.com",
    logo: "https://lihe-preform.com/images/logo/logo.webp",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+886-938-198-675",
      email: "sales@lihe-preform.com",
      contactType: "sales",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Building B7, Shichuang Health Science and Technology Park, No. 1, Meitu 3rd Road",
      addressLocality: "Foshan",
      addressRegion: "Guangdong",
      addressCountry: "CN",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lihe Precision Machinery",
    url: "https://lihe-preform.com",
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: "Foshan Lihe Precision Machinery Co.,Ltd.",
      logo: {
        "@type": "ImageObject",
        url: "https://lihe-preform.com/images/logo/logo.webp",
      },
    },
  };

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <JsonLd data={organizationJsonLd} />
          <JsonLd data={websiteJsonLd} />
          <Header siteData={siteData} />
          <main lang={locale}>{children}</main>
          <Footer siteData={siteData} />
          <YandexMetrica />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
