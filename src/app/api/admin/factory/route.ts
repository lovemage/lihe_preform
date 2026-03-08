import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin/guards";
import { getFactoryContent, saveFactoryContent } from "@/lib/admin/content-repository";

const factorySchema = z.object({
  en: z.record(z.string(), z.unknown()),
  ru: z.record(z.string(), z.unknown()),
  es: z.record(z.string(), z.unknown()),
});

export async function GET() {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  const [en, ru, es] = await Promise.all([
    getFactoryContent("en"),
    getFactoryContent("ru"),
    getFactoryContent("es"),
  ]);

  return NextResponse.json({ en: en.content, ru: ru.content, es: es.content });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  try {
    const payload = factorySchema.parse(await request.json());
    await Promise.all([
      saveFactoryContent("en", payload.en),
      saveFactoryContent("ru", payload.ru),
      saveFactoryContent("es", payload.es),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Factory save failed" }, { status: 400 });
  }
}
