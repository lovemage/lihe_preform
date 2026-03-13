"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "./MoldHighlights.module.css";

type HighlightItem = {
  title: string;
  content: string;
};

type MoldHighlightsProps = {
  title: string;
  description: string;
  accordionTitle: string;
  items: HighlightItem[];
};

export default function MoldHighlights({
  title,
  description,
  accordionTitle,
  items,
}: MoldHighlightsProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.content}>
            <SectionHeading title={title} subtitle={description} align="left" />
          </div>

          <div className={styles.accordionBlock}>
            <h3 className={styles.accordionTitle}>{accordionTitle}</h3>
            <div className={styles.accordion}>
              {items.map((item, index) => {
                const isOpen = index === openIndex;

                return (
                  <div
                    key={item.title}
                    className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
                  >
                    <button
                      type="button"
                      id={`mold-trigger-${index}`}
                      className={styles.trigger}
                      aria-expanded={isOpen}
                      aria-controls={`mold-panel-${index}`}
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    >
                      <span className={styles.triggerText}>{item.title}</span>
                      <span className={styles.icon} aria-hidden="true">
                        <span className={styles.iconLineHorizontal} />
                        <span className={styles.iconLineVertical} />
                      </span>
                    </button>
                    <div className={styles.panel} id={`mold-panel-${index}`} role="region" aria-labelledby={`mold-trigger-${index}`}>
                      <div className={styles.panelInner}>
                        <p className={styles.panelText}>{item.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
