export default function AdminNav() {
  return (
    <aside style={{ background: "#0f172a", color: "#fff", padding: "24px 18px", marginBottom: 24 }}>
      <strong style={{ display: "block", fontSize: 20, marginBottom: 16 }}>後台內容管理</strong>
      <nav style={{ display: "grid", gap: 8 }}>
        <a href="/admin/home" style={{ color: "#fff", textDecoration: "none" }}>首頁內容</a>
        <a href="/admin/product-categories" style={{ color: "#fff", textDecoration: "none" }}>產品分類</a>
        <a href="/admin/factory" style={{ color: "#fff", textDecoration: "none" }}>Factory 頁面</a>
        <a href="/admin/products" style={{ color: "#fff", textDecoration: "none" }}>產品管理</a>
        <a href="/admin/media" style={{ color: "#fff", textDecoration: "none" }}>媒體庫</a>
      </nav>
    </aside>
  );
}
