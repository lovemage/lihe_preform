import { Link } from "@/i18n/navigation";
import { getCategoryPath, type ProductCategory } from "@/lib/categories";
import styles from "./CategoryFilter.module.css";

type CategoryFilterProps = {
  categories: ProductCategory[];
  activeSlug: string | null;
  allLabel: string;
};

export default function CategoryFilter({
  categories,
  activeSlug,
  allLabel,
}: CategoryFilterProps) {
  return (
    <nav className={styles.filterWrapper}>
      <div className={styles.filters}>
        <Link
          href="/products"
          className={`${styles.pill} ${activeSlug === null ? styles.active : ""}`}
          aria-current={activeSlug === null ? "page" : undefined}
        >
          {allLabel}
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={getCategoryPath(category.slug)}
            className={`${styles.pill} ${activeSlug === category.slug ? styles.active : ""}`}
            aria-current={activeSlug === category.slug ? "page" : undefined}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
