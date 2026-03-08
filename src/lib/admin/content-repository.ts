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

type MediaListRow = MediaRow & {
  translation_locale: AdminLocale | null;
  translation_alt_text: string | null;
};

type ProductListRow = ProductRow & {
  translation_locale: AdminLocale | null;
  translation_name: string | null;
  translation_description: string | null;
  translation_seo_title: string | null;
  translation_seo_description: string | null;
  image_media_id: number | null;
  image_sort_order: number | null;
  image_is_primary: number | null;
};

let schemaInitializationPromise: Promise<void> | null = null;

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
  if (!schemaInitializationPromise) {
    schemaInitializationPromise = (async () => {
      const statements = ADMIN_SCHEMA_SQL.split(";\n\n").map((statement) => statement.trim()).filter(Boolean);

      for (const statement of statements) {
        await d1Exec(statement);
      }
    })().catch((error) => {
      schemaInitializationPromise = null;
      throw error;
    });
  }

  await schemaInitializationPromise;
}

export async function listMedia(): Promise<MediaRecord[]> {
  await ensureAdminSchema();
  const rows = await d1Query<MediaListRow>(`
    SELECT
      m.id,
      m.r2_key,
      m.url,
      m.mime_type,
      m.width,
      m.height,
      m.size_bytes,
      m.original_filename,
      m.created_at,
      m.updated_at,
      t.locale AS translation_locale,
      t.alt_text AS translation_alt_text
    FROM media_assets m
    LEFT JOIN media_asset_translations t ON m.id = t.media_id
    ORDER BY m.id DESC
  `);

  const mediaMap = new Map<number, MediaRecord>();

  for (const row of rows) {
    if (!mediaMap.has(row.id)) {
      mediaMap.set(row.id, {
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
        alt: {},
      });
    }

    if (row.translation_locale) {
      mediaMap.get(row.id)!.alt[row.translation_locale] = row.translation_alt_text ?? "";
    }
  }

  return Array.from(mediaMap.values());
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
  const rows = await d1Query<ProductListRow>(`
    SELECT
      p.id,
      p.slug,
      p.category_key,
      p.status,
      p.sort_order,
      p.thumbnail_media_id,
      p.created_at,
      p.updated_at,
      pt.locale AS translation_locale,
      pt.name AS translation_name,
      pt.description AS translation_description,
      pt.seo_title AS translation_seo_title,
      pt.seo_description AS translation_seo_description,
      pi.media_id AS image_media_id,
      pi.sort_order AS image_sort_order,
      pi.is_primary AS image_is_primary
    FROM products p
    LEFT JOIN product_translations pt ON p.id = pt.product_id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    ORDER BY p.sort_order ASC, p.id DESC, pi.sort_order ASC, pi.id ASC
  `);

  const productMap = new Map<number, ProductRecord>();
  const gallerySeen = new Map<number, Set<string>>();

  for (const row of rows) {
    if (!productMap.has(row.id)) {
      productMap.set(row.id, {
        id: row.id,
        slug: row.slug,
        categoryKey: row.category_key,
        status: row.status,
        sortOrder: row.sort_order,
        thumbnailMediaId: row.thumbnail_media_id,
        translations: {},
        gallery: [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
      gallerySeen.set(row.id, new Set());
    }

    const product = productMap.get(row.id)!;

    if (row.translation_locale) {
      product.translations[row.translation_locale] = {
        name: row.translation_name ?? "",
        description: row.translation_description ?? "",
        seoTitle: row.translation_seo_title ?? "",
        seoDescription: row.translation_seo_description ?? "",
      } satisfies ProductTranslationInput;
    }

    if (row.image_media_id !== null && row.image_sort_order !== null) {
      const galleryKey = `${row.image_media_id}:${row.image_sort_order}:${row.image_is_primary ?? 0}`;
      const seen = gallerySeen.get(row.id)!;

      if (!seen.has(galleryKey)) {
        seen.add(galleryKey);
        product.gallery.push({
          mediaId: row.image_media_id,
          sortOrder: row.image_sort_order,
          isPrimary: row.image_is_primary === 1,
        });
      }
    }
  }

  return Array.from(productMap.values());
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
