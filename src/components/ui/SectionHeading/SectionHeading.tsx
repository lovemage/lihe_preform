import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  variant?: "bar" | "subtle" | "none";
};

export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  as = "h2",
  variant = "bar",
}: SectionHeadingProps) {
  const HeadingTag = as;

  return (
    <div className={`${styles.heading} ${styles[align]}`}>
      <HeadingTag className={styles.title}>{title}</HeadingTag>
      {variant === "bar" && (
        <div className={styles.accent} aria-hidden="true" />
      )}
      {variant === "subtle" && (
        <div className={styles.accentSubtle} aria-hidden="true" />
      )}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
