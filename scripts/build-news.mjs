#!/usr/bin/env node
// Merge content/news/<slug>.json (one file per article, all locales) into
// data/<locale>/news.json, which the site imports statically.
// Usage: node scripts/build-news.mjs [--check]
//   --check  validate only, exit 1 on any problem (no files written)

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "content", "news");
const LOCALES = ["en", "ru", "es"];
const CHECK_ONLY = process.argv.includes("--check");

const problems = [];
const fail = (file, msg) => problems.push(`${file}: ${msg}`);

function words(text) {
  return (text.match(/\p{L}[\p{L}'\-]*/gu) || []).length;
}

function sectionText(s) {
  return [
    s.heading,
    ...(s.paragraphs ?? []),
    ...(s.list ?? []),
    ...(s.steps ?? []),
    ...(s.table ? [...s.table.head, ...s.table.rows.flat()] : []),
  ].join(" ");
}

function validateLocale(file, loc, data, article) {
  const where = `${loc}`;
  for (const key of ["category", "title", "summary", "heroAlt", "detailAlt"]) {
    if (typeof data[key] !== "string" || !data[key].trim()) fail(file, `${where}.${key} missing`);
  }
  if (!Array.isArray(data.sections) || data.sections.length < 6) {
    fail(file, `${where}.sections must have >= 6 sections (has ${data.sections?.length ?? 0})`);
    return;
  }
  data.sections.forEach((s, i) => {
    if (!s.heading) fail(file, `${where}.sections[${i}].heading missing`);
    if (!s.paragraphs && !s.list && !s.steps && !s.table) {
      fail(file, `${where}.sections[${i}] has no content`);
    }
    if (s.table) {
      const n = s.table.head.length;
      s.table.rows.forEach((row, r) => {
        if (row.length !== n) fail(file, `${where}.sections[${i}].table.rows[${r}] has ${row.length} cells, head has ${n}`);
      });
    }
  });
  if (!data.sections.some((s) => s.table)) fail(file, `${where}: needs a comparison table`);
  if (!data.sections.some((s) => s.steps?.length >= 3)) fail(file, `${where}: needs a steps list (>= 3 steps)`);
  if (!Array.isArray(data.faq) || data.faq.length < 3) fail(file, `${where}.faq needs >= 3 items`);
  const total = words(
    [data.title, data.summary, ...data.sections.map(sectionText), ...(data.faq ?? []).flatMap((f) => [f.question, f.answer])].join(" "),
  );
  const min = loc === "en" ? 1200 : 1000;
  if (total < min) fail(file, `${where}: ${total} words, needs >= ${min}`);
  return total;
}

function validate(file, article) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(article.slug ?? "")) fail(file, "slug must be kebab-case");
  if (path.basename(file, ".json") !== article.slug) fail(file, "file name must equal slug");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.date ?? "")) fail(file, "date must be YYYY-MM-DD");
  for (const key of ["hero", "detail", "og"]) {
    const src = article.images?.[key];
    if (!src) fail(file, `images.${key} missing`);
    else if (!fs.existsSync(path.join(ROOT, "public", src))) fail(file, `images.${key} not found: public${src}`);
  }
  if (!Array.isArray(article.sources) || article.sources.length < 3) {
    fail(file, "sources needs >= 3 external references");
  } else {
    article.sources.forEach((s, i) => {
      if (!s.label || !/^https:\/\//.test(s.url ?? "")) fail(file, `sources[${i}] needs label and https url`);
      if (/lihe-preform\.com/.test(s.url ?? "")) fail(file, `sources[${i}] must be an external site`);
    });
  }
  for (const loc of LOCALES) {
    if (!article.locales?.[loc]) fail(file, `locales.${loc} missing`);
    else validateLocale(file, loc, article.locales[loc], article);
  }
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".json")).sort();
const articles = [];
for (const f of files) {
  let article;
  try {
    article = JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));
  } catch (err) {
    fail(f, `invalid JSON: ${err.message}`);
    continue;
  }
  validate(f, article);
  articles.push(article);
}

const slugs = articles.map((a) => a.slug);
slugs.forEach((s, i) => {
  if (slugs.indexOf(s) !== i) fail(s, "duplicate slug");
});

if (problems.length) {
  console.error(`build-news: ${problems.length} problem(s)\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

if (CHECK_ONLY) {
  console.log(`build-news: ${articles.length} articles OK`);
  process.exit(0);
}

for (const loc of LOCALES) {
  const out = articles
    .map((a) => {
      const l = a.locales[loc];
      return {
        slug: a.slug,
        date: a.date,
        ...(a.updated ? { updated: a.updated } : {}),
        category: l.category,
        title: l.title,
        summary: l.summary,
        heroImage: { src: a.images.hero, alt: l.heroAlt },
        detailImage: { src: a.images.detail, alt: l.detailAlt },
        ogImage: a.images.og,
        relatedProducts: a.relatedProducts ?? [],
        sections: l.sections,
        faq: l.faq,
        sources: a.sources,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  fs.writeFileSync(
    path.join(ROOT, "data", loc, "news.json"),
    `${JSON.stringify({ articles: out }, null, 2)}\n`,
  );
}
// Keep the article list in public/llms.txt in sync with the published articles.
const llmsPath = path.join(ROOT, "public", "llms.txt");
if (fs.existsSync(llmsPath)) {
  const list = articles
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
    .map((a) => `- [${a.locales.en.title}](https://lihe-preform.com/en/news/${a.slug}/): ${a.locales.en.summary}`)
    .join("\n");
  const llms = fs.readFileSync(llmsPath, "utf8");
  const next = llms.replace(/## Technical articles\n\n[\s\S]*?(?=\n## |$)/, `## Technical articles\n\n${list}\n`);
  if (next !== llms) fs.writeFileSync(llmsPath, next);
}

console.log(`build-news: wrote ${articles.length} articles × ${LOCALES.length} locales`);
