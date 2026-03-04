import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProductsData } from "@/lib/data";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import ImageGallery from "@/components/ui/ImageGallery/ImageGallery";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.css";

export function generateStaticParams() {
  const data = getProductsData();
  return routing.locales.flatMap((locale) =>
    data.products.map((p: any) => ({ locale, id: String(p.id) }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const data = getProductsData();
  const product = data.products.find((p: any) => String(p.id) === id);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | Lihe Precision`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");
  const data = getProductsData();

  const product = data.products.find((p: any) => String(p.id) === id);

  if (!product) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumbHome"), href: "/" },
            { label: t("title"), href: "/products" },
            { label: product.name },
          ]}
        />

        <div className={styles.layout}>
          <div className={styles.galleryColumn}>
            <ImageGallery images={product.images} />
          </div>

          <div className={styles.infoColumn}>
            <span className={styles.categoryBadge}>{product.category}</span>
            <h1 className={styles.productName}>{product.name}</h1>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.actions}>
              <Button href="/contact" variant="primary" size="lg">
                {t("requestQuote")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
