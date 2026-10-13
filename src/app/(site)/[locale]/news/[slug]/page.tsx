import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getProductsData } from "@/lib/data";
import { clampDescription, getLocaleAlternates } from "@/lib/seo";
import {
  formatNewsDate,
  getNewsArticle,
  getNewsPath,
  getNewsSlugs,
} from "@/lib/news";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import Button from "@/components/ui/Button/Button";
import JsonLd from "@/components/seo/JsonLd";
import RichContent from "@/components/content/RichContent";
import styles from "./page.module.css";
import AiImageNotice from "@/components/ui/AiImageNotice/AiImageNotice";

const BASE_URL = "https://lihe-preform.com";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getNewsSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = getNewsArticle(locale, slug);

  if (!article) {
    return {
      title: "Article Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${article.title} | Lihe Precision`,
    description: clampDescription(article.summary),
    alternates: getLocaleAlternates(locale, getNewsPath(slug)),
    openGraph: {
      type: "article",
      title: article.title,
      description: clampDescription(article.summary),
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
      ...(article.ogImage
        ? { images: [{ url: `${BASE_URL}${article.ogImage}`, width: 1200, height: 630 }] }
        : {}),
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const tCommon = await getTranslations("common");
  const article = getNewsArticle(locale, slug);

  if (!article) {
    notFound();
  }

  const articleUrl = `${BASE_URL}/${locale}${getNewsPath(slug)}/`;
  const products = getProductsData(locale).products;
  const relatedProducts = (article.relatedProducts ?? [])
    .map((id) => products.find((p: any) => p.id === id))
    .filter(Boolean);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    inLanguage: locale,
    mainEntityOfPage: articleUrl,
    image: [article.heroImage, article.detailImage]
      .filter(Boolean)
      .map((image) => `${BASE_URL}${image!.src}`),
    author: {
      "@type": "Organization",
      name: "LIHE Precision Engineering Team",
      url: BASE_URL,
      parentOrganization: {
        "@type": "Organization",
        name: "Foshan Lihe Precision Machinery Co.,Ltd.",
      },
    },
    ...(article.sources?.length
      ? { citation: article.sources.map((source) => source.url) }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "Foshan Lihe Precision Machinery Co.,Ltd.",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/images/logo/logo.webp`,
      },
    },
  };

  const faqJsonLd = article.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tCommon("breadcrumbHome"), item: `${BASE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${BASE_URL}/${locale}/news/` },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <div className={styles.page}>
      <JsonLd data={articleJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <JsonLd data={breadcrumbJsonLd} />
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumbHome"), href: "/" },
            { label: t("title"), href: "/news" },
            { label: article.title },
          ]}
        />

        <article className={styles.article}>
          <header className={styles.header}>
            <p className={styles.meta}>
              <span className={styles.category}>{article.category}</span>
              <span>
                {t("published")}{" "}
                <time dateTime={article.date}>{formatNewsDate(locale, article.date)}</time>
              </span>
              <span>{t("author")}</span>
              {article.updated && article.updated !== article.date && (
                <span>
                  {t("updated")}{" "}
                  <time dateTime={article.updated}>{formatNewsDate(locale, article.updated)}</time>
                </span>
              )}
            </p>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.summary}>{article.summary}</p>
          </header>

          {article.heroImage && (
            <figure className={styles.hero}>
              <Image
                src={article.heroImage.src}
                alt={article.heroImage.alt}
                width={1600}
                height={904}
                priority
                sizes="(max-width: 860px) 100vw, 820px"
              />
              <AiImageNotice as="figcaption" />
            </figure>
          )}

          <RichContent
            sections={article.sections}
            faq={article.faq}
            sources={article.sources}
            insertAfter={
              article.detailImage
                ? {
                    index: 1,
                    node: (
                      <figure className={styles.figure}>
                        <Image
                          src={article.detailImage.src}
                          alt={article.detailImage.alt}
                          width={1600}
                          height={904}
                          sizes="(max-width: 860px) 100vw, 820px"
                        />
                        <AiImageNotice as="figcaption" />
                      </figure>
                    ),
                  }
                : undefined
            }
          />

          {relatedProducts.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>{t("relatedProducts")}</h2>
              <ul className={styles.list}>
                {relatedProducts.map((product: any) => (
                  <li key={product.id}>
                    <Link href={`/products/${product.id}`}>{product.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className={styles.cta}>
            <p>{t("ctaText")}</p>
            <Button href="/contact" variant="primary" size="lg">
              {t("ctaButton")}
            </Button>
          </div>

          <Link href="/news" className={styles.back}>
            ← {t("backToNews")}
          </Link>
        </article>
      </div>
    </div>
  );
}
