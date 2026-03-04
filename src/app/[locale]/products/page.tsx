import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProductsData } from "@/lib/data";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import ProductsClientWrapper from "@/components/products/ProductsClientWrapper";
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
    title: `${t("title")} | Lihe Precision`,
    description:
      "Explore our comprehensive range of precision PET molds including preform molds, blow molds, compression molds, closure molds, and hotrunner systems.",
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
  const data = getProductsData();

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
          <SectionHeading title={t("title")} />
        </div>

        <ProductsClientWrapper
          products={data.products}
          categories={data.categories}
          allCategoriesLabel={t("allCategories")}
          viewDetailsLabel={t("viewDetails")}
        />
      </div>
    </div>
  );
}
