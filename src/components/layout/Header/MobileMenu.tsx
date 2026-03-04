"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import styles from "./MobileMenu.module.css";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

// Map site.json labels to translation keys
const labelToKey: Record<string, string> = {
  Home: "home",
  "About Us": "about",
  "Company Profile": "companyProfile",
  Factory: "factory",
  Equipment: "equipment",
  "QC Equipment": "qcEquipment",
  "Machining Equipment": "machiningEquipment",
  Products: "products",
  "Contact Us": "contact",
  Download: "download",
};

export default function MobileMenu({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const t = useTranslations("nav");

  function toggleExpand(idx: number) {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  }

  function close() {
    setOpen(false);
    setExpandedIdx(null);
  }

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span
          className={`${styles.line} ${open ? styles.line1Open : ""}`}
        />
        <span
          className={`${styles.line} ${open ? styles.line2Open : ""}`}
        />
        <span
          className={`${styles.line} ${open ? styles.line3Open : ""}`}
        />
      </button>

      {open && (
        <div className={styles.overlay} onClick={close} />
      )}

      <div className={`${styles.panel} ${open ? styles.panelOpen : ""}`}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {nav.map((item, idx) => {
              const key = labelToKey[item.label] || item.label;
              return (
                <li key={idx} className={styles.navItem}>
                  {item.children ? (
                    <>
                      <button
                        className={styles.navButton}
                        onClick={() => toggleExpand(idx)}
                      >
                        <span>{t(key)}</span>
                        <span
                          className={`${styles.expandArrow} ${expandedIdx === idx ? styles.expandArrowOpen : ""}`}
                        >
                          &#9662;
                        </span>
                      </button>
                      {expandedIdx === idx && (
                        <ul className={styles.subList}>
                          <li>
                            <Link
                              href={item.href}
                              className={styles.subLink}
                              onClick={close}
                            >
                              {t(key)}
                            </Link>
                          </li>
                          {item.children.map((child, cIdx) => {
                            const childKey =
                              labelToKey[child.label] || child.label;
                            return (
                              <li key={cIdx}>
                                <Link
                                  href={child.href}
                                  className={styles.subLink}
                                  onClick={close}
                                >
                                  {t(childKey)}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={styles.navLink}
                      onClick={close}
                    >
                      {t(key)}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
