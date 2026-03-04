import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getSiteData } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
  const siteData = getSiteData();

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

  return (
    <NextIntlClientProvider messages={messages}>
      <JsonLd data={organizationJsonLd} />
      <Header siteData={siteData} />
      <main>{children}</main>
      <Footer siteData={siteData} />
    </NextIntlClientProvider>
  );
}
