import { promises as fs } from "fs";
import path from "path";
import { ADMIN_LOCALES, PUBLISH_LOCALES, type AdminLocale } from "@/lib/admin/locales";
import { d1Exec, d1First, d1Query } from "@/lib/admin/d1";
import { ADMIN_SCHEMA_SQL } from "@/lib/admin/schema";
import type {
  HomeContentRecord,
  MediaRecord,
  ProductRecord,
  ProductTranslationInput,
} from "@/types/admin";

type ProductSaveInput = Omit<ProductRecord, "id" | "createdAt" | "updatedAt"> & {
  id?: number;
};

type ProductRow = {
  id: number;
  slug: string;
  category_key: string;
  status: string;
  sort_order: number;
  thumbnail_media_id: number | null;
  created_at: string;
  updated_at: string;
};

type ProductTranslationRow = {
  product_id: number;
  locale: AdminLocale;
  name: string;
  description: string;
  seo_title: string;
  seo_description: string;
};

type ProductImageRow = {
  product_id: number;
  media_id: number;
  sort_order: number;
  is_primary: number;
};

type MediaRow = {
  id: number;
  r2_key: string;
  url: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  original_filename: string;
  created_at: string;
  updated_at: string;
};

type MediaTranslationRow = {
  media_id: number;
  locale: AdminLocale;
  alt_text: string;
};

type HomeDocumentRow = {
  locale: AdminLocale;
  content_json: string;
  updated_at: string;
};

