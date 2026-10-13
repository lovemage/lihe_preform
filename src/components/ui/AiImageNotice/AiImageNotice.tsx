import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "./AiImageNotice.module.css";

type AiImageNoticeProps = {
  /** "figcaption" when placed inside a <figure>; otherwise a paragraph below an image group. */
  as?: "figcaption" | "p";
  align?: "left" | "center";
};

/** Disclosure shown under product imagery: images are AI-enhanced; real machine photos are available from sales. */
export default async function AiImageNotice({ as = "p", align = "left" }: AiImageNoticeProps) {
  const t = await getTranslations("common");
  const Tag = as;

  return (
    <Tag className={`${styles.notice} ${align === "center" ? styles.center : ""}`}>
      {t("aiImageNotice")}{" "}
      <Link href="/contact" className={styles.link}>
        {t("aiImageNoticeLink")}
      </Link>
    </Tag>
  );
}
