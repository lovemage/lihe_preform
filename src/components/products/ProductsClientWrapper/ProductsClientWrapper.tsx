"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CategoryFilter from "@/components/products/CategoryFilter";
import ProductGrid from "@/components/products/ProductGrid";

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

type ProductsClientWrapperProps = {
  products: Product[];
  categories: string[];
  allCategoriesLabel: string;
  viewDetailsLabel: string;
};

function ProductsContent({
  products,
  categories,
  allCategoriesLabel,
  viewDetailsLabel,
}: ProductsClientWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    setActiveCategory(
      category && categories.includes(category) ? category : null,
    );
  }, [categories]);

  const filteredProducts = useMemo(
    () =>
      activeCategory
        ? products.filter((p) => p.category === activeCategory)
        : products,
    [activeCategory, products],
  );

  function handleCategoryChange(category: string | null) {
    setActiveCategory(category);

    const params = new URLSearchParams(window.location.search);
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        allLabel={allCategoriesLabel}
        onChange={handleCategoryChange}
      />
      <ProductGrid
        products={filteredProducts}
        viewDetailsLabel={viewDetailsLabel}
      />
    </>
  );
}

export default function ProductsClientWrapper(props: ProductsClientWrapperProps) {
  return <ProductsContent {...props} />;
}