type FactoryDocumentRow = {
  locale: AdminLocale;
  content_json: string;
  updated_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function readLocaleJsonFile(locale: AdminLocale, filename: string) {
  try {
    const filePath = path.join(process.cwd(), "data", locale, filename);
    const raw = await fs.readFile(filePath, "utf-8");
    return parseJson<Record<string, unknown>>(raw, {});
  } catch {
    return {};
  }
}

export async function ensureAdminSchema() {
  const statements = ADMIN_SCHEMA_SQL.split(";\n\n").map((statement) => statement.trim()).filter(Boolean);

  for (const statement of statements) {
    await d1Exec(statement);
  }
}

export async function listMedia(): Promise<MediaRecord[]> {
  await ensureAdminSchema();
  const mediaRows = await d1Query<MediaRow>("SELECT * FROM media_assets ORDER BY id DESC");
  const translationRows = await d1Query<MediaTranslationRow>("SELECT * FROM media_asset_translations");

  return mediaRows.map((row) => ({
    id: row.id,
    r2Key: row.r2_key,
    url: row.url,
    mimeType: row.mime_type,
    width: row.width,
    height: row.height,
    sizeBytes: row.size_bytes,
    originalFilename: row.original_filename,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    alt: Object.fromEntries(
      translationRows
        .filter((translation) => translation.media_id === row.id)
        .map((translation) => [translation.locale, translation.alt_text]),
    ),
  }));
}

export async function createMediaRecord(input: {
  r2Key: string;
  url: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  originalFilename: string;
}) {
  await ensureAdminSchema();
  const timestamp = nowIso();

  await d1Exec(
    `INSERT INTO media_assets (r2_key, url, mime_type, width, height, size_bytes, original_filename, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.r2Key,
      input.url,
      input.mimeType,
      input.width,
      input.height,
      input.sizeBytes,
      input.originalFilename,
      timestamp,
      timestamp,
    ],
  );

  const row = await d1First<{ id: number }>("SELECT id FROM media_assets WHERE r2_key = ?", [input.r2Key]);

  if (!row) {
    throw new Error("Failed to create media record");
  }

  for (const locale of ADMIN_LOCALES) {
    await d1Exec(
      "INSERT OR IGNORE INTO media_asset_translations (media_id, locale, alt_text) VALUES (?, ?, ?)",
      [row.id, locale, ""],
    );
  }

  return row.id;
}

export async function updateMediaTranslations(mediaId: number, alt: Partial<Record<AdminLocale, string>>) {
  await ensureAdminSchema();

  for (const locale of ADMIN_LOCALES) {
    await d1Exec(
      `INSERT INTO media_asset_translations (media_id, locale, alt_text)
       VALUES (?, ?, ?)
       ON CONFLICT(media_id, locale) DO UPDATE SET alt_text = excluded.alt_text`,
      [mediaId, locale, alt[locale] ?? ""],
    );
  }
}

export async function listProducts(): Promise<ProductRecord[]> {
  await ensureAdminSchema();
  const productRows = await d1Query<ProductRow>("SELECT * FROM products ORDER BY sort_order ASC, id DESC");
  const translationRows = await d1Query<ProductTranslationRow>("SELECT * FROM product_translations");
  const imageRows = await d1Query<ProductImageRow>("SELECT * FROM product_images ORDER BY sort_order ASC, id ASC");

  return productRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    categoryKey: row.category_key,
    status: row.status,
    sortOrder: row.sort_order,
    thumbnailMediaId: row.thumbnail_media_id,
    translations: Object.fromEntries(
      translationRows
        .filter((translation) => translation.product_id === row.id)
        .map((translation) => [
          translation.locale,
          {
            name: translation.name,
            description: translation.description,
            seoTitle: translation.seo_title,
            seoDescription: translation.seo_description,
          } satisfies ProductTranslationInput,
        ]),
    ),
    gallery: imageRows
      .filter((image) => image.product_id === row.id)
      .map((image) => ({
        mediaId: image.media_id,
        sortOrder: image.sort_order,
        isPrimary: image.is_primary === 1,
      })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getProductById(id: number) {
  const products = await listProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function saveProduct(input: ProductSaveInput) {
  await ensureAdminSchema();
  const timestamp = nowIso();
  const productId = input.id ?? null;

  if (productId) {
    await d1Exec(
      `UPDATE products
       SET slug = ?, category_key = ?, status = ?, sort_order = ?, thumbnail_media_id = ?, updated_at = ?
       WHERE id = ?`,
      [
        input.slug,
        input.categoryKey,
        input.status,
        input.sortOrder,
        input.thumbnailMediaId,
        timestamp,
        productId,
      ],
    );
  } else {
    await d1Exec(
      `INSERT INTO products (slug, category_key, status, sort_order, thumbnail_media_id, source_legacy_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.slug,
        input.categoryKey,
        input.status,
        input.sortOrder,
        input.thumbnailMediaId,
        null,
        timestamp,
        timestamp,
      ],
    );
  }

  const resolved = productId
    ? { id: productId }
    : await d1First<{ id: number }>("SELECT id FROM products WHERE slug = ? ORDER BY id DESC LIMIT 1", [input.slug]);

  if (!resolved) {
    throw new Error("Failed to persist product");
  }

  for (const locale of ADMIN_LOCALES) {
    const translation = input.translations[locale] ?? {
      name: "",
      description: "",
      seoTitle: "",
      seoDescription: "",
    };

    await d1Exec(
      `INSERT INTO product_translations (product_id, locale, name, description, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(product_id, locale) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         seo_title = excluded.seo_title,
         seo_description = excluded.seo_description`,
      [
        resolved.id,
        locale,
        translation.name,
        translation.description,
        translation.seoTitle,
        translation.seoDescription,
      ],
    );
  }

  await d1Exec("DELETE FROM product_images WHERE product_id = ?", [resolved.id]);

  for (const image of input.gallery) {
    await d1Exec(
      "INSERT INTO product_images (product_id, media_id, sort_order, is_primary) VALUES (?, ?, ?, ?)",
      [resolved.id, image.mediaId, image.sortOrder, image.isPrimary ? 1 : 0],
    );
  }

  return resolved.id;
}

export async function deleteProduct(id: number) {
  await ensureAdminSchema();
  await d1Exec("DELETE FROM product_images WHERE product_id = ?", [id]);
  await d1Exec("DELETE FROM product_translations WHERE product_id = ?", [id]);
  await d1Exec("DELETE FROM products WHERE id = ?", [id]);
}

export async function getHomeContent(locale: AdminLocale): Promise<HomeContentRecord> {
  await ensureAdminSchema();
  const row = await d1First<HomeDocumentRow>("SELECT * FROM home_documents WHERE locale = ?", [locale]);

  return {
    locale,
    content: row ? parseJson<Record<string, unknown>>(row.content_json, {}) : {},
    updatedAt: row?.updated_at ?? nowIso(),
  };
}

