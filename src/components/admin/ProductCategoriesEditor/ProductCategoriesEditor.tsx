"use client";

import { useState } from "react";
import { ADMIN_LOCALES, type AdminLocale } from "@/lib/admin/locales";

type HomeContentMap = Partial<Record<AdminLocale, Record<string, unknown>>>;

type CategoryItem = {
  name: string;
  href: string;
};

function getCategories(content: Record<string, unknown> | undefined): CategoryItem[] {
  const value = content?.productCategories;
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      name: typeof record.name === "string" ? record.name : "",
      href: typeof record.href === "string" ? record.href : "",
    };
  });
}

export default function ProductCategoriesEditor({
  initialContent,
}: {
  initialContent: HomeContentMap;
}) {
  const [activeLocale, setActiveLocale] = useState<AdminLocale>("en");
  const [message, setMessage] = useState<string | null>(null);
  const [state, setState] = useState<Record<AdminLocale, Record<string, unknown>>>({
    en: { ...(initialContent.en ?? {}) },
    ru: { ...(initialContent.ru ?? {}) },
    es: { ...(initialContent.es ?? {}) },
  });

  const categories = getCategories(state[activeLocale]);

  function updateCategories(locale: AdminLocale, nextItems: CategoryItem[]) {
    setState((current) => ({
      ...current,
      [locale]: {
        ...current[locale],
        productCategories: nextItems,
      },
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/admin/home", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "儲存失敗");
      return;
    }

    setMessage("產品分類已儲存");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {ADMIN_LOCALES.map((locale) => (
          <button key={locale} type="button" onClick={() => setActiveLocale(locale)} style={{ padding: "10px 14px", borderRadius: 999, border: activeLocale === locale ? "1px solid #0f172a" : "1px solid #cbd5e1", background: activeLocale === locale ? "#0f172a" : "#fff", color: activeLocale === locale ? "#fff" : "#0f172a" }}>
            {locale === "en" ? "英文" : locale === "ru" ? "俄文" : "西文（預留）"}
          </button>
        ))}
      </div>
      <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 6 }}>首頁產品分類</h2>
          <p style={{ color: "#475569" }}>管理首頁 `productCategories` 區塊。每個分類包含顯示名稱與連結。</p>
        </div>
        {categories.map((item, index) => (
          <div key={`${activeLocale}-${index}`} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>分類名稱</span>
                <input value={item.name} onChange={(event) => updateCategories(activeLocale, categories.map((entry, entryIndex) => entryIndex === index ? { ...entry, name: event.target.value } : entry))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>連結</span>
                <input value={item.href} onChange={(event) => updateCategories(activeLocale, categories.map((entry, entryIndex) => entryIndex === index ? { ...entry, href: event.target.value } : entry))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
              </label>
            </div>
            <div>
              <button type="button" onClick={() => updateCategories(activeLocale, categories.filter((_, entryIndex) => entryIndex !== index))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#b91c1c" }}>
                刪除此分類
              </button>
            </div>
          </div>
        ))}
        <div>
          <button type="button" onClick={() => updateCategories(activeLocale, [...categories, { name: "", href: "" }])} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #0f172a", background: "#fff", color: "#0f172a" }}>
            新增分類
          </button>
        </div>
      </div>
      {message ? <p style={{ color: "#475569" }}>{message}</p> : null}
      <button type="submit" style={{ padding: 12, borderRadius: 8, background: "#0f172a", color: "#fff", border: 0 }}>
        儲存產品分類
      </button>
    </form>
  );
}
