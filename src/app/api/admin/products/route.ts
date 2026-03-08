import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin/guards";
import { listProducts, saveProduct } from "@/lib/admin/content-repository";

const translationSchema = z.object({
  name: z.string(),
  description: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

const productSchema = z.object({
  slug: z.string().min(1),
  categoryKey: z.string().min(1),
  status: z.string().min(1),
  sortOrder: z.number(),
  thumbnailMediaId: z.number().nullable(),
  translations: z.object({
    en: translationSchema,
    ru: translationSchema,
    es: translationSchema,
  }),
  gallery: z.array(z.object({ mediaId: z.number(), sortOrder: z.number(), isPrimary: z.boolean() })),
});

export async function GET() {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  const products = await listProducts();
  return NextResponse.json({ items: products });
}

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  try {
    const payload = productSchema.parse(await request.json());
    const id = await saveProduct(payload);
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Save failed" }, { status: 400 });
  }
}