export async function saveHomeContent(locale: AdminLocale, content: Record<string, unknown>) {
  await ensureAdminSchema();
  const timestamp = nowIso();

  await d1Exec(
    `INSERT INTO home_documents (locale, content_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(locale) DO UPDATE SET content_json = excluded.content_json, updated_at = excluded.updated_at`,
    [locale, JSON.stringify(content, null, 2), timestamp],
  );
}

export async function getFactoryContent(locale: AdminLocale): Promise<HomeContentRecord> {
  await ensureAdminSchema();
  const row = await d1First<FactoryDocumentRow>("SELECT * FROM factory_documents WHERE locale = ?", [locale]);
  const fallbackContent = row ? {} : await readLocaleJsonFile(locale, "factory.json");

  return {
    locale,
    content: row ? parseJson<Record<string, unknown>>(row.content_json, {}) : fallbackContent,
    updatedAt: row?.updated_at ?? nowIso(),
  };
}

export async function saveFactoryContent(locale: AdminLocale, content: Record<string, unknown>) {
  await ensureAdminSchema();
  const timestamp = nowIso();

  await d1Exec(
    `INSERT INTO factory_documents (locale, content_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(locale) DO UPDATE SET content_json = excluded.content_json, updated_at = excluded.updated_at`,
    [locale, JSON.stringify(content, null, 2), timestamp],
  );
}

async function ensureDirectory(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function publishHomeJson(locale: (typeof PUBLISH_LOCALES)[number]) {
  const home = await getHomeContent(locale);
  const targetFile = path.join(process.cwd(), "data", locale, "home.json");
  await ensureDirectory(targetFile);
  await fs.writeFile(targetFile, JSON.stringify(home.content, null, 2) + "\n", "utf-8");
  return targetFile;
}

export async function publishFactoryJson(locale: (typeof PUBLISH_LOCALES)[number]) {
  const factory = await getFactoryContent(locale);
  const targetFile = path.join(process.cwd(), "data", locale, "factory.json");
  await ensureDirectory(targetFile);
  await fs.writeFile(targetFile, JSON.stringify(factory.content, null, 2) + "\n", "utf-8");
  return targetFile;
}

export async function publishProductsJson(locale: (typeof PUBLISH_LOCALES)[number]) {
  const products = await listProducts();
  const media = await listMedia();
  const mediaMap = new Map(media.map((item) => [item.id, item]));

  const payload = {
    source: "admin-d1",
    company: "Foshan Lihe Precision Machinery Co.,Ltd.",
    crawled_at: new Date().toISOString().slice(0, 10),
    categories: Array.from(new Set(products.map((product) => product.categoryKey))).filter(Boolean),
    products: products.map((product) => {
      const translation = product.translations[locale] ?? product.translations.en ?? product.translations.ru ?? product.translations.es;
      const images = product.gallery.map((image) => {
        const mediaItem = mediaMap.get(image.mediaId);
        const alt = mediaItem?.alt[locale] ?? mediaItem?.alt.en ?? translation?.name ?? product.slug;

        return {
          src: mediaItem?.url ?? "",
          alt,
        };
      }).filter((image) => image.src);
      const thumbnailMedia = product.thumbnailMediaId ? mediaMap.get(product.thumbnailMediaId) : undefined;

      return {
        id: product.id,
        name: translation?.name ?? product.slug,
        category: product.categoryKey,
        description: translation?.description ?? "",
        images,
        thumbnail: {
          src: thumbnailMedia?.url ?? images[0]?.src ?? "",
          alt: thumbnailMedia?.alt[locale] ?? thumbnailMedia?.alt.en ?? translation?.name ?? product.slug,
        },
      };
    }),
  };

  const targetFile = path.join(process.cwd(), "data", locale, "products-data.json");
  await ensureDirectory(targetFile);
  await fs.writeFile(targetFile, JSON.stringify(payload, null, 2) + "\n", "utf-8");
  return targetFile;
}
