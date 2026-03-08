import AdminShell from "@/components/admin/AdminShell/AdminShell";
import ProductCategoriesEditor from "@/components/admin/ProductCategoriesEditor/ProductCategoriesEditor";
import { requireAdminSession } from "@/lib/admin/auth";
import { getHomeContent } from "@/lib/admin/content-repository";

export const dynamic = "force-dynamic";

export default async function AdminProductCategoriesPage() {
  await requireAdminSession();
  const [en, ru, es] = await Promise.all([
    getHomeContent("en"),
    getHomeContent("ru"),
    getHomeContent("es"),
  ]);

  return (
    <AdminShell title="產品分類" description="管理首頁下方的產品分類連結與多語名稱。">
      <ProductCategoriesEditor initialContent={{ en: en.content, ru: ru.content, es: es.content }} />
    </AdminShell>
  );
}
