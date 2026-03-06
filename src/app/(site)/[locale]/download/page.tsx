import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getLocaleAlternates } from "@/lib/seo";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import Button from "@/components/ui/Button/Button";
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
  const t = await getTranslations("download");

  return {
    title: `${t("title")} | Lihe Precision`,
    description: t("subtitle"),
    alternates: getLocaleAlternates(locale, "/download"),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("download");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumbHome"), href: "/" },
            { label: tNav("download") },
          ]}
        />

        <div className={styles.headingWrapper}>
          <SectionHeading title={t("title")} subtitle={t("subtitle")} as="h1" />
        </div>

        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <p className={styles.placeholderText}>{t("placeholder")}</p>
          <Button href="/contact" variant="primary" size="lg">
            {t("contactUs")}
          </Button>
        </div>
      </div>
    </div>
  );
}
