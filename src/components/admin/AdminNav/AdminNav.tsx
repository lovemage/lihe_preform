"use client";

import Link from "next/link";

const navItems = [
  { href: "/admin", label: "後台首頁" },
  { href: "/admin/home", label: "首頁內容" },
  { href: "/admin/product-categories", label: "產品分類" },
  { href: "/admin/factory", label: "Factory 頁面" },
  { href: "/admin/products", label: "產品管理" },
  { href: "/admin/media", label: "媒體庫" },
  { href: "/admin/footer-settings", label: "頁腳設定" },
  { href: "/admin/email-templates", label: "Email 模板" },
  { href: "/admin/send-email", label: "發送郵件" },
];

export default function AdminNav() {
  return (
    <aside style={{
      background: "#0f172a",
      color: "#fff",
      padding: "24px 18px",
      borderRight: "1px solid #1e293b",
      minHeight: "100vh",
      width: "260px",
      position: "fixed",
      top: 0,
      left: 0,
      overflowY: "auto"
    }}>
      <div style={{ marginBottom: 28, padding: "8px 10px" }}>
        <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Lihe Admin</p>
        <strong style={{ fontSize: 20 }}>後台內容管理</strong>
      </div>
      <nav style={{ display: "grid", gap: 8 }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: "#fff",
              fontSize: 15,
              textDecoration: "none",
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              transition: "background 0.2s"
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ marginTop: 28, padding: "0 10px" }}>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            color: "#fff",
            fontSize: 15,
            textDecoration: "none",
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.04)",
            textAlign: "center"
          }}
        >
          檢視網站
        </Link>
      </div>
      <div style={{ marginTop: 12, padding: "0 10px" }}>
        <form action="/api/admin/auth/logout" method="post">
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "#fff",
              fontSize: 15,
              cursor: "pointer"
            }}
          >
            登出
          </button>
        </form>
      </div>
    </aside>
  );
}
