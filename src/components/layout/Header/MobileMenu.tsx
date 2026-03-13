"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { navLabelToKey } from "@/lib/nav-utils";
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

export default function MobileMenu({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const t = useTranslations("nav");
  const panelRef = useRef<HTMLDivElement>(null);

  const getNavLabel = (label: string) => {
    const key = navLabelToKey[label];
    return key ? t(key) : label;
  };

  function toggleExpand(idx: number) {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  }

  const close = useCallback(() => {
    setOpen(false);
    setExpandedIdx(null);
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  // Focus trap
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    const focusableSelector = 'a[href], button, [tabindex]:not([tabindex="-1"])';

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = panel.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleTab);
    // Focus first element in panel
    const firstFocusable = panel.querySelector<HTMLElement>(focusableSelector);
    firstFocusable?.focus();

    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
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
        <div className={styles.overlay} onClick={close} aria-hidden="true" />
      )}

      <div
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        ref={panelRef}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label={open ? "Navigation menu" : undefined}
      >
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {nav.map((item, idx) => {
              return (
                <li key={idx} className={styles.navItem}>
                  {item.children ? (
                    <>
                      <button
                        className={styles.navButton}
                        onClick={() => toggleExpand(idx)}
                        aria-expanded={expandedIdx === idx}
                      >
                        <span>{getNavLabel(item.label)}</span>
                        <span
                          className={`${styles.expandArrow} ${expandedIdx === idx ? styles.expandArrowOpen : ""}`}
                          aria-hidden="true"
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
                              {getNavLabel(item.label)}
                            </Link>
                          </li>
                          {item.children.map((child, cIdx) => {
                            return (
                              <li key={cIdx}>
                                <Link
                                  href={child.href}
                                  className={styles.subLink}
                                  onClick={close}
                                >
                                  {getNavLabel(child.label)}
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
                      {getNavLabel(item.label)}
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
