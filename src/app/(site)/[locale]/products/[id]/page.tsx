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
import ProductGrid from "@/components/products/ProductGrid";
import { Link } from "@/i18n/navigation";
import { getCategoryByName, getCategoryPath } from "@/lib/categories";
import styles from "./page.module.css";
import PageGuide from "@/components/content/PageGuide";
import AiImageNotice from "@/components/ui/AiImageNotice/AiImageNotice";

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
  const t = await getTranslations("products");

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
    title: id === "19" ? t("preformMetaTitle") : getProductMetaTitle(product.name, getCategoryByName(locale, product.category)?.name),
    description: id === "19" ? t("preformMetaDescription") : clampDescription(product.description),
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

  const category = getCategoryByName(locale, product.category);
  const relatedProducts = data.products
    .filter((p: any) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const productUrl = `https://lihe-preform.com/${locale}/products/${id}/`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: String(product.id),
    mpn: String(product.id),
    category: product.category,
    url: productUrl,
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
            ...(category
              ? [{ label: product.category, href: getCategoryPath(category.slug) }]
              : []),
            { label: product.name },
          ]}
        />

        <div className={styles.layout}>
          <div className={styles.galleryColumn}>
            <ImageGallery images={product.images} />
            <AiImageNotice />
          </div>

          <div className={styles.infoColumn}>
            {category ? (
              <Link href={getCategoryPath(category.slug)} className={styles.categoryBadge}>
                {product.category}
              </Link>
            ) : (
              <span className={styles.categoryBadge}>{product.category}</span>
            )}
            <h1 className={styles.productName}>{product.name}</h1>
            <p className={styles.description}>{id === "19" ? t("preformIntro") : product.description}</p>
            {id === "19" ? (
              <table className={styles.specifications}>
                <caption>{t("preformSpecificationsTitle")}</caption>
                <tbody>
                  {(t.raw("preformSpecifications") as { label: string; value: string }[]).map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : product.bullets && product.bullets.length > 0 && (
              <ul className={styles.bulletList}>
                {product.bullets.map((bullet: string) => (
                  <li key={bullet} className={styles.bulletItem}>{bullet}</li>
                ))}
              </ul>
            )}
            <div className={styles.actions}>
              <Button href={`/contact/?product=${product.id}`} variant="primary" size="lg">
                {t("requestQuote")}
              </Button>
            </div>
            {id === "19" && (
              <div className={styles.quoteChecklist}>
                <h2>{t("preformQuoteTitle")}</h2>
                <p>{t("preformQuoteChecklist")}</p>
                <Link href="/equipment/qc/">{t("preformQualityLink")}</Link>
              </div>
            )}
            <p className={styles.directContact}>{t("directContact")}</p>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>{t("relatedProducts")}</h2>
            <ProductGrid products={relatedProducts} viewDetailsLabel={t("viewDetails")} />
            <AiImageNotice />
          </section>
        )}
      </div>
      <PageGuide locale={locale} guideKey={`product-${id}`} />
    </div>
  );
}
