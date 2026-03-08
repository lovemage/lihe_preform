import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin/guards";
import { uploadImageToR2 } from "@/lib/admin/media";

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "shared");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required" }, { status: 400 });
    }

    const uploaded = await uploadImageToR2(file, folder);
    return NextResponse.json(uploaded);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
