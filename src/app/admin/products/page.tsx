import AdminShell from "@/components/admin/AdminShell/AdminShell";
import ProductTable from "@/components/admin/ProductTable/ProductTable";
import { requireAdminSession } from "@/lib/admin/auth";
import { listProducts } from "@/lib/admin/content-repository";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminSession();
  const products = await listProducts();

  return (
    <AdminShell title="產品管理" description="管理產品清單、產品內容、多語翻譯與圖片關聯設定。">
      <ProductTable products={products} />
    </AdminShell>
  );
}
