import { getAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#e2e8f0", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #cbd5e1" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>後台登入</h1>
        <p style={{ color: "#475569", marginBottom: 24 }}>登入後即可管理首頁內容、產品資料、媒體資產與 JSON 發佈流程。</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
