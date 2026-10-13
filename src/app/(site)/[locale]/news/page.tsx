import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { clampDescription, getLocaleAlternates } from "@/lib/seo";
import { formatNewsDate, getNewsArticles, getNewsPath } from "@/lib/news";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
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
  const t = await getTranslations("news");

  return {
    title: t("metaTitle"),
    description: clampDescription(t("metaDescription")),
    alternates: getLocaleAlternates(locale, "/news"),
  };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");
  const tCommon = await getTranslations("common");
  const articles = getNewsArticles(locale);

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
          <SectionHeading title={t("title")} subtitle={t("subtitle")} as="h1" variant="none" />
        </div>

        <ul className={styles.list}>
          {articles.map((article) => (
            <li key={article.slug} className={styles.item}>
              <article className={styles.card}>
                {article.heroImage && (
                  <Link href={getNewsPath(article.slug)} className={styles.thumb} tabIndex={-1} aria-hidden="true">
                    <Image
                      src={article.heroImage.src}
                      alt=""
                      width={480}
                      height={271}
                      sizes="(max-width: 640px) 100vw, 280px"
                    />
                  </Link>
                )}
                <div className={styles.cardBody}>
                  <p className={styles.meta}>
                    <span className={styles.category}>{article.category}</span>
                    <time dateTime={article.date}>{formatNewsDate(locale, article.date)}</time>
                  </p>
                  <h2 className={styles.itemTitle}>
                    <Link href={getNewsPath(article.slug)}>{article.title}</Link>
                  </h2>
                  <p className={styles.summary}>{article.summary}</p>
                  <Link href={getNewsPath(article.slug)} className={styles.readMore}>
                    {t("readMore")}
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
