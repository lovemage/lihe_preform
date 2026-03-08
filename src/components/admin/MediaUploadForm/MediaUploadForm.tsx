"use client";

import { useState } from "react";

export default function MediaUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState("shared");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "上傳失敗");
      return;
    }

    setFile(null);
    setMessage("上傳完成，重新整理頁面後即可看到新圖片。");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, padding: 16, background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
      <h2 style={{ fontSize: 20 }}>上傳媒體</h2>
      <input type="text" value={folder} onChange={(event) => setFolder(event.target.value)} placeholder="products" style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
      {message ? <p style={{ fontSize: 14, color: "#475569" }}>{message}</p> : null}
      <button type="submit" style={{ padding: 12, borderRadius: 8, background: "#0f172a", color: "#fff", border: 0 }}>上傳並轉為 WebP</button>
    </form>
  );
}
