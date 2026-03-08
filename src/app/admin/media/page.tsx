import AdminShell from "@/components/admin/AdminShell/AdminShell";
import MediaLibrary from "@/components/admin/MediaLibrary/MediaLibrary";
import MediaUploadForm from "@/components/admin/MediaUploadForm/MediaUploadForm";
import { requireAdminSession } from "@/lib/admin/auth";
import { listMedia } from "@/lib/admin/content-repository";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdminSession();
  const media = await listMedia();

  return (
    <AdminShell title="媒體庫" description="上傳圖片、自動轉換為 WebP，並儲存到 Cloudflare R2。">
      <div style={{ display: "grid", gap: 16 }}>
        <MediaUploadForm />
        <MediaLibrary items={media} />
      </div>
    </AdminShell>
  );
}
