import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell/AdminShell";
import PublishPanel from "@/components/admin/PublishPanel/PublishPanel";
import { requireAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const cards = [
  { href: "/admin/home", title: "首頁內容", description: "管理首頁多語內容，資料儲存在 D1，並可發佈 EN / RU JSON。" },
  { href: "/admin/products", title: "產品管理", description: "管理產品列表、產品內容、多語翻譯與圖片關聯。" },
  { href: "/admin/media", title: "媒體庫", description: "上傳圖片、自動轉為 WebP，並同步儲存到 Cloudflare R2。" },
];

export default async function AdminDashboardPage() {
  await requireAdminSession();

  return (
    <AdminShell title="儀表板" description="管理 D1 內容、R2 圖片資產，並發佈前台使用的 JSON 檔案。">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {cards.map((card) => (
          <Link key={card.href} href={card.href} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 20 }}>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>{card.title}</h2>
            <p style={{ color: "#475569" }}>{card.description}</p>
          </Link>
        ))}
      </div>
      <PublishPanel />
      <form action="/api/admin/auth/logout" method="post" style={{ marginTop: 24 }}>
        <button type="submit" style={{ padding: "12px 16px", borderRadius: 8, background: "#0f172a", color: "#fff", border: 0 }}>登出</button>
      </form>
    </AdminShell>
  );
}
