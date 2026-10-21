import Button from "@/components/ui/Button";
import MoldFigure, { type MoldCopy } from "./MoldFigure";
import styles from "./HeroBanner.module.css";

type HeroBannerProps = {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  mold: MoldCopy;
};

export default function HeroBanner({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
  mold,
}: HeroBannerProps) {
  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.inner}>
        <div className={styles.content}>
          <h1 className={styles.headline}>{headline}</h1>
          <p className={styles.subheadline}>{subheadline}</p>
          <div className={styles.ctas}>
            <Button href={ctaHref} variant="primary" size="lg">
              {ctaLabel}
            </Button>
            <Button href={ctaSecondaryHref} variant="secondary" size="lg" className={styles.secondaryBtn}>
              {ctaSecondaryLabel}
            </Button>
          </div>
        </div>
        <MoldFigure copy={mold} />
      </div>
    </section>
  );
}
