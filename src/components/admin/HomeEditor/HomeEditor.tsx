"use client";

import { useState } from "react";
import { ADMIN_LOCALES, type AdminLocale } from "@/lib/admin/locales";

type HomeContentMap = Partial<Record<AdminLocale, Record<string, unknown>>>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toPrettyJson(value: unknown) {
  return JSON.stringify(value ?? [], null, 2);
}

export default function HomeEditor({
  initialContent,
}: {
  initialContent: HomeContentMap;
}) {
  const [activeLocale, setActiveLocale] = useState<AdminLocale>("en");
  const [state, setState] = useState<Record<AdminLocale, Record<string, unknown>>>({
    en: { ...(initialContent.en ?? {}) },
    ru: { ...(initialContent.ru ?? {}) },
    es: { ...(initialContent.es ?? {}) },
  });
  const [message, setMessage] = useState<string | null>(null);

  const current = state[activeLocale];
  const hero = asRecord(current.hero);
  const heroCta = asRecord(hero.cta);
  const heroCtaSecondary = asRecord(hero.ctaSecondary);
  const sectionHeadings = asRecord(current.sectionHeadings);
  const productsHeading = asRecord(sectionHeadings.products);
  const showcaseHeading = asRecord(sectionHeadings.showcase);
  const featuredHeading = asRecord(sectionHeadings.featured);
  const factoryHeading = asRecord(sectionHeadings.factory);
  const moldHighlights = asRecord(current.moldHighlights);
  const factoryImage = asRecord(current.factoryImage);

  function patchLocale(locale: AdminLocale, updater: (content: Record<string, unknown>) => Record<string, unknown>) {
    setState((currentState) => ({
      ...currentState,
      [locale]: updater(currentState[locale]),
    }));
  }

  function updateTopLevelField(locale: AdminLocale, key: string, value: unknown) {
    patchLocale(locale, (content) => ({
      ...content,
      [key]: value,
    }));
  }

  function updateNestedObject(locale: AdminLocale, parentKey: string, key: string, value: unknown) {
    patchLocale(locale, (content) => ({
      ...content,
      [parentKey]: {
        ...asRecord(content[parentKey]),
        [key]: value,
      },
    }));
  }

  function updateSectionHeading(locale: AdminLocale, sectionKey: string, key: string, value: string) {
    patchLocale(locale, (content) => ({
      ...content,
      sectionHeadings: {
        ...asRecord(content.sectionHeadings),
        [sectionKey]: {
          ...asRecord(asRecord(content.sectionHeadings)[sectionKey]),
          [key]: value,
        },
      },
    }));
  }

  function updateHeroAction(locale: AdminLocale, actionKey: "cta" | "ctaSecondary", field: string, value: string) {
    patchLocale(locale, (content) => ({
      ...content,
      hero: {
        ...asRecord(content.hero),
        [actionKey]: {
          ...asRecord(asRecord(content.hero)[actionKey]),
          [field]: value,
        },
      },
    }));
  }

  function updateMoldHighlightsField(locale: AdminLocale, key: string, value: unknown) {
    patchLocale(locale, (content) => ({
      ...content,
      moldHighlights: {
        ...asRecord(content.moldHighlights),
        [key]: value,
      },
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/admin/home", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(errorPayload?.error ?? "儲存失敗");
      return;
    }

    setMessage("首頁內容已儲存");
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
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>Hero 區塊</h2>
            <p style={{ color: "#475569" }}>管理首頁主標、副標與兩個 CTA 按鈕。</p>
          </div>
          <label style={{ display: "grid", gap: 6 }}>
            <span>主標題</span>
            <input value={asString(hero.headline)} onChange={(event) => updateNestedObject(activeLocale, "hero", "headline", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>副標題</span>
            <textarea value={asString(hero.subheadline)} onChange={(event) => updateNestedObject(activeLocale, "hero", "subheadline", event.target.value)} rows={4} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>主按鈕文字</span>
              <input value={asString(heroCta.label)} onChange={(event) => updateHeroAction(activeLocale, "cta", "label", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>主按鈕連結</span>
              <input value={asString(heroCta.href)} onChange={(event) => updateHeroAction(activeLocale, "cta", "href", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>次按鈕文字</span>
              <input value={asString(heroCtaSecondary.label)} onChange={(event) => updateHeroAction(activeLocale, "ctaSecondary", "label", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>次按鈕連結</span>
              <input value={asString(heroCtaSecondary.href)} onChange={(event) => updateHeroAction(activeLocale, "ctaSecondary", "href", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
          </div>
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>段落標題</h2>
            <p style={{ color: "#475569" }}>管理首頁各主要段落的標題與副標題。</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>產品分類標題</span>
              <input value={asString(productsHeading.title)} onChange={(event) => updateSectionHeading(activeLocale, "products", "title", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>產品分類副標題</span>
              <input value={asString(productsHeading.subtitle)} onChange={(event) => updateSectionHeading(activeLocale, "products", "subtitle", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>核心能力標題</span>
              <input value={asString(showcaseHeading.title)} onChange={(event) => updateSectionHeading(activeLocale, "showcase", "title", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>核心能力副標題</span>
              <input value={asString(showcaseHeading.subtitle)} onChange={(event) => updateSectionHeading(activeLocale, "showcase", "subtitle", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>精選產品標題</span>
              <input value={asString(featuredHeading.title)} onChange={(event) => updateSectionHeading(activeLocale, "featured", "title", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>精選產品副標題</span>
              <input value={asString(featuredHeading.subtitle)} onChange={(event) => updateSectionHeading(activeLocale, "featured", "subtitle", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>工廠段落標題</span>
              <input value={asString(factoryHeading.title)} onChange={(event) => updateSectionHeading(activeLocale, "factory", "title", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>工廠段落副標題</span>
              <input value={asString(factoryHeading.subtitle)} onChange={(event) => updateSectionHeading(activeLocale, "factory", "subtitle", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
            </label>
          </div>
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>產品分類管理入口</h2>
            <p style={{ color: "#475569" }}>首頁 `productCategories` 已移到左側「產品分類」頁面獨立管理。</p>
          </div>
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>模具亮點區塊</h2>
            <p style={{ color: "#475569" }}>管理標題、描述與手風琴標題。條目內容保留結構化 JSON 編輯。</p>
          </div>
          <label style={{ display: "grid", gap: 6 }}>
            <span>區塊標題</span>
            <input value={asString(moldHighlights.title)} onChange={(event) => updateMoldHighlightsField(activeLocale, "title", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>區塊描述</span>
            <textarea value={asString(moldHighlights.description)} onChange={(event) => updateMoldHighlightsField(activeLocale, "description", event.target.value)} rows={4} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>手風琴標題</span>
            <input value={asString(moldHighlights.accordionTitle)} onChange={(event) => updateMoldHighlightsField(activeLocale, "accordionTitle", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>亮點條目 JSON</span>
            <textarea value={toPrettyJson(moldHighlights.items)} onChange={(event) => {
              try {
                updateMoldHighlightsField(activeLocale, "items", JSON.parse(event.target.value));
              } catch {
                updateMoldHighlightsField(activeLocale, "items_raw", event.target.value);
              }
            }} rows={10} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontFamily: "monospace" }} />
          </label>
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>工廠圖片</h2>
            <p style={{ color: "#475569" }}>管理首頁工廠橫幅圖片與替代文字。</p>
          </div>
          <label style={{ display: "grid", gap: 6 }}>
            <span>圖片網址</span>
            <input value={asString(factoryImage.src)} onChange={(event) => updateNestedObject(activeLocale, "factoryImage", "src", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>圖片 Alt</span>
            <input value={asString(factoryImage.alt)} onChange={(event) => updateNestedObject(activeLocale, "factoryImage", "alt", event.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", display: "grid", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>進階區塊（保留結構化編輯）</h2>
            <p style={{ color: "#475569" }}>以下欄位結構較複雜，暫時保留 JSON textarea：`banners`、`stats`、`showcaseCategories`。</p>
          </div>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Banners JSON</span>
            <textarea value={toPrettyJson(current.banners)} onChange={(event) => updateTopLevelField(activeLocale, "banners", JSON.parse(event.target.value))} rows={8} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontFamily: "monospace" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Stats JSON</span>
            <textarea value={toPrettyJson(current.stats)} onChange={(event) => updateTopLevelField(activeLocale, "stats", JSON.parse(event.target.value))} rows={8} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontFamily: "monospace" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Showcase Categories JSON</span>
            <textarea value={toPrettyJson(current.showcaseCategories)} onChange={(event) => updateTopLevelField(activeLocale, "showcaseCategories", JSON.parse(event.target.value))} rows={12} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontFamily: "monospace" }} />
          </label>
        </div>
      </div>
      {message ? <p style={{ color: "#475569" }}>{message}</p> : null}
      <button type="submit" style={{ padding: 12, borderRadius: 8, background: "#0f172a", color: "#fff", border: 0 }}>儲存首頁內容</button>
    </form>
  );
}
