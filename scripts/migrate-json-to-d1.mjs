import fs from "fs/promises";
import path from "path";

const adminSchemaSql = `
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  original_filename TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_asset_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_id INTEGER NOT NULL,
  locale TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  UNIQUE(media_id, locale)
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  category_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  thumbnail_media_id INTEGER,
  source_legacy_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  locale TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  UNIQUE(product_id, locale)
);

CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS home_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL UNIQUE,
  content_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
const apiToken = process.env.CLOUDFLARE_D1_API_TOKEN;

if (!accountId || !databaseId || !apiToken) {
  throw new Error("Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, or CLOUDFLARE_D1_API_TOKEN");
}

async function readJson(locale, file) {
  const target = path.join(process.cwd(), "data", locale, file);
  const raw = await fs.readFile(target, "utf-8");
  return JSON.parse(raw);
}

function nowIso() {
  return new Date().toISOString();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

async function d1Query(sql, params = []) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );

  if (!response.ok) {
    throw new Error(`D1 query failed with status ${response.status}`);
  }

  const payload = await response.json();
  const first = payload.result?.[0];

  if (!payload.success || !first?.success) {
    throw new Error(first?.error ?? payload.errors?.[0]?.message ?? "Unknown D1 error");
  }

  return first.results ?? [];
}

async function d1Exec(sql, params = []) {
  await d1Query(sql, params);
}

async function ensureSchema() {
  const statements = adminSchemaSql.split(";\n\n").map((statement) => statement.trim()).filter(Boolean);

  for (const statement of statements) {
    await d1Exec(statement);
  }
}

async function resetImportTables() {
  const statements = [
    "DELETE FROM product_images",
    "DELETE FROM product_translations",
    "DELETE FROM products",
    "DELETE FROM media_asset_translations",
    "DELETE FROM media_assets",
    "DELETE FROM home_documents",
  ];

  for (const statement of statements) {
    await d1Exec(statement);
  }
}

async function createMediaAsset(src, altsByLocale) {
  const timestamp = nowIso();
  const normalizedSrc = typeof src === "string" ? src.trim() : "";
  const r2Key = normalizedSrc.replace(/^\//, "");
  const originalFilename = path.basename(normalizedSrc || "asset.webp");

  await d1Exec(
    `INSERT INTO media_assets (r2_key, url, mime_type, width, height, size_bytes, original_filename, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [r2Key, normalizedSrc, "image/webp", null, null, null, originalFilename, timestamp, timestamp],
  );

  const row = await d1Query("SELECT id FROM media_assets WHERE r2_key = ? LIMIT 1", [r2Key]);
  const mediaId = row[0]?.id;

  if (!mediaId) {
    throw new Error(`Failed to resolve media id for ${normalizedSrc}`);
  }

  for (const locale of ["en", "ru", "es"]) {
    await d1Exec(
      `INSERT INTO media_asset_translations (media_id, locale, alt_text)
       VALUES (?, ?, ?)
       ON CONFLICT(media_id, locale) DO UPDATE SET alt_text = excluded.alt_text`,
      [mediaId, locale, altsByLocale[locale] ?? ""],
    );
  }

  return mediaId;
}

async function importHomeDocuments(homeEn, homeRu) {
  const timestamp = nowIso();
  const documents = [
    ["en", homeEn],
    ["ru", homeRu],
    ["es", {}],
  ];

  for (const [locale, content] of documents) {
    await d1Exec(
      `INSERT INTO home_documents (locale, content_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(locale) DO UPDATE SET content_json = excluded.content_json, updated_at = excluded.updated_at`,
      [locale, JSON.stringify(content, null, 2), timestamp],
    );
  }
}

async function importProducts(productsEn, productsRu) {
  const mediaIdBySrc = new Map();

  for (const [index, productEn] of productsEn.products.entries()) {
    const productRu = productsRu.products.find((item) => item.id === productEn.id);
    const timestamp = nowIso();
    const slugBase = slugify(productEn.name || `product-${productEn.id}`);
    const slug = `${slugBase}-${productEn.id}`;
    const categoryKey = slugify(productEn.category || "uncategorized");

    await d1Exec(
      `INSERT INTO products (slug, category_key, status, sort_order, thumbnail_media_id, source_legacy_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, categoryKey, "published", index, null, String(productEn.id), timestamp, timestamp],
    );

    const productRows = await d1Query("SELECT id FROM products WHERE slug = ? LIMIT 1", [slug]);
    const productId = productRows[0]?.id;

    if (!productId) {
      throw new Error(`Failed to resolve product id for ${slug}`);
    }

    const localized = {
      en: productEn,
      ru: productRu ?? { name: "", description: "", category: "" },
      es: { name: "", description: "", category: "" },
    };

    for (const locale of ["en", "ru", "es"]) {
      const item = localized[locale];
      await d1Exec(
        `INSERT INTO product_translations (product_id, locale, name, description, seo_title, seo_description)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(product_id, locale) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           seo_title = excluded.seo_title,
           seo_description = excluded.seo_description`,
        [
          productId,
          locale,
          item.name ?? "",
          item.description ?? "",
          item.name ?? "",
          item.description ?? "",
        ],
      );
    }

    const thumbnailSrc = productEn.thumbnail?.src ?? productEn.images?.[0]?.src ?? "";
    const imageSources = Array.from(
      new Set([
        ...((productEn.images ?? []).map((image) => image.src)),
        ...((productRu?.images ?? []).map((image) => image.src)),
        thumbnailSrc,
      ].filter(Boolean)),
    );

    for (const [imageIndex, src] of imageSources.entries()) {
      let mediaId = mediaIdBySrc.get(src);

      if (!mediaId) {
        const enAlt = productEn.images?.find((image) => image.src === src)?.alt
          ?? (productEn.thumbnail?.src === src ? productEn.thumbnail.alt : "")
          ?? productEn.name
          ?? "";
        const ruAlt = productRu?.images?.find((image) => image.src === src)?.alt
          ?? (productRu?.thumbnail?.src === src ? productRu.thumbnail.alt : "")
          ?? productRu?.name
          ?? "";

        mediaId = await createMediaAsset(src, { en: enAlt, ru: ruAlt, es: "" });
        mediaIdBySrc.set(src, mediaId);
      }

      await d1Exec(
        "INSERT INTO product_images (product_id, media_id, sort_order, is_primary) VALUES (?, ?, ?, ?)",
        [productId, mediaId, imageIndex, src === thumbnailSrc ? 1 : 0],
      );

      if (src === thumbnailSrc) {
        await d1Exec("UPDATE products SET thumbnail_media_id = ?, updated_at = ? WHERE id = ?", [mediaId, nowIso(), productId]);
      }
    }
  }
}

async function main() {
  const homeEn = await readJson("en", "home.json");
  const homeRu = await readJson("ru", "home.json");
  const productsEn = await readJson("en", "products-data.json");
  const productsRu = await readJson("ru", "products-data.json");

  await ensureSchema();
  await resetImportTables();
  await importHomeDocuments(homeEn, homeRu);
  await importProducts(productsEn, productsRu);

  console.log("Imported local home and product JSON into Cloudflare D1.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
