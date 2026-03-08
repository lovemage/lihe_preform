import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin/guards";
import { getHomeContent, saveHomeContent } from "@/lib/admin/content-repository";

const homeSchema = z.object({
  en: z.record(z.string(), z.unknown()),
  ru: z.record(z.string(), z.unknown()),
  es: z.record(z.string(), z.unknown()),
});

export async function GET() {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  const [en, ru, es] = await Promise.all([
    getHomeContent("en"),
    getHomeContent("ru"),
    getHomeContent("es"),
  ]);

  return NextResponse.json({ en: en.content, ru: ru.content, es: es.content });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return auth.response;

  try {
    const payload = homeSchema.parse(await request.json());
    await Promise.all([
      saveHomeContent("en", payload.en),
      saveHomeContent("ru", payload.ru),
      saveHomeContent("es", payload.es),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Home save failed" }, { status: 400 });
  }
}
