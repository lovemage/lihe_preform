"use client";

import { useRef, useState } from "react";
import { ADMIN_LOCALES, type AdminLocale } from "@/lib/admin/locales";
import type { MediaRecord } from "@/types/admin";

type ContentMap = Partial<Record<AdminLocale, Record<string, unknown>>>;

type ImageField = {
  src: string;
  alt: string;
};

type FactoryItem = {
  title: string;
  description: string;
  image: ImageField;
};

type FactorySection = {
  id: string;
  title: string;
  description: string;
  image?: ImageField;
  items?: FactoryItem[];
};

type FactoryState = {
  title: string;
  banner: ImageField;
  headline: string;
  intro: string;
  sections: FactorySection[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function parseImage(value: unknown): ImageField {
  const record = asRecord(value);
  return {
    src: asString(record.src),
    alt: asString(record.alt),
  };
}

function parseItem(value: unknown): FactoryItem {
  const record = asRecord(value);
  return {
    title: asString(record.title),
    description: asString(record.description),
    image: parseImage(record.image),
  };
}

function parseSection(value: unknown): FactorySection {
  const record = asRecord(value);
  const itemsValue = record.items;
  return {
    id: asString(record.id),
    title: asString(record.title),
    description: asString(record.description),
    image: record.image ? parseImage(record.image) : undefined,
    items: Array.isArray(itemsValue) ? itemsValue.map(parseItem) : undefined,
  };
}

function parseFactoryContent(content: Record<string, unknown> | undefined): FactoryState {
  const source = content ?? {};
  return {
    title: asString(source.title),
    banner: parseImage(source.banner),
    headline: asString(source.headline),
    intro: asString(source.intro),
    sections: Array.isArray(source.sections) ? source.sections.map(parseSection) : [],
  };
}

function toContent(state: FactoryState): Record<string, unknown> {
  return {
    title: state.title,
    banner: state.banner,
    headline: state.headline,
    intro: state.intro,
    sections: state.sections,
  };
}

export default function FactoryEditor({ initialContent }: { initialContent: ContentMap }) {
  const [activeLocale, setActiveLocale] = useState<AdminLocale>("en");
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [state, setState] = useState<Record<AdminLocale, FactoryState>>({
    en: parseFactoryContent(initialContent.en),
    ru: parseFactoryContent(initialContent.ru),
    es: parseFactoryContent(initialContent.es),
  });

  function getLocaleLabel(locale: AdminLocale) {
    if (locale === "en") return "英文";
    if (locale === "ru") return "俄文";
    return "西文";
  }

  function patchLocale(locale: AdminLocale, updater: (current: FactoryState) => FactoryState) {
    setState((current) => ({ ...current, [locale]: updater(current[locale]) }));
  }

  function updateSection(locale: AdminLocale, sectionIndex: number, updater: (section: FactorySection) => FactorySection) {
    patchLocale(locale, (current) => ({
      ...current,
      sections: current.sections.map((section, index) => (index === sectionIndex ? updater(section) : section)),
    }));
  }

  function updateSectionItem(locale: AdminLocale, sectionIndex: number, itemIndex: number, updater: (item: FactoryItem) => FactoryItem) {
    updateSection(locale, sectionIndex, (section) => ({
      ...section,
      items: (section.items ?? []).map((item, index) => (index === itemIndex ? updater(item) : item)),
    }));
  }

  async function uploadImage(file: File, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const response = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "圖片上傳失敗");
    }
    return (await response.json()) as MediaRecord;
  }

  async function handleImageUpload(key: string, folder: string, apply: (uploaded: MediaRecord) => void, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setUploadingKey(key);
    try {
      const uploaded = await uploadImage(file, folder);
      apply(uploaded);
      setMessage("圖片已上傳並套用");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "圖片上傳失敗");
    } finally {
      setUploadingKey(null);
      if (fileInputRefs.current[key]) {
        fileInputRefs.current[key]!.value = "";
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const payload = {
      en: toContent(state.en),
      ru: toContent(state.ru),
      es: toContent(state.es),
    };
    const response = await fetch("/api/admin/factory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "儲存失敗");
      return;
    }
    setMessage("Factory 頁面內容已儲存");
  }

  const current = state[activeLocale];

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {ADMIN_LOCALES.map((locale) => (
          <button key={locale} type="button" onClick={() => setActiveLocale(locale)} style={{ padding: "10px 14px", borderRadius: 999, border: activeLocale === locale ? "1px solid #0f172a" : "1px solid #cbd5e1", background: activeLocale === locale ? "#0f172a" : "#fff", color: activeLocale === locale ? "#fff" : "#0f172a" }}>
            {getLocaleLabel(locale)}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: 20 }}>頁首內容</h2>
        <label style={{ display: "grid", gap: 6 }}>
          <span>頁面標題</span>
          <input value={current.title} onChange={(event) => patchLocale(activeLocale, (value) => ({ ...value, title: event.target.value }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Headline</span>
          <input value={current.headline} onChange={(event) => patchLocale(activeLocale, (value) => ({ ...value, headline: event.target.value }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Intro</span>
          <textarea value={current.intro} onChange={(event) => patchLocale(activeLocale, (value) => ({ ...value, intro: event.target.value }))} rows={4} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
      </div>

      <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: 20 }}>Banner 圖片</h2>
        <img src={current.banner.src} alt={current.banner.alt || "banner"} style={{ width: "100%", maxWidth: 420, height: 220, objectFit: "cover", borderRadius: 12, border: "1px solid #e2e8f0" }} />
        <label style={{ display: "grid", gap: 6 }}>
          <span>圖片網址</span>
          <input value={current.banner.src} onChange={(event) => patchLocale(activeLocale, (value) => ({ ...value, banner: { ...value.banner, src: event.target.value } }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>圖片 Alt</span>
          <input value={current.banner.alt} onChange={(event) => patchLocale(activeLocale, (value) => ({ ...value, banner: { ...value.banner, alt: event.target.value } }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input ref={(element) => { fileInputRefs.current.banner = element; }} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleImageUpload("banner", "factory", (uploaded) => patchLocale(activeLocale, (value) => ({ ...value, banner: { ...value.banner, src: uploaded.url, alt: value.banner.alt || uploaded.originalFilename } })), event)} />
          <span style={{ color: "#64748b", fontSize: 14 }}>{uploadingKey === "banner" ? "上傳中..." : "可直接上傳替換 Banner"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {current.sections.map((section, sectionIndex) => (
          <div key={`${activeLocale}-${section.id}-${sectionIndex}`} style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h2 style={{ fontSize: 20 }}>段落：{section.id || `section-${sectionIndex + 1}`}</h2>
              <button type="button" onClick={() => patchLocale(activeLocale, (value) => ({ ...value, sections: value.sections.filter((_, index) => index !== sectionIndex) }))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#b91c1c" }}>
                刪除此段落
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>段落 ID</span>
                <input value={section.id} onChange={(event) => updateSection(activeLocale, sectionIndex, (value) => ({ ...value, id: event.target.value }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>段落標題</span>
                <input value={section.title} onChange={(event) => updateSection(activeLocale, sectionIndex, (value) => ({ ...value, title: event.target.value }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
              </label>
            </div>
            <label style={{ display: "grid", gap: 6 }}>
              <span>段落描述</span>
              <textarea value={section.description} onChange={(event) => updateSection(activeLocale, sectionIndex, (value) => ({ ...value, description: event.target.value }))} rows={4} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>

            {section.image ? (
              <div style={{ display: "grid", gap: 10 }}>
                <h3 style={{ fontSize: 16 }}>段落圖片</h3>
                <img src={section.image.src} alt={section.image.alt || "section"} style={{ width: 280, height: 180, objectFit: "cover", borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <label style={{ display: "grid", gap: 6 }}>
                  <span>圖片網址</span>
                  <input value={section.image.src} onChange={(event) => updateSection(activeLocale, sectionIndex, (value) => ({ ...value, image: { ...(value.image ?? { src: "", alt: "" }), src: event.target.value } }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>圖片 Alt</span>
                  <input value={section.image.alt} onChange={(event) => updateSection(activeLocale, sectionIndex, (value) => ({ ...value, image: { ...(value.image ?? { src: "", alt: "" }), alt: event.target.value } }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
                </label>
                <input ref={(element) => { fileInputRefs.current[`section-${sectionIndex}`] = element; }} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleImageUpload(`section-${sectionIndex}`, "factory", (uploaded) => updateSection(activeLocale, sectionIndex, (value) => ({ ...value, image: { ...(value.image ?? { src: "", alt: "" }), src: uploaded.url, alt: value.image?.alt || uploaded.originalFilename } })), event)} />
              </div>
            ) : null}

            {section.items ? (
              <div style={{ display: "grid", gap: 12 }}>
                <h3 style={{ fontSize: 16 }}>子項目</h3>
                {section.items.map((item, itemIndex) => (
                  <div key={`${section.id}-${itemIndex}`} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <strong>項目 {itemIndex + 1}</strong>
                      <button type="button" onClick={() => updateSection(activeLocale, sectionIndex, (value) => ({ ...value, items: (value.items ?? []).filter((_, index) => index !== itemIndex) }))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#b91c1c" }}>
                        刪除項目
                      </button>
                    </div>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span>項目標題</span>
                      <input value={item.title} onChange={(event) => updateSectionItem(activeLocale, sectionIndex, itemIndex, (value) => ({ ...value, title: event.target.value }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span>項目描述</span>
                      <textarea value={item.description} onChange={(event) => updateSectionItem(activeLocale, sectionIndex, itemIndex, (value) => ({ ...value, description: event.target.value }))} rows={4} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
                    </label>
                    <img src={item.image.src} alt={item.image.alt || "item"} style={{ width: 240, height: 160, objectFit: "cover", borderRadius: 12, border: "1px solid #e2e8f0" }} />
                    <label style={{ display: "grid", gap: 6 }}>
                      <span>圖片網址</span>
                      <input value={item.image.src} onChange={(event) => updateSectionItem(activeLocale, sectionIndex, itemIndex, (value) => ({ ...value, image: { ...value.image, src: event.target.value } }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span>圖片 Alt</span>
                      <input value={item.image.alt} onChange={(event) => updateSectionItem(activeLocale, sectionIndex, itemIndex, (value) => ({ ...value, image: { ...value.image, alt: event.target.value } }))} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
                    </label>
                    <input ref={(element) => { fileInputRefs.current[`section-${sectionIndex}-item-${itemIndex}`] = element; }} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleImageUpload(`section-${sectionIndex}-item-${itemIndex}`, "factory", (uploaded) => updateSectionItem(activeLocale, sectionIndex, itemIndex, (value) => ({ ...value, image: { ...value.image, src: uploaded.url, alt: value.image.alt || uploaded.originalFilename } })), event)} />
                  </div>
                ))}
                <button type="button" onClick={() => updateSection(activeLocale, sectionIndex, (value) => ({ ...value, items: [...(value.items ?? []), { title: "", description: "", image: { src: "", alt: "" } }] }))} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #0f172a", background: "#fff", color: "#0f172a" }}>
                  新增子項目
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <button type="button" onClick={() => patchLocale(activeLocale, (value) => ({ ...value, sections: [...value.sections, { id: "", title: "", description: "", image: { src: "", alt: "" } }] }))} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #0f172a", background: "#fff", color: "#0f172a" }}>
        新增段落
      </button>

      {message ? <p style={{ color: "#475569" }}>{message}</p> : null}
      <button type="submit" style={{ padding: 12, borderRadius: 8, background: "#0f172a", color: "#fff", border: 0 }}>儲存 Factory 頁面</button>
    </form>
  );
}
