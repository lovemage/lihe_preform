#!/usr/bin/env node
/**
 * Writes data/sitemap-lastmod.json: the date each sitemap page's content last changed.
 *
 * Each page/locale gets a hash of the content it renders (its data JSON slice + its page
 * guide). The stored date only moves when that hash changes, so rebuilding or redeploying
 * never bumps <lastmod>. A changed entry takes the last git commit date of its source files
 * (today when those files have uncommitted edits or git history is unavailable).
 *
 * Usage: node scripts/build-lastmod.mjs [--check]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "data", "sitemap-lastmod.json");
const LOCALES = ["en", "ru", "es"];
const CHECK = process.argv.includes("--check");

// Keep in sync with CATEGORY_SLUGS in src/lib/categories.ts.
const CATEGORY_SLUGS = {
  "Blow mold": "blow-mold",
  "Compression mold": "compression-mold",
  "Closure mold": "closure-mold",
  "Preform mold": "preform-mold",
  "Hotrunner system": "hot-runner-system",
  Accessories: "accessories",
  "High precision mold base manufacturing": "mold-base",
  "QC equipment": "qc-equipment",
  "Machining equipment": "machining-equipment",
};

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const hash = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
const today = () => new Date().toISOString().slice(0, 10);

function guideFile(key) {
  return `content/guides/${key}.json`;
}

function guideContent(key, locale) {
  const rel = guideFile(key);
  if (!fs.existsSync(path.join(ROOT, rel))) return null;
  const guide = readJson(rel);
  return { updated: guide.updated, sources: guide.sources, content: guide.locales?.[locale] };
}

function gitDate(files) {
  const existing = files.filter((file) => fs.existsSync(path.join(ROOT, file)));
  if (existing.length === 0) return null;
  try {
    const dirty = execFileSync("git", ["status", "--porcelain", "--", ...existing], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    if (dirty) return null;
    const shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    if (shallow === "true") return null;
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...existing], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  } catch {
    return null;
  }
}

function collectPages() {
  const pages = [];
  const staticPages = [
    { page: "", file: "home.json", guide: "page-home" },
    { page: "/about", file: "about.json", guide: "page-about" },
    { page: "/factory", file: "factory.json", guide: "page-factory" },
    { page: "/equipment", file: "equipment.json", guide: "page-equipment" },
    { page: "/equipment/qc", file: "equipment.json", guide: "page-qc" },
    { page: "/equipment/machining", file: "equipment.json", guide: "page-machining" },
    { page: "/products", file: "products-data.json", guide: "page-products" },
    { page: "/contact", file: "contact.json", guide: "page-contact" },
  ];

  const enProducts = readJson("data/en/products-data.json");

  for (const locale of LOCALES) {
    for (const { page, file, guide } of staticPages) {
      const dataFile = `data/${locale}/${file}`;
      let data = readJson(dataFile);
      if (file === "products-data.json") {
        // The list page shows names, categories and thumbnails only.
        data = data.products.map((p) => [p.id, p.name, p.category, p.thumbnail]);
      }
      pages.push({
        page,
        locale,
        content: { data, guide: guideContent(guide, locale) },
        files: [dataFile, guideFile(guide)],
      });
    }

    const productsFile = `data/${locale}/products-data.json`;
    const products = readJson(productsFile);

    products.categories.forEach((name, index) => {
      const slug = CATEGORY_SLUGS[enProducts.categories[index]];
      if (!slug) return;
      const guide = `category-${slug}`;
      pages.push({
        page: `/products/category/${slug}`,
        locale,
        content: {
          name,
          description: products.categoryDescriptions?.[name] ?? null,
          products: products.products
            .filter((p) => p.category === name)
            .map((p) => [p.id, p.name, p.thumbnail]),
          guide: guideContent(guide, locale),
        },
        files: [productsFile, guideFile(guide)],
      });
    });

    for (const product of products.products) {
      const guide = `product-${product.id}`;
      const { detail_url: _ignored, ...shown } = product;
      pages.push({
        page: `/products/${product.id}`,
        locale,
        content: { product: shown, guide: guideContent(guide, locale) },
        files: [productsFile, guideFile(guide)],
      });
    }
  }

  return pages;
}

const previous = fs.existsSync(OUT) ? readJson("data/sitemap-lastmod.json") : { pages: {} };
const next = { pages: {} };
let changed = 0;

for (const { page, locale, content, files } of collectPages()) {
  const key = page || "/";
  const digest = hash(content);
  const before = previous.pages?.[key]?.[locale];
  let lastmod = before?.lastmod;
  if (!before || before.hash !== digest) {
    lastmod = gitDate(files) ?? today();
    changed += 1;
  }
  next.pages[key] ??= {};
  next.pages[key][locale] = { hash: digest, lastmod };
}

const output = `${JSON.stringify(next, null, 2)}\n`;
const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";

if (CHECK) {
  if (output !== current) {
    console.error(`sitemap-lastmod.json is out of date (${changed} entries). Run: node scripts/build-lastmod.mjs`);
    process.exit(1);
  }
  console.log("sitemap-lastmod.json is up to date.");
} else if (output !== current) {
  fs.writeFileSync(OUT, output);
  console.log(`sitemap-lastmod.json: ${changed} entries updated.`);
} else {
  console.log("sitemap-lastmod.json: no content changes.");
}
