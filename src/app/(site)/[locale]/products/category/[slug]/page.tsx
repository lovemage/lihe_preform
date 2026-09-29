import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProductsData } from "@/lib/data";
import {
  getCategoryBySlug,
  getCategoryPath,
  getProductCategories,
} from "@/lib/categories";
import { clampDescription, getLocaleAlternates } from "@/lib/seo";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import CategoryFilter from "@/components/products/CategoryFilter";
import ProductGrid from "@/components/products/ProductGrid";
import styles from "../../page.module.css";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getProductCategories(locale).map((category) => ({ locale, slug: category.slug }))
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const category = getCategoryBySlug(locale, slug);

  if (!category) {
    return { title: "Category Not Found", robots: { index: false, follow: false } };
  }

  return {
    title: `${capitalize(category.name)} | Lihe Precision`,
    description: clampDescription(category.description || category.short),
    alternates: getLocaleAlternates(locale, getCategoryPath(slug)),
  };
}

export default async function ProductCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const category = getCategoryBySlug(locale, slug);

  if (!category) {
    notFound();
  }

  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");
  const products = getProductsData(locale).products.filter(
    (product: any) => product.category === category.name
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumbHome"), href: "/" },
            { label: t("title"), href: "/products" },
            { label: capitalize(category.name) },
          ]}
        />

        <div className={styles.headingWrapper}>
          <SectionHeading title={capitalize(category.name)} as="h1" variant="none" />
          {category.description && (
            <p className={styles.categoryIntro}>{category.description}</p>
          )}
        </div>

        <CategoryFilter
          categories={getProductCategories(locale)}
          activeSlug={slug}
          allLabel={t("allCategories")}
        />
        <ProductGrid products={products} viewDetailsLabel={t("viewDetails")} />
      </div>
    </div>
  );
}
