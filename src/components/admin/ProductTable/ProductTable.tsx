"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductRecord } from "@/types/admin";

export default function ProductTable({ products }: { products: ProductRecord[] }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.categoryKey).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const filteredProducts = useMemo(
    () =>
      selectedCategory === "all"
        ? products
        : products.filter((product) => product.categoryKey === selectedCategory),
    [products, selectedCategory],
  );

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ padding: 16, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ fontSize: 20 }}>產品列表</h2>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", minWidth: 180 }}
          >
            <option value="all">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <Link href="/admin/products/new" style={{ padding: "10px 14px", borderRadius: 8, background: "#0f172a", color: "#fff" }}>
          新增產品
        </Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f8fafc" }}>
          <tr>
            <th style={{ textAlign: "left", padding: 12 }}>產品名稱（英文）</th>
            <th style={{ textAlign: "left", padding: 12 }}>分類</th>
            <th style={{ textAlign: "left", padding: 12 }}>狀態</th>
            <th style={{ textAlign: "left", padding: 12 }}>更新時間</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id} style={{ borderTop: "1px solid #e2e8f0" }}>
              <td style={{ padding: 12 }}>
                <Link href={`/admin/products/${product.id}`} style={{ color: "#2563eb" }}>
                  {product.translations.en?.name || "未命名產品"}
                </Link>
              </td>
              <td style={{ padding: 12 }}>{product.categoryKey}</td>
              <td style={{ padding: 12 }}>{product.status}</td>
              <td style={{ padding: 12 }}>{new Date(product.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
          {filteredProducts.length === 0 ? (
            <tr style={{ borderTop: "1px solid #e2e8f0" }}>
              <td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                目前此分類沒有產品
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
