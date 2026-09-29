import Image from "next/image";
import { Link } from "@/i18n/navigation";
import styles from "./FeaturedProducts.module.css";

type Product = {
  id: number;
  name: string;
  category: string;
  thumbnail: { src: string; alt: string };
};

type FeaturedProductsProps = {
  products: Product[];
  title: string;
  subtitle: string;
  moreLabel: string;
  viewAllLabel: string;
};

export default function FeaturedProducts({
  products,
  title,
  subtitle,
  moreLabel,
  viewAllLabel,
}: FeaturedProductsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            <span className={styles.eyebrow}>
              {String(products.length).padStart(2, "0")} / LIHE PRECISION
            </span>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <Link href="/products" className={styles.viewAll}>
            {viewAllLabel} <span aria-hidden="true">&rarr;</span>
          </Link>
        </header>

        <div className={styles.grid}>
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={`${styles.card} ${index === 0 ? styles.cardFeature : ""}`}
            >
              <div className={styles.imageWrap}>
                <span className={styles.index} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Image
                  src={product.thumbnail.src}
                  alt={product.thumbnail.alt}
                  fill
                  sizes={
                    index === 0
                      ? "(max-width: 768px) 100vw, 600px"
                      : "(max-width: 480px) 100vw, (max-width: 768px) 50vw, 300px"
                  }
                  loading="lazy"
                  className={styles.image}
                />
              </div>
              <div className={styles.info}>
                <span className={styles.category}>{product.category}</span>
                <h3 className={styles.name}>{product.name}</h3>
                <span className={styles.more}>
                  {moreLabel} <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
