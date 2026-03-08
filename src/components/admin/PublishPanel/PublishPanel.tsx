"use client";

import { useState } from "react";

export default function PublishPanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/admin/publish", {
      method: "POST",
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "發佈失敗");
      return;
    }

    const payload = (await response.json()) as { outputs: string[] };
    setMessage(`已成功發佈 ${payload.outputs.length} 個檔案`);
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 20, marginTop: 24 }}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>發佈前台 JSON</h2>
      <p style={{ color: "#475569", marginBottom: 16 }}>
        將 D1 內容輸出為 `data/en` 與 `data/ru` 的前台 JSON。
      </p>
      <button type="button" onClick={handlePublish} disabled={loading} style={{ padding: "12px 16px", borderRadius: 8, background: "#0f172a", color: "#fff", border: 0 }}>
        {loading ? "發佈中..." : "立即發佈"}
      </button>
      {message ? <p style={{ color: "#475569", marginTop: 12 }}>{message}</p> : null}
    </div>
  );
}
