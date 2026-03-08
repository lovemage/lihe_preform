import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProductsData } from "@/lib/data";
import {
  clampDescription,
  getLocaleAlternates,
  getProductMetaTitle,
} from "@/lib/seo";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import ImageGallery from "@/components/ui/ImageGallery/ImageGallery";
import Button from "@/components/ui/Button/Button";
import JsonLd from "@/components/seo/JsonLd";
import styles from "./page.module.css";

export const revalidate = 3600;

export function generateStaticParams() {
  const data = getProductsData("en");
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
  const data = getProductsData(locale);
  const product = data.products.find((p: any) => String(p.id) === id);

  if (!product) {
    return {
      title: "Product Not Found",
      alternates: getLocaleAlternates(locale, `/products/${id}`),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: getProductMetaTitle(product.name, id),
    description: clampDescription(`${product.description} Model ${id}.`),
    alternates: getLocaleAlternates(locale, `/products/${id}`),
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
  const data = getProductsData(locale);

  const product = data.products.find((p: any) => String(p.id) === id);

  if (!product) {
    notFound();
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: String(product.id),
    mpn: String(product.id),
    category: product.category,
    url: `https://lihe-preform.com/${locale}/products/${id}/`,
    description: product.description,
    image: product.images.map(
      (img: any) => `https://lihe-preform.com${img.src}`
    ),
    brand: {
      "@type": "Brand",
      name: "Lihe Precision",
    },
    manufacturer: {
      "@type": "Organization",
      name: "Foshan Lihe Precision Machinery Co.,Ltd.",
    },
  };

  return (
    <div className={styles.page}>
      <JsonLd data={productJsonLd} />
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
