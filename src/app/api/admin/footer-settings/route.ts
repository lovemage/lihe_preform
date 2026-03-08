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
      .bind("footer-settings")
      .first<{ data: string }>();

    if (!result) {
      return NextResponse.json(
        { error: "Footer settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(JSON.parse(result.data));
  } catch (error) {
    console.error("Error fetching footer settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer settings" },
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
    if (!body.logo || !body.description || !body.contact) {
      return NextResponse.json(
        { error: "Invalid footer settings data" },
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
      .bind("footer-settings", dataString)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating footer settings:", error);
    return NextResponse.json(
      { error: "Failed to update footer settings" },
      { status: 500 }
    );
  }
}
