import Image from "next/image";
import { Link } from "@/i18n/navigation";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    category: string;
    description: string;
    thumbnail: {
      src: string;
      alt: string;
    };
  };
  viewDetailsLabel: string;
};

export default function ProductCard({ product, viewDetailsLabel }: ProductCardProps) {
  const truncatedDescription =
    product.description.length > 100
      ? product.description.slice(0, 100) + "..."
      : product.description;

  return (
    <div className={styles.card}>
      <Link href={`/products/${product.id}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <Image
            src={product.thumbnail.src}
            alt={product.thumbnail.alt}
            width={400}
            height={300}
            className={styles.image}
          />
        </div>
      </Link>
      <div className={styles.content}>
        <span className={styles.categoryBadge}>{product.category}</span>
        <h3 className={styles.name}>
          <Link href={`/products/${product.id}`} className={styles.nameLink}>
            {product.name}
          </Link>
        </h3>
        <p className={styles.description}>{truncatedDescription}</p>
        <Link href={`/products/${product.id}`} className={styles.viewDetails}>
          {viewDetailsLabel}
          <span aria-hidden="true"> &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
