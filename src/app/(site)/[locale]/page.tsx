import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getHomeData, getProductsData } from "@/lib/data";
import { getLocaleAlternates } from "@/lib/seo";
import HeroBanner from "@/components/home/HeroBanner";
import Stats from "@/components/home/Stats";
import MoldHighlights from "@/components/home/MoldHighlights";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: getLocaleAlternates(locale, ""),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tStats = await getTranslations("stats");
  const homeData = getHomeData(locale);
  const productsData = getProductsData(locale);

  const statsTranslationKeys = [
    "facility",
    "cavities",
    "countries",
    "experience",
  ] as const;

  const stats = homeData.stats.map((s: { value: string; label: string }, index: number) => ({
    value: s.value,
    label: tStats(statsTranslationKeys[index] ?? s.label),
  }));

  return (
    <>
      <HeroBanner
        banners={homeData.banners}
        headline={t("headline")}
        subheadline={t("subheadline")}
        ctaLabel={t("exploreProducts")}
        ctaHref="/products"
        ctaSecondaryLabel={t("contactSales")}
        ctaSecondaryHref="/contact"
      />
      <Stats stats={stats} />
      <MoldHighlights
        title={homeData.moldHighlights.title}
        description={homeData.moldHighlights.description}
        accordionTitle={homeData.moldHighlights.accordionTitle}
        items={homeData.moldHighlights.items}
      />
      <CategoryShowcase
        categories={homeData.showcaseCategories}
        title={t("coreCapabilities")}
        subtitle={t("coreCapabilitiesSub")}
      />
      <FeaturedProducts
        products={productsData.products.slice(0, 8)}
        title={t("featuredProducts")}
        subtitle={t("featuredProductsSub")}
      />
    </>
  );
}
