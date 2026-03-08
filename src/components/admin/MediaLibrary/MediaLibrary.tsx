import type { MediaRecord } from "@/types/admin";

export default function MediaLibrary({ items }: { items: MediaRecord[] }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f8fafc" }}>
          <tr>
            <th style={{ textAlign: "left", padding: 12 }}>預覽</th>
            <th style={{ textAlign: "left", padding: 12 }}>Key</th>
            <th style={{ textAlign: "left", padding: 12 }}>網址</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderTop: "1px solid #e2e8f0" }}>
              <td style={{ padding: 12 }}>
                <img src={item.url} alt={item.alt.en ?? item.originalFilename} style={{ width: 96, height: 72, objectFit: "cover", borderRadius: 8 }} />
              </td>
              <td style={{ padding: 12, fontSize: 14 }}>{item.r2Key}</td>
              <td style={{ padding: 12, fontSize: 14, wordBreak: "break-all" }}>{item.url}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
