import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getFactoryData } from "@/lib/data";
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
  const t = await getTranslations("factory");

  return {
    title: `${t("title")} | Lihe Precision`,
    description: clampDescription(t("metaDescription")),
    alternates: getLocaleAlternates(locale, "/factory"),
  };
}

type FactorySection = {
  id: string;
  title: string;
  description: string;
  image?: { src: string; alt: string };
  items?: {
    title: string;
    description: string;
    image: { src: string; alt: string };
  }[];
};

export default async function FactoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("factory");
  const tCommon = await getTranslations("common");
  const data = getFactoryData(locale);

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
            <h1 className={styles.bannerTitle}>{data.title}</h1>
            <p className={styles.bannerHeadline}>{data.headline}</p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumbHome"), href: "/" },
            { label: data.title },
          ]}
        />
      </div>

      {/* Intro */}
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.intro}>{data.intro}</p>
        </div>
      </section>

      {/* Sections */}
      {data.sections.map((section: FactorySection, index: number) => {
        // Section with image (e.g., office)
        if (section.image) {
          return (
            <section
              key={section.id}
              className={`${styles.section} ${index % 2 === 0 ? styles.sectionAlt : ""}`}
            >
              <div className={styles.container}>
                <div className={styles.imageSection}>
                  <div
                    className={`${styles.imageSide} ${index % 2 === 1 ? styles.imageRight : ""}`}
                  >
                    <div className={styles.imageWrapper}>
                      <Image
                        src={section.image.src}
                        alt={section.image.alt}
                        width={600}
                        height={400}
                        className={styles.sectionImage}
                      />
                    </div>
                  </div>
                  <div className={styles.textSide}>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                    <p className={styles.sectionDescription}>
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // Section with items (e.g., production-workshop)
        if (section.items) {
          return (
            <section
              key={section.id}
              className={`${styles.section} ${index % 2 === 0 ? styles.sectionAlt : ""}`}
            >
              <div className={styles.container}>
                <SectionHeading title={section.title} variant="none" />
                <p className={styles.sectionIntro}>{section.description}</p>
                <div className={styles.itemsGrid}>
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className={styles.itemCard}>
                      <div className={styles.itemImageWrapper}>
                        <Image
                          src={item.image.src}
                          alt={item.image.alt}
                          width={400}
                          height={300}
                          className={styles.itemImage}
                        />
                      </div>
                      <div className={styles.itemContent}>
                        <h3 className={styles.itemTitle}>{item.title}</h3>
                        <p className={styles.itemDescription}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Text-only sections
        return (
          <section
            key={section.id}
            className={`${styles.section} ${index % 2 === 0 ? styles.sectionAlt : ""}`}
          >
            <div className={styles.container}>
              <div className={styles.textBlock}>
                <h2 className={styles.textBlockTitle}>{section.title}</h2>
                <p className={styles.textBlockDescription}>
                  {section.description}
                </p>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
