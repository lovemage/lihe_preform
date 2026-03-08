import Link from "next/link";
import type { ProductRecord } from "@/types/admin";

export default function ProductTable({ products }: { products: ProductRecord[] }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ padding: 16, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 20 }}>產品列表</h2>
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
          {products.map((product) => (
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
        </tbody>
      </table>
    </div>
  );
}
