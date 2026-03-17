import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getContactData, getProductsData } from "@/lib/data";
import { getLocaleAlternates } from "@/lib/seo";
import Breadcrumb from "@/components/ui/Breadcrumb/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading/SectionHeading";
import EnhancedContactForm from "@/components/contact/ContactForm/EnhancedContactForm";
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
  const t = await getTranslations("contact");

  return {
    title: `${t("title")} | Lihe Precision`,
    description: t("intro"),
    alternates: getLocaleAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tCommon = await getTranslations("common");
  const data = getContactData(locale);
  const productsData = getProductsData(locale);

  // Extract unique product categories
  const productCategories = productsData?.categories || [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumbHome"), href: "/" },
            { label: t("title") },
          ]}
        />

        <div className={styles.headingWrapper}>
          <SectionHeading title={t("headline")} subtitle={t("intro")} as="h1" />
        </div>

        <div className={styles.twoColumn}>
          {/* Left column: contact info */}
          <div className={styles.infoColumn}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>{t("contactPersonLabel")}</h3>
                <p className={styles.infoValue}>{data.contact.name}</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>{t("phone")}</h3>
                <p className={styles.infoValue}>
                  <a href={`tel:${data.contact.phone.replace(/\s/g, "")}`} className={styles.infoLink}>
                    {data.contact.phone}
                  </a>
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>{t("email")}</h3>
                <p className={styles.infoValue}>
                  <a href={`mailto:${data.contact.email}`} className={styles.infoLink}>
                    {data.contact.email}
                  </a>
                </p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoLabel}>{t("addressLabel")}</h3>
                <p className={styles.infoValue}>{data.contact.address}</p>
              </div>
            </div>
          </div>

          {/* Right column: enhanced contact form */}
          <div className={styles.formColumn}>
            <EnhancedContactForm
              locale={locale}
              productCategories={productCategories}
              labels={{
                heading: t("sendMessage"),
                description: t("formDescription"),
                firstName: t("firstName"),
                familyName: t("familyName"),
                email: t("email"),
                phone: t("phone"),
                country: t("country"),
                productCategory: t("productCategory"),
                requirements: t("requirements"),
                captcha: t("captcha"),
                submit: t("submit"),
                sending: t("sending"),
                required: t("required"),
                successTitle: t("successTitle"),
                successMessage: t("successMessage"),
                errorMessage: t("errorMessage"),
              }}
            />
          </div>
        </div>

        {/* Map placeholder */}
        <div className={styles.mapSection}>
          <div className={styles.mapPlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.mapIcon}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className={styles.mapText}>{t("mapLocation")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
