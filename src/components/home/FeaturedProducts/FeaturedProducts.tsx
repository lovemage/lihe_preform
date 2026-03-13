import Image from "next/image";
import { Link } from "@/i18n/navigation";
import SectionHeading from "@/components/ui/SectionHeading";
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
};

export default function FeaturedProducts({
  products,
  title,
  subtitle,
}: FeaturedProductsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading title={title} subtitle={subtitle} />
        <div className={styles.grid}>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={styles.card}
            >
              <div className={styles.imageWrap}>
                <Image
                  src={product.thumbnail.src}
                  alt={product.thumbnail.alt}
                  width={400}
                  height={300}
                  loading="lazy"
                  className={styles.image}
                />
              </div>
              <div className={styles.info}>
                <span className={styles.badge}>{product.category}</span>
                <h3 className={styles.name}>{product.name}</h3>
                <span className={styles.more}>MORE &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
