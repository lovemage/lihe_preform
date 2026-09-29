import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getHomeData, getProductsData } from "@/lib/data";
import { getLocaleAlternates } from "@/lib/seo";
import HeroBanner from "@/components/home/HeroBanner";
import Stats from "@/components/home/Stats";
import MoldHighlights from "@/components/home/MoldHighlights";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";

// Curated for the home page: one visually distinct product shot per card.
// The first ID is rendered as the large feature card.
const FEATURED_PRODUCT_IDS = [19, 21, 20, 22, 25, 31, 27, 28, 38];

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
  const productsById = new Map(
    productsData.products.map((p: { id: number }) => [p.id, p]),
  );
  const seenThumbnails = new Set<string>();
  const featuredProducts = FEATURED_PRODUCT_IDS.map((id) => productsById.get(id))
    .filter((p): p is (typeof productsData.products)[number] => Boolean(p))
    .filter((p) => {
      if (seenThumbnails.has(p.thumbnail.src)) return false;
      seenThumbnails.add(p.thumbnail.src);
      return true;
    });

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
        headline={t("headline")}
        subheadline={t("subheadline")}
        ctaLabel={t("exploreProducts")}
        ctaHref="/products"
        ctaSecondaryLabel={t("contactSales")}
        ctaSecondaryHref="/contact"
        skipLabel={t("skipIntro")}
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
        products={featuredProducts}
        title={t("featuredProducts")}
        subtitle={t("featuredProductsSub")}
        moreLabel={t("more")}
        viewAllLabel={t("viewAllProducts")}
      />
    </>
  );
}
