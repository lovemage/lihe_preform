import AdminShell from "@/components/admin/AdminShell/AdminShell";
import FactoryEditor from "@/components/admin/FactoryEditor/FactoryEditor";
import { requireAdminSession } from "@/lib/admin/auth";
import { getFactoryContent } from "@/lib/admin/content-repository";

export const dynamic = "force-dynamic";

export default async function AdminFactoryPage() {
  await requireAdminSession();
  const [en, ru, es] = await Promise.all([
    getFactoryContent("en"),
    getFactoryContent("ru"),
    getFactoryContent("es"),
  ]);

  return (
    <AdminShell title="Factory 頁面" description="管理工廠頁面的內文、段落與圖片資產。">
      <FactoryEditor initialContent={{ en: en.content, ru: ru.content, es: es.content }} />
    </AdminShell>
  );
}
