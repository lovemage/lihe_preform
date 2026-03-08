import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell/AdminShell";
import ProductEditor from "@/components/admin/ProductEditor/ProductEditor";
import { requireAdminSession } from "@/lib/admin/auth";
import { getProductById, listMedia } from "@/lib/admin/content-repository";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const media = await listMedia();

  if (id === "new") {
    return (
      <AdminShell title="新增產品" description="建立新的多語產品資料，並直接管理產品圖片與縮圖。">
        <ProductEditor product={null} media={media} />
      </AdminShell>
    );
  }

  const product = await getProductById(Number(id));

  if (!product) {
    notFound();
  }

  return (
    <AdminShell title={`產品 #${product.id}`} description="編輯產品內容、圖庫圖片、多語翻譯與縮圖設定。">
      <ProductEditor product={product} media={media} />
    </AdminShell>
  );
}
