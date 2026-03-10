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
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <p style={{ marginBottom: 10, color: "#334155", fontWeight: 600 }}>
          前台 Factory 頁面路由
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/en/factory" target="_blank" rel="noreferrer" style={{ color: "#0f172a", textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px" }}>
            /en/factory
          </a>
          <a href="/ru/factory" target="_blank" rel="noreferrer" style={{ color: "#0f172a", textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px" }}>
            /ru/factory
          </a>
          <a href="/es/factory" target="_blank" rel="noreferrer" style={{ color: "#0f172a", textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px" }}>
            /es/factory
          </a>
        </div>
      </div>
      <FactoryEditor initialContent={{ en: en.content, ru: ru.content, es: es.content }} />
    </AdminShell>
  );
}
