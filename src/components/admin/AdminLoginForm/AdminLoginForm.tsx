"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "登入失敗");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, maxWidth: 360, width: "100%" }}>
      <label style={{ display: "grid", gap: 8 }}>
        <span>帳號</span>
        <input value={username} onChange={(event) => setUsername(event.target.value)} required style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
      </label>
      <label style={{ display: "grid", gap: 8 }}>
        <span>密碼</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
      </label>
      {error ? <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p> : null}
      <button type="submit" disabled={loading} style={{ padding: 12, borderRadius: 8, background: "#0f172a", color: "#fff", border: 0 }}>
        {loading ? "登入中..." : "登入"}
      </button>
    </form>
  );
}
