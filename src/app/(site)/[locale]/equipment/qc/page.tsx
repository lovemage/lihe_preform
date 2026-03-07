import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getEquipmentData } from "@/lib/data";
import { clampDescription, getLocaleAlternates } from "@/lib/seo";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import ImageGallery from "@/components/ui/ImageGallery/ImageGallery";
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
  const t = await getTranslations("equipment");
  const data = getEquipmentData(locale);
  const category = data.categories[0];

  return {
    title: `${category.name} | Lihe Precision`,
    description: clampDescription(t("metaDescriptionQc")),
    alternates: getLocaleAlternates(locale, "/equipment/qc"),
  };
}

export default async function QCEquipmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("equipment");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const data = getEquipmentData(locale);
  const category = data.categories[0];

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
            <h1 className={styles.bannerTitle}>{category.name}</h1>
            <p className={styles.bannerHeadline}>{t("headline")}</p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumbHome"), href: "/" },
            { label: t("title"), href: "/equipment" },
            { label: tNav("qcEquipment") },
          ]}
        />
      </div>

      {/* Description */}
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.description}>{category.description}</p>
        </div>
      </section>

      {/* Highlights */}
      <section className={`${styles.section} ${styles.highlightsSection}`}>
        <div className={styles.container}>
          <SectionHeading
            title="Key Capabilities"
            subtitle="Our quality control equipment and systems"
          />
          <ul className={styles.highlightsList}>
            {category.highlights.map((highlight: string, index: number) => (
              <li key={index} className={styles.highlightItem}>
                <span className={styles.checkIcon}>&#10003;</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Gallery */}
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading
            title="Equipment Gallery"
            subtitle="See our QC systems in action"
          />
          <div className={styles.galleryWrapper}>
            <ImageGallery images={category.images} />
          </div>
        </div>
      </section>
    </div>
  );
}
