import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAboutData } from "@/lib/data";
import { clampDescription, getLocaleAlternates } from "@/lib/seo";
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
  const t = await getTranslations("about");

  return {
    title: `${t("title")} | Lihe Precision`,
    description: clampDescription(t("metaDescription")),
    alternates: getLocaleAlternates(locale, "/about"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tCommon = await getTranslations("common");
  const data = getAboutData(locale);

  const whyIcons = ["01", "02", "03"];

  return (
    <div className={styles.page}>
      {/* Banner */}
      <section className={styles.banner}>
        <Image
          src={data.banner.src}
          alt={data.banner.alt}
          fill
          priority
          className={styles.bannerImage}
        />
        <div className={styles.bannerOverlay}>
          <div className={styles.bannerContent}>
            <h1 className={styles.bannerTitle}>{t("title")}</h1>
            <p className={styles.bannerHeadline}>{t("headline")}</p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumbHome"), href: "/" },
            { label: t("title") },
          ]}
        />
      </div>

      {/* Company Introduction */}
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading title={t("companyIntroHeading")} />
          <div className={styles.introContent}>
            <p className={styles.introParagraph}>{data.companyIntro}</p>
            <p className={styles.introParagraph}>{data.philosophy}</p>
          </div>
          <div className={styles.businessBlock}>
            <p className={styles.businessText}>{data.business}</p>
          </div>
        </div>
      </section>

      {/* Why Lihe */}
      <section className={`${styles.section} ${styles.whySection}`}>
        <div className={styles.container}>
          <SectionHeading
            title={t("whyLiheHeading")}
            subtitle={t("whyLiheSub")}
          />
          <div className={styles.whyGrid}>
            {data.whyLihe.map(
              (
                item: { title: string; description: string },
                index: number
              ) => (
                <div key={index} className={styles.whyCard}>
                  <div className={styles.whyIcon}>{whyIcons[index]}</div>
                  <h3 className={styles.whyTitle}>{item.title}</h3>
                  <p className={styles.whyDescription}>{item.description}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading
            title={t("valuesHeading")}
            subtitle={t("valuesSub")}
          />
          <div className={styles.valuesGrid}>
            {data.values.map(
              (
                value: {
                  title: string;
                  subtitle: string;
                  description: string;
                },
                index: number
              ) => (
                <div
                  key={index}
                  className={`${styles.valueCard} ${index % 2 === 1 ? styles.valueCardAlt : ""}`}
                >
                  <div className={styles.valueHeader}>
                    <h3 className={styles.valueTitle}>{value.title}</h3>
                    <p className={styles.valueSubtitle}>{value.subtitle}</p>
                  </div>
                  <p className={styles.valueDescription}>
                    {value.description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
