"use client";

import styles from "./CategoryFilter.module.css";

type CategoryFilterProps = {
  categories: string[];
  activeCategory: string | null;
  allLabel: string;
  onChange: (category: string | null) => void;
};

export default function CategoryFilter({
  categories,
  activeCategory,
  allLabel,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className={styles.filterWrapper}>
      <div className={styles.filters}>
        <button
          type="button"
          className={`${styles.pill} ${activeCategory === null ? styles.active : ""}`}
          onClick={() => onChange(null)}
        >
          {allLabel}
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={`${styles.pill} ${activeCategory === category ? styles.active : ""}`}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
