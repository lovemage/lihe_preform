import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProductsData } from "@/lib/data";
import { getLocaleAlternates } from "@/lib/seo";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import CategoryFilter from "@/components/products/CategoryFilter";
import ProductGrid from "@/components/products/ProductGrid";
import { getProductCategories } from "@/lib/categories";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: getLocaleAlternates(locale, "/products"),
  };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");
  const data = getProductsData(locale);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumbHome"), href: "/" },
            { label: t("title") },
          ]}
        />

        <div className={styles.headingWrapper}>
          <SectionHeading title={t("title")} as="h1" variant="none" />
        </div>

        <CategoryFilter
          categories={getProductCategories(locale)}
          activeSlug={null}
          allLabel={t("allCategories")}
        />
        <ProductGrid products={data.products} viewDetailsLabel={t("viewDetails")} />
      </div>
    </div>
  );
}
