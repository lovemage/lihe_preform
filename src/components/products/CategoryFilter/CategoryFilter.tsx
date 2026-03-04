"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./CategoryFilter.module.css";

type CategoryFilterProps = {
  categories: string[];
  activeCategory: string | null;
  allLabel: string;
};

export default function CategoryFilter({
  categories,
  activeCategory,
  allLabel,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleClick(category: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className={styles.filterWrapper}>
      <div className={styles.filters}>
        <button
          className={`${styles.pill} ${activeCategory === null ? styles.active : ""}`}
          onClick={() => handleClick(null)}
        >
          {allLabel}
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.pill} ${activeCategory === category ? styles.active : ""}`}
            onClick={() => handleClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
