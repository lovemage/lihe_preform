import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import styles from "./Footer.module.css";

interface SiteData {
  company: string;
  logo: { src: string; alt: string };
  footer: {
    tagline: string;
    social: { platform: string; href: string }[];
    links: { label: string; href: string }[];
    contact: {
      tel: string;
      email: string;
      address: string;
    };
    copyright: string;
  };
}

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "Facebook":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "Twitter":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "Pinterest":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
        </svg>
      );
    default:
      return <span>{platform}</span>;
  }
}

export default async function Footer({ siteData }: { siteData: SiteData }) {
  const t = await getTranslations("footer");
  const { logo, footer } = siteData;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: Logo + Tagline */}
          <div className={styles.column}>
            <Link href="/" className={styles.footerLogo}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={35}
              />
            </Link>
            <p className={styles.tagline}>{t("tagline")}</p>
            <div className={styles.social}>
              {footer.social.map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              {footer.links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Contact</h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <svg
                  className={styles.contactIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href={`tel:${footer.contact.tel}`} className={styles.contactLink}>
                  {footer.contact.tel}
                </a>
              </li>
              <li className={styles.contactItem}>
                <svg
                  className={styles.contactIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href={`mailto:${footer.contact.email}`} className={styles.contactLink}>
                  {footer.contact.email}
                </a>
              </li>
              <li className={styles.contactItem}>
                <svg
                  className={styles.contactIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className={styles.contactText}>
                  {footer.contact.address}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.container}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
