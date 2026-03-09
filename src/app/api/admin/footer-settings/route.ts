import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyAuth } from "@/lib/auth";

type D1Like = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
  };
};

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const db = (env as { CONTENT_DB: D1Like }).CONTENT_DB;

    const result = await db
      .prepare("SELECT data FROM content WHERE id = ?")
      .bind("footer-settings")
      .first<{ data: string }>();

    if (!result) {
      // Return default settings when none exist yet
      const defaults = {
        logo: { src: "/logo.svg", alt: "Lihe Precision" },
        description: {
          en: "Professional PET preform mold manufacturer",
          ru: "Профессиональный производитель пресс-форм для преформ ПЭТ",
          es: "Fabricante profesional de moldes de preforma PET",
        },
        links: [],
        contact: {
          phone: "+86 757 8555 1234",
          email: "sales@lihe-preform.com",
          address: {
            en: "Foshan, Guangdong Province, China",
            ru: "Фошань, провинция Гуандун, Китай",
            es: "Foshan, Provincia de Guangdong, China",
          },
        },
        social: [],
      };
      return NextResponse.json(defaults);
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
    const db = (env as { CONTENT_DB: D1Like }).CONTENT_DB;

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
