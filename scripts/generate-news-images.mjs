#!/usr/bin/env node
// Generate the two images for a news article with OpenRouter FLUX.3.
// Usage:
//   OPENROUTER_API_KEY=... node scripts/generate-news-images.mjs <slug> "<hero prompt>" "<detail prompt>"
// Writes public/images/news/<slug>-hero.webp, <slug>-detail.webp (1600px wide)
// and <slug>-hero-og.jpg (1200x630) for og:image.
//
// Pure image models must use POST /api/v1/images, not /chat/completions.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "public", "images", "news");
const MODEL = "black-forest-labs/flux-3-image";
const STYLE =
  "Professional corporate industrial photography, realistic, clean modern precision mold factory, " +
  "neutral steel and navy tones, sharp focus, no text, no letters, no logo, no watermark, no people's faces";

const [slug, heroPrompt, detailPrompt] = process.argv.slice(2);
if (!slug || !heroPrompt || !detailPrompt) {
  console.error('Usage: node scripts/generate-news-images.mjs <slug> "<hero prompt>" "<detail prompt>"');
  process.exit(1);
}
const key = process.env.OPENROUTER_API_KEY;
if (!key) {
  console.error("OPENROUTER_API_KEY is not set");
  process.exit(1);
}

async function generate(prompt) {
  const res = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt: `${prompt}. ${STYLE}`, aspect_ratio: "16:9" }),
  });
  const data = await res.json();
  if (!res.ok || !data.data?.[0]?.b64_json) {
    throw new Error(`OpenRouter ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return { buffer: Buffer.from(data.data[0].b64_json, "base64"), cost: data.usage?.cost ?? 0 };
}

fs.mkdirSync(OUT, { recursive: true });
const [hero, detail] = await Promise.all([generate(heroPrompt), generate(detailPrompt)]);

await sharp(hero.buffer).resize({ width: 1600 }).webp({ quality: 82 }).toFile(path.join(OUT, `${slug}-hero.webp`));
await sharp(hero.buffer)
  .resize({ width: 1200, height: 630, fit: "cover" })
  .jpeg({ quality: 85 })
  .toFile(path.join(OUT, `${slug}-hero-og.jpg`));
await sharp(detail.buffer).resize({ width: 1600 }).webp({ quality: 82 }).toFile(path.join(OUT, `${slug}-detail.webp`));

console.log(`${slug}: hero + detail written, cost US$${(hero.cost + detail.cost).toFixed(3)}`);
