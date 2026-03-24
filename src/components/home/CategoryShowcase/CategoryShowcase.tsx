import Image from "next/image";
import { Link } from "@/i18n/navigation";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "./CategoryShowcase.module.css";

type Category = {
  name: string;
  description: string;
  image: string;
  alt: string;
  href: string;
};

type CategoryShowcaseProps = {
  categories: Category[];
  title: string;
  subtitle: string;
};

export default function CategoryShowcase({
  categories,
  title,
  subtitle,
}: CategoryShowcaseProps) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading title={title} subtitle={subtitle} variant="none" />
        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.image}
                />
              </div>
              <div className={styles.overlay} />
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{cat.name}</h3>
                <p className={styles.cardDescription}>{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
