import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "./LocaleSwitcher";
import MobileMenu from "./MobileMenu";
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

export default async function Header({ siteData }: { siteData: SiteData }) {
  const t = await getTranslations("nav");
  const { logo, nav } = siteData;

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
              const key = labelToKey[item.label] || item.label;
              return (
                <li key={idx} className={styles.navItem}>
                  <Link href={item.href} className={styles.navLink}>
                    {t(key)}
                    {item.children && (
                      <span className={styles.dropdownArrow}>&#9662;</span>
                    )}
                  </Link>
                  {item.children && (
                    <ul className={styles.dropdown}>
                      {item.children.map((child, cIdx) => {
                        const childKey =
                          labelToKey[child.label] || child.label;
                        return (
                          <li key={cIdx}>
                            <Link
                              href={child.href}
                              className={styles.dropdownLink}
                            >
                              {t(childKey)}
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
