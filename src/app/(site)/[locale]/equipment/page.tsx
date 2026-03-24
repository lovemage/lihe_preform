import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getEquipmentData } from "@/lib/data";
import { clampDescription, getLocaleAlternates } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
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
  const t = await getTranslations("equipment");

  return {
    title: `${t("title")} | Lihe Precision`,
    description: clampDescription(t("metaDescription")),
    alternates: getLocaleAlternates(locale, "/equipment"),
  };
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("equipment");
  const tCommon = await getTranslations("common");
  const data = getEquipmentData(locale);

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

      {/* Intro */}
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.intro}>{data.intro}</p>
        </div>
      </section>

      {/* Category Cards */}
      <section className={`${styles.section} ${styles.categoriesSection}`}>
        <div className={styles.container}>
          <SectionHeading
            title={t("ourEquipment")}
            subtitle={t("ourEquipmentSub")}
            variant="subtle"
          />
          <div className={styles.categoryGrid}>
            {data.categories.map(
              (cat: {
                id: string;
                name: string;
                description: string;
                images: { src: string; alt: string }[];
              }) => (
                <Link
                  key={cat.id}
                  href={`/equipment/${cat.id}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryImageWrapper}>
                    <Image
                      src={cat.images[0].src}
                      alt={cat.images[0].alt}
                      width={600}
                      height={400}
                      className={styles.categoryImage}
                    />
                  </div>
                  <div className={styles.categoryContent}>
                    <h2 className={styles.categoryName}>{cat.name}</h2>
                    <p className={styles.categoryDescription}>
                      {cat.description.slice(0, 180)}...
                    </p>
                    <span className={styles.categoryLink}>
                      {tCommon("learnMore")} &rarr;
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
