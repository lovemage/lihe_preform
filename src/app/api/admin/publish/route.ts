import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin/guards";
import { publishContent } from "@/lib/admin/publish";

export async function POST() {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  try {
    const outputs = await publishContent();
    return NextResponse.json({ ok: true, outputs });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Publish failed" }, { status: 500 });
  }
}
