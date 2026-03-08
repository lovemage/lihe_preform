import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyAuth } from "@/lib/auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const db = env.DB;

    const result = await db
      .prepare("SELECT data FROM content WHERE id = ?")
      .bind("email-templates")
      .first<{ data: string }>();

    if (!result) {
      return NextResponse.json(
        { templates: [] },
        { status: 200 }
      );
    }

    const templates = JSON.parse(result.data);
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { env } = await getCloudflareContext();
    const db = env.DB;

    // Validate the data structure
    if (!body.templates || !Array.isArray(body.templates)) {
      return NextResponse.json(
        { error: "Invalid email templates data" },
        { status: 400 }
      );
    }

    const dataString = JSON.stringify(body);

    await db
      .prepare(
        `INSERT INTO content (id, data, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET
         data = excluded.data,
         updated_at = excluded.updated_at`
      )
      .bind("email-templates", dataString)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating email templates:", error);
    return NextResponse.json(
      { error: "Failed to update email templates" },
      { status: 500 }
    );
  }
}
