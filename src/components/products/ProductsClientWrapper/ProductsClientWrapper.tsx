"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <>
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        allLabel={allCategoriesLabel}
      />
      <ProductGrid products={filteredProducts} viewDetailsLabel={viewDetailsLabel} />
    </>
  );
}

export default function ProductsClientWrapper(props: ProductsClientWrapperProps) {
  return (
    <Suspense fallback={null}>
      <ProductsContent {...props} />
    </Suspense>
  );
}
