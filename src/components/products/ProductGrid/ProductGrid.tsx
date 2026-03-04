import ProductCard from "@/components/products/ProductCard";
import styles from "./ProductGrid.module.css";

type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  thumbnail: {
    src: string;
    alt: string;
  };
};

type ProductGridProps = {
  products: Product[];
  viewDetailsLabel: string;
};

export default function ProductGrid({ products, viewDetailsLabel }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          viewDetailsLabel={viewDetailsLabel}
        />
      ))}
    </div>
  );
}
