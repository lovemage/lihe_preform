import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "儀表板" },
  { href: "/admin/home", label: "首頁內容" },
  { href: "/admin/product-categories", label: "產品分類" },
  { href: "/admin/factory", label: "Factory 頁面" },
  { href: "/admin/products", label: "產品管理" },
  { href: "/admin/media", label: "媒體庫" },
];

export default function AdminShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb", display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)" }}>
      <aside style={{ background: "#0f172a", color: "#fff", padding: "24px 18px", borderRight: "1px solid #1e293b" }}>
        <div style={{ marginBottom: 28, padding: "8px 10px" }}>
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Lihe Admin</p>
          <strong style={{ fontSize: 20 }}>後台內容管理</strong>
        </div>
        <nav style={{ display: "grid", gap: 8 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ color: "#fff", fontSize: 15, textDecoration: "none", padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)" }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header style={{ borderBottom: "1px solid #d9e0ea", background: "#fff" }}>
          <div style={{ padding: "24px 32px" }}>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>管理後台</p>
            <h1 style={{ fontSize: 30, marginBottom: description ? 8 : 0 }}>{title}</h1>
            {description ? <p style={{ color: "#475569" }}>{description}</p> : null}
          </div>
        </header>
        <main style={{ padding: 32 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
