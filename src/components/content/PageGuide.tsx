import { getTranslations } from "next-intl/server";
import { getPageGuide } from "@/lib/guides";
import { formatNewsDate } from "@/lib/news";
import JsonLd from "@/components/seo/JsonLd";
import RichContent from "./RichContent";
import styles from "./PageGuide.module.css";

type PageGuideProps = {
  locale: string;
  guideKey: string;
  /** Skip the FAQPage JSON-LD when the page already declares its own FAQ. */
  withFaqSchema?: boolean;
};

/** Long-form reference content (definitions, comparisons, steps, FAQ, sources) shown below a page's own content. */
export default async function PageGuide({ locale, guideKey, withFaqSchema = true }: PageGuideProps) {
  const guide = getPageGuide(locale, guideKey);
  if (!guide) return null;
  const t = await getTranslations("news");

  const faqJsonLd =
    withFaqSchema && guide.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          dateModified: guide.updated,
          mainEntity: guide.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <section className={styles.guide} aria-labelledby={`guide-${guideKey}`}>
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <div className={styles.inner}>
        <h2 id={`guide-${guideKey}`} className={styles.heading}>{guide.heading}</h2>
        <p className={styles.meta}>
          <span>
            {t("updated")} <time dateTime={guide.updated}>{formatNewsDate(locale, guide.updated)}</time>
          </span>
          <span>{t("author")}</span>
        </p>
        <p className={styles.intro}>{guide.intro}</p>
        <RichContent sections={guide.sections} faq={guide.faq} sources={guide.sources} />
      </div>
    </section>
  );
}
