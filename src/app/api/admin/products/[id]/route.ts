import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin/guards";
import { deleteProduct, getProductById, saveProduct } from "@/lib/admin/content-repository";

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

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const product = await getProductById(Number(id));

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const payload = productSchema.parse(await request.json());
    const savedId = await saveProduct({ ...payload, id: Number(id) });
    return NextResponse.json({ id: savedId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  await deleteProduct(Number(id));
  return NextResponse.json({ ok: true });
}
