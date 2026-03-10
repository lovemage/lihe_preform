import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin/guards";
import { d1Exec, d1First } from "@/lib/admin/d1";
import { ensureAdminSchema } from "@/lib/admin/content-repository";

type LocalizedString = {
  en: string;
  ru: string;
  es: string;
};

type FooterSettings = {
  logo: { src: string; alt: string };
  description: LocalizedString;
  links: Array<{ label: LocalizedString; href: string }>;
  contact: {
    phone: string;
    email: string;
    address: LocalizedString;
  };
  social: Array<{ platform: string; href: string }>;
};

const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseFooterSettings(raw: string): FooterSettings | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) return null;
    if (!isObject(parsed.logo)) return null;
    if (!isObject(parsed.description)) return null;
    if (!isObject(parsed.contact)) return null;
    return parsed as FooterSettings;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const auth = await requireAdminApiSession();
    if (!auth.ok) return auth.response;
    await ensureAdminSchema();

    const result = await d1First<{ data: string }>("SELECT data FROM content WHERE id = ?", ["footer-settings"]);

    if (!result) {
      return NextResponse.json(DEFAULT_FOOTER_SETTINGS);
    }

    const parsed = parseFooterSettings(result.data);
    return NextResponse.json(parsed ?? DEFAULT_FOOTER_SETTINGS);
  } catch (error) {
    console.error("Error fetching footer settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdminApiSession();
    if (!auth.ok) return auth.response;
    await ensureAdminSchema();

    const body = (await request.json()) as FooterSettings;

    if (!body.logo || !body.description || !body.contact) {
      return NextResponse.json(
        { error: "Invalid footer settings data" },
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
      ["footer-settings", dataString],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating footer settings:", error);
    return NextResponse.json(
      { error: "Failed to update footer settings" },
      { status: 500 }
    );
  }
}
