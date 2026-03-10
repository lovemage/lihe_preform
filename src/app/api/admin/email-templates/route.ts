import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin/guards";
import { d1Exec, d1First } from "@/lib/admin/d1";
import { ensureAdminSchema } from "@/lib/admin/content-repository";

export async function GET() {
  try {
    const auth = await requireAdminApiSession();
    if (!auth.ok) return auth.response;
    await ensureAdminSchema();

    const result = await d1First<{ data: string }>("SELECT data FROM content WHERE id = ?", ["email-templates"]);

    if (!result) {
      return NextResponse.json({ templates: [] }, { status: 200 });
    }

    try {
      const templates = JSON.parse(result.data) as unknown;
      return NextResponse.json(templates);
    } catch {
      return NextResponse.json({ templates: [] }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdminApiSession();
    if (!auth.ok) return auth.response;
    await ensureAdminSchema();

    const body = await request.json();

    if (!body.templates || !Array.isArray(body.templates)) {
      return NextResponse.json(
        { error: "Invalid email templates data" },
        { status: 400 }
      );
    }

    const dataString = JSON.stringify(body);

    await d1Exec(
      `INSERT INTO content (id, data, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
       data = excluded.data,
       updated_at = excluded.updated_at`,
      ["email-templates", dataString],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating email templates:", error);
    return NextResponse.json(
      { error: "Failed to update email templates" },
      { status: 500 }
    );
  }
}
