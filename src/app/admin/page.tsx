import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell/AdminShell";
import { requireAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const cards = [
  { href: "/admin/home", title: "首頁內容", description: "管理首頁多語內容與主要區塊。" },
  { href: "/admin/factory", title: "Factory 頁面", description: "管理工廠頁面的標題、段落與圖片內容。" },
  { href: "/admin/products", title: "產品管理", description: "管理產品列表、產品內容、多語翻譯與圖片關聯。" },
  { href: "/admin/media", title: "媒體庫", description: "上傳圖片、自動轉為 WebP，並同步儲存到 Cloudflare R2。" },
  { href: "/admin/footer-settings", title: "頁腳設定", description: "管理頁腳 Logo、描述、連結、聯絡資訊與社群媒體連結。" },
  { href: "/admin/email-templates", title: "Email 模板管理", description: "編輯聯絡表單的自動回覆與通知郵件模板（支援三語）。" },
  { href: "/admin/send-email", title: "發送官方郵件", description: "使用 sales@lihe-preform.com 發送專業郵件，可自訂簽名檔。" },
];

export default async function AdminDashboardPage() {
  await requireAdminSession();

  return (
    <AdminShell title="後台首頁" description="選擇要管理的內容頁面。">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {cards.map((card) => (
          <Link key={card.href} href={card.href} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 20 }}>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>{card.title}</h2>
            <p style={{ color: "#475569" }}>{card.description}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
