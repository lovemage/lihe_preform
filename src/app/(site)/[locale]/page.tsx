import { getTranslations, setRequestLocale } from "next-intl/server";
import { getHomeData, getProductsData } from "@/lib/data";
import { getLocaleAlternates } from "@/lib/seo";
import HeroBanner from "@/components/home/HeroBanner";
import Stats from "@/components/home/Stats";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return {
    title: "Lihe Precision | PET Preform Mold & Blow Mold Engineering",
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
  const homeData = getHomeData();
  const productsData = getProductsData();

  const statsLabelMap: Record<string, string> = {
    "sqm Production Facility": "facility",
    "Max Cavities Per Mold": "cavities",
    "Countries Served": "countries",
    "Years of Experience": "experience",
  };

  const stats = homeData.stats.map((s: { value: string; label: string }) => ({
    value: s.value,
    label: tStats(statsLabelMap[s.label] ?? s.label),
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
