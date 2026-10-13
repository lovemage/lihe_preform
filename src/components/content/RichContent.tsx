import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { NewsFaq, NewsSection, NewsSource } from "@/lib/news";
import styles from "./RichContent.module.css";

type RichContentProps = {
  sections: NewsSection[];
  faq?: NewsFaq[];
  sources?: NewsSource[];
  /** Rendered at the end of the section with this index (e.g. an inline figure). */
  insertAfter?: { index: number; node: ReactNode };
};

/**
 * Long-form content blocks shared by news articles and page guides:
 * H2 sections (paragraphs, lists, numbered steps, tables), a visible FAQ and references.
 */
export default async function RichContent({ sections, faq, sources, insertAfter }: RichContentProps) {
  const t = await getTranslations("news");

  return (
    <>
      {sections.map((section, sectionIndex) => (
        <section key={section.heading} className={styles.section}>
          <h2 className={styles.sectionHeading}>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>{paragraph}</p>
          ))}
          {section.list && (
            <ul className={styles.list}>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.steps && (
            <ol className={styles.steps}>
              {section.steps.map((step, stepIndex) => (
                <li key={step}>
                  <strong>{t("step", { n: stepIndex + 1 })}</strong> {step}
                </li>
              ))}
            </ol>
          )}
          {section.table && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {section.table.head.map((cell, index) => (
                      <th key={`${index}-${cell}`} scope="col">{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row) => (
                    <tr key={row.join("|")}>
                      {row.map((cell, index) =>
                        index === 0 ? (
                          <th key={`${index}-${cell}`} scope="row">{cell}</th>
                        ) : (
                          <td key={`${index}-${cell}`}>{cell}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {insertAfter?.index === sectionIndex && insertAfter.node}
        </section>
      ))}

      {faq && faq.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>{t("faqHeading")}</h2>
          <dl className={styles.faq}>
            {faq.map((item) => (
              <div key={item.question} className={styles.faqItem}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {sources && sources.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>{t("sourcesHeading")}</h2>
          <ol className={styles.sources}>
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener">
                  {source.label}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
