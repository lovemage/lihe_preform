#!/usr/bin/env node
// Merge content/guides/<key>.json (one page guide, all locales) into
// data/<locale>/guides.json, which the site imports statically.
// Keys: page-<name>, product-<id>, category-<slug>.
// Usage: node scripts/build-guides.mjs [--check]

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "content", "guides");
const LOCALES = ["en", "ru", "es"];
const CHECK_ONLY = process.argv.includes("--check");
const MIN_WORDS = { en: 900, ru: 800, es: 800 };

const problems = [];
const fail = (file, msg) => problems.push(`${file}: ${msg}`);
const words = (text) => (text.match(/\p{L}[\p{L}'\-]*/gu) || []).length;

const sectionText = (s) =>
  [
    s.heading,
    ...(s.paragraphs ?? []),
    ...(s.list ?? []),
    ...(s.steps ?? []),
    ...(s.table ? [...s.table.head, ...s.table.rows.flat()] : []),
  ].join(" ");

function validateLocale(file, loc, g) {
  for (const key of ["heading", "intro"]) {
    if (typeof g[key] !== "string" || !g[key].trim()) fail(file, `${loc}.${key} missing`);
  }
  if (!Array.isArray(g.sections) || g.sections.length < 5) {
    fail(file, `${loc}.sections must have >= 5 sections (has ${g.sections?.length ?? 0})`);
    return;
  }
  g.sections.forEach((s, i) => {
    if (!s.heading) fail(file, `${loc}.sections[${i}].heading missing`);
    if (!s.paragraphs && !s.list && !s.steps && !s.table) fail(file, `${loc}.sections[${i}] has no content`);
    s.table?.rows.forEach((row, r) => {
      if (row.length !== s.table.head.length) fail(file, `${loc}.sections[${i}].table.rows[${r}] cell count mismatch`);
    });
  });
  if (!g.sections.some((s) => s.table)) fail(file, `${loc}: needs a comparison table`);
  if (!g.sections.some((s) => s.steps?.length >= 3)) fail(file, `${loc}: needs a steps list (>= 3 steps)`);
  if (!Array.isArray(g.faq) || g.faq.length < 3) fail(file, `${loc}.faq needs >= 3 items`);
  const total = words(
    [g.heading, g.intro, ...g.sections.map(sectionText), ...(g.faq ?? []).flatMap((f) => [f.question, f.answer])].join(" "),
  );
  if (total < MIN_WORDS[loc]) fail(file, `${loc}: ${total} words, needs >= ${MIN_WORDS[loc]}`);
}

function validate(file, guide) {
  if (!/^(page-[a-z-]+|product-\d+|category-[a-z-]+)$/.test(guide.key ?? "")) {
    fail(file, "key must be page-<name>, product-<id> or category-<slug>");
  }
  if (path.basename(file, ".json") !== guide.key) fail(file, "file name must equal key");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(guide.updated ?? "")) fail(file, "updated must be YYYY-MM-DD");
  if (!Array.isArray(guide.sources) || guide.sources.length < 4) {
    fail(file, "sources needs >= 4 external references");
  } else {
    guide.sources.forEach((s, i) => {
      if (!s.label || !/^https:\/\//.test(s.url ?? "")) fail(file, `sources[${i}] needs label and https url`);
      if (/lihe-preform\.com/.test(s.url ?? "")) fail(file, `sources[${i}] must be an external site`);
    });
  }
  for (const loc of LOCALES) {
    if (!guide.locales?.[loc]) fail(file, `locales.${loc} missing`);
    else validateLocale(file, loc, guide.locales[loc]);
  }
}

const files = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => f.endsWith(".json")).sort() : [];
const guides = [];
for (const f of files) {
  try {
    const guide = JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));
    validate(f, guide);
    guides.push(guide);
  } catch (err) {
    fail(f, `invalid JSON: ${err.message}`);
  }
}

if (problems.length) {
  console.error(`build-guides: ${problems.length} problem(s)\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
if (CHECK_ONLY) {
  console.log(`build-guides: ${guides.length} guides OK`);
  process.exit(0);
}

for (const loc of LOCALES) {
  const out = {};
  for (const g of guides) {
    const l = g.locales[loc];
    out[g.key] = {
      key: g.key,
      updated: g.updated,
      heading: l.heading,
      intro: l.intro,
      sections: l.sections,
      faq: l.faq,
      sources: g.sources,
    };
  }
  fs.writeFileSync(path.join(ROOT, "data", loc, "guides.json"), `${JSON.stringify({ guides: out }, null, 2)}\n`);
}
console.log(`build-guides: wrote ${guides.length} guides × ${LOCALES.length} locales`);
