import AdminShell from "@/components/admin/AdminShell/AdminShell";
import HomeEditor from "@/components/admin/HomeEditor/HomeEditor";
import { requireAdminSession } from "@/lib/admin/auth";
import { getHomeContent } from "@/lib/admin/content-repository";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireAdminSession();
  const [en, ru, es] = await Promise.all([
    getHomeContent("en"),
    getHomeContent("ru"),
    getHomeContent("es"),
  ]);

  return (
    <AdminShell title="首頁內容" description="編輯儲存在 D1 的首頁內容。目前發佈會產生 EN 與 RU JSON，ES 已預留在編輯器中。">
      <HomeEditor initialContent={{ en: en.content, ru: ru.content, es: es.content }} />
    </AdminShell>
  );
}
