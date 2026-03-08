import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin/guards";
import { listMedia, updateMediaTranslations } from "@/lib/admin/content-repository";

const updateSchema = z.object({
  id: z.number().int().positive(),
  alt: z.object({
    en: z.string().optional(),
    ru: z.string().optional(),
    es: z.string().optional(),
  }),
});

export async function GET() {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  const media = await listMedia();
  return NextResponse.json({ items: media });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  try {
    const payload = updateSchema.parse(await request.json());
    await updateMediaTranslations(payload.id, payload.alt);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 400 });
  }
}
