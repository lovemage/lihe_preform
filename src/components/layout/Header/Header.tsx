import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "./LocaleSwitcher";
import MobileMenu from "./MobileMenu";
import { navLabelToKey } from "@/lib/nav-utils";
import styles from "./Header.module.css";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

interface SiteData {
  company: string;
  logo: { src: string; alt: string };
  nav: NavItem[];
}

export default async function Header({ siteData }: { siteData: SiteData }) {
  const t = await getTranslations("nav");
  const { logo, nav } = siteData;
  const getNavLabel = (label: string) => {
    const key = navLabelToKey[label];
    return key ? t(key) : label;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={40}
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav>
          <ul className={styles.desktopNav}>
            {nav.map((item, idx) => {
              return (
                <li key={idx} className={styles.navItem}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    {...(item.children ? { "aria-haspopup": "true", "aria-expanded": "false" } : {})}
                  >
                    {getNavLabel(item.label)}
                    {item.children && (
                      <span className={styles.dropdownArrow} aria-hidden="true">&#9662;</span>
                    )}
                  </Link>
                  {item.children && (
                    <ul className={styles.dropdown} role="menu">
                      {item.children.map((child, cIdx) => {
                        return (
                          <li key={cIdx} role="none">
                            <Link
                              href={child.href}
                              className={styles.dropdownLink}
                              role="menuitem"
                            >
                              {getNavLabel(child.label)}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: Locale Switcher + Mobile Menu */}
        <div className={styles.rightSection}>
          <LocaleSwitcher />
          <MobileMenu nav={nav} />
        </div>
      </div>
    </header>
  );
}
