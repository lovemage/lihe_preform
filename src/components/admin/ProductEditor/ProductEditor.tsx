"use client";

import { useMemo, useRef, useState } from "react";
import { ADMIN_LOCALES, type AdminLocale } from "@/lib/admin/locales";
import type { MediaRecord, ProductRecord } from "@/types/admin";

const EMPTY_TRANSLATION = {
  name: "",
  description: "",
  seoTitle: "",
  seoDescription: "",
};

export default function ProductEditor({
  product,
  media,
}: {
  product: ProductRecord | null;
  media: MediaRecord[];
}) {
  const [activeLocale, setActiveLocale] = useState<AdminLocale>("en");
  const [message, setMessage] = useState<string | null>(null);
  const [availableMedia, setAvailableMedia] = useState(media);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initial = useMemo(() => ({
    slug: product?.slug ?? "",
    categoryKey: product?.categoryKey ?? "",
    status: product?.status ?? "draft",
    sortOrder: product?.sortOrder ?? 0,
    thumbnailMediaId: product?.thumbnailMediaId ?? null,
    translations: {
      en: product?.translations.en ?? EMPTY_TRANSLATION,
      ru: product?.translations.ru ?? EMPTY_TRANSLATION,
      es: product?.translations.es ?? EMPTY_TRANSLATION,
    },
    gallery: product?.gallery ?? [],
  }), [product]);
  const [state, setState] = useState(initial);

  const mediaMap = useMemo(() => new Map(availableMedia.map((item) => [item.id, item])), [availableMedia]);
  const thumbnailMedia = state.thumbnailMediaId ? mediaMap.get(state.thumbnailMediaId) : null;
  const galleryItems = state.gallery
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({ ...item, media: mediaMap.get(item.mediaId) }))
    .filter((item) => item.media);

  function getLocaleLabel(locale: AdminLocale) {
    if (locale === "en") return "英文";
    if (locale === "ru") return "俄文";
    return "西文（預留）";
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");

    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "圖片上傳失敗");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const uploaded = (await response.json()) as MediaRecord;
    setAvailableMedia((current) => [uploaded, ...current]);
    setState((current) => {
      const exists = current.gallery.some((item) => item.mediaId === uploaded.id);
      const nextGallery = exists
        ? current.gallery
        : [...current.gallery, { mediaId: uploaded.id, sortOrder: current.gallery.length, isPrimary: current.gallery.length === 0 }];

      return {
        ...current,
        thumbnailMediaId: current.thumbnailMediaId ?? uploaded.id,
        gallery: nextGallery,
      };
    });
    setMessage("圖片上傳成功，已加入產品圖庫");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function setThumbnail(mediaId: number) {
    setState((current) => ({
      ...current,
      thumbnailMediaId: mediaId,
      gallery: current.gallery.map((item) => ({ ...item, isPrimary: item.mediaId === mediaId })),
    }));
  }

  function removeGalleryImage(mediaId: number) {
    setState((current) => {
      const nextGallery = current.gallery
        .filter((item) => item.mediaId !== mediaId)
        .map((item, index) => ({ ...item, sortOrder: index, isPrimary: current.thumbnailMediaId === item.mediaId }));

      const nextThumbnailId = current.thumbnailMediaId === mediaId ? (nextGallery[0]?.mediaId ?? null) : current.thumbnailMediaId;

      return {
        ...current,
        thumbnailMediaId: nextThumbnailId,
        gallery: nextGallery.map((item) => ({ ...item, isPrimary: nextThumbnailId === item.mediaId })),
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const method = product ? "PATCH" : "POST";
    const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "儲存失敗");
      return;
    }

    const payload = (await response.json()) as { id: number };
    setMessage("產品已儲存");
    if (!product) {
      window.location.href = `/admin/products/${payload.id}`;
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0" }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span>Slug</span>
          <input value={state.slug} onChange={(event) => setState((current) => ({ ...current, slug: event.target.value }))} required style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>分類 Key</span>
          <input value={state.categoryKey} onChange={(event) => setState((current) => ({ ...current, categoryKey: event.target.value }))} required style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>狀態</span>
          <select value={state.status} onChange={(event) => setState((current) => ({ ...current, status: event.target.value }))} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }}>
            <option value="draft">草稿</option>
            <option value="published">已發佈</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>排序</span>
          <input type="number" value={state.sortOrder} onChange={(event) => setState((current) => ({ ...current, sortOrder: Number(event.target.value) }))} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <label style={{ display: "grid", gap: 8 }}>
          <span>縮圖媒體 ID</span>
          <input type="number" value={state.thumbnailMediaId ?? ""} onChange={(event) => setState((current) => ({ ...current, thumbnailMediaId: event.target.value ? Number(event.target.value) : null }))} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        </label>
        <div style={{ display: "grid", gap: 8 }}>
          <span>產品圖片</span>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} style={{ maxWidth: 280 }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #0f172a", background: "#0f172a", color: "#fff" }}>
              {uploading ? "上傳中..." : "上傳圖片"}
            </button>
          </div>
        </div>
      </div>
      <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {ADMIN_LOCALES.map((locale) => (
            <button key={locale} type="button" onClick={() => setActiveLocale(locale)} style={{ padding: "10px 14px", borderRadius: 999, border: activeLocale === locale ? "1px solid #0f172a" : "1px solid #cbd5e1", background: activeLocale === locale ? "#0f172a" : "#fff", color: activeLocale === locale ? "#fff" : "#0f172a" }}>
              {getLocaleLabel(locale)}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span>名稱</span>
            <input value={state.translations[activeLocale].name} onChange={(event) => setState((current) => ({ ...current, translations: { ...current.translations, [activeLocale]: { ...current.translations[activeLocale], name: event.target.value } } }))} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <span>描述</span>
            <textarea value={state.translations[activeLocale].description} onChange={(event) => setState((current) => ({ ...current, translations: { ...current.translations, [activeLocale]: { ...current.translations[activeLocale], description: event.target.value } } }))} rows={6} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <span>SEO 標題</span>
            <input value={state.translations[activeLocale].seoTitle} onChange={(event) => setState((current) => ({ ...current, translations: { ...current.translations, [activeLocale]: { ...current.translations[activeLocale], seoTitle: event.target.value } } }))} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <span>SEO 描述</span>
            <textarea value={state.translations[activeLocale].seoDescription} onChange={(event) => setState((current) => ({ ...current, translations: { ...current.translations, [activeLocale]: { ...current.translations[activeLocale], seoDescription: event.target.value } } }))} rows={4} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
        </div>
      </div>
      <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: 18, marginBottom: 12 }}>產品圖片預覽</h3>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 10 }}>目前縮圖</p>
            {thumbnailMedia ? (
              <div style={{ display: "flex", gap: 14, alignItems: "center", background: "#f8fafc", padding: 12, borderRadius: 12 }}>
                <img src={thumbnailMedia.url} alt={thumbnailMedia.originalFilename} style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 10, border: "1px solid #cbd5e1" }} />
                <div style={{ display: "grid", gap: 4 }}>
                  <strong>{thumbnailMedia.originalFilename}</strong>
                  <span style={{ color: "#64748b", fontSize: 14 }}>Media ID: {thumbnailMedia.id}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: "#64748b" }}>尚未設定產品縮圖</p>
            )}
          </div>
          <div>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 10 }}>產品圖庫</p>
            {galleryItems.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {galleryItems.map((item) => (
                  <div key={item.mediaId} style={{ border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
                    <img src={item.media!.url} alt={item.media!.originalFilename} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: 12, display: "grid", gap: 8 }}>
                      <div>
                        <strong style={{ display: "block" }}>{item.media!.originalFilename}</strong>
                        <span style={{ fontSize: 13, color: "#64748b" }}>Media ID: {item.mediaId}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => setThumbnail(item.mediaId)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #0f172a", background: state.thumbnailMediaId === item.mediaId ? "#0f172a" : "#fff", color: state.thumbnailMediaId === item.mediaId ? "#fff" : "#0f172a" }}>
                          {state.thumbnailMediaId === item.mediaId ? "目前縮圖" : "設為縮圖"}
                        </button>
                        <button type="button" onClick={() => removeGalleryImage(item.mediaId)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#b91c1c" }}>
                          移除圖片
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b" }}>尚未加入任何產品圖片</p>
            )}
          </div>
          <div>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>可用媒體</h4>
            <p style={{ fontSize: 14, color: "#475569" }}>{availableMedia.map((item) => `${item.id}:${item.originalFilename}`).join(" | ") || "尚未上傳任何媒體"}</p>
          </div>
        </div>
      </div>
      {message ? <p style={{ color: "#475569" }}>{message}</p> : null}
      <button type="submit" style={{ padding: 12, borderRadius: 8, background: "#0f172a", color: "#fff", border: 0 }}>儲存產品</button>
    </form>
  );
}
