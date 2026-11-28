#!/usr/bin/env node
/**
 * IndexNow submission for lihe-preform.com.
 *
 *   node scripts/indexnow.mjs snapshot          # before deploy: save the live sitemap
 *   node scripts/indexnow.mjs submit            # after deploy: submit URLs whose entry changed
 *   node scripts/indexnow.mjs submit --dry-run  # print the diff, send nothing
 *   node scripts/indexnow.mjs urls <url> ...    # submit an explicit list of URLs
 *
 * "Changed" = added, removed, or <lastmod> differs between the snapshot and the new sitemap
 * (the build output, falling back to the live sitemap). The key file lives in public/.
 *
 * Never fails a deploy: every error is logged and the process exits 0.
 */
import fs from "node:fs";
import path from "node:path";

const HOST = "lihe-preform.com";
const SITE = `https://${HOST}`;
const KEY = "029cd3a063abd191dd284e5e67445f46";
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10000;
const TIMEOUT_MS = 15000;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SNAPSHOT = path.join(ROOT, ".indexnow", "previous-sitemap.xml");
const BUILD_SITEMAP = path.join(ROOT, ".next", "server", "app", "sitemap.xml.body");

const log = (...args) => console.log("[indexnow]", ...args);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "cache-control": "no-cache" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${url} → HTTP ${response.status}`);
  return response.text();
}

function parseSitemap(xml) {
  const entries = new Map();
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
    if (!loc) continue;
    entries.set(loc, block.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1] ?? "");
  }
  return entries;
}

function diffSitemaps(previous, current) {
  const urls = [];
  for (const [loc, lastmod] of current) {
    if (!previous.has(loc) || previous.get(loc) !== lastmod) urls.push(loc);
  }
  for (const loc of previous.keys()) {
    if (!current.has(loc)) urls.push(loc); // removed: lets engines recrawl the 301/404
  }
  return urls.filter((url) => new URL(url).host === HOST);
}

async function keyFileIsLive() {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      if ((await fetchText(`${KEY_LOCATION}?t=${Date.now()}`)).trim() === KEY) return true;
      log(`key file content mismatch (attempt ${attempt})`);
    } catch (error) {
      log(`key file check failed (attempt ${attempt}): ${error.message}`);
    }
    await sleep(5000);
  }
  return false;
}

async function submit(urls) {
  if (urls.length === 0) {
    log("no changed URLs; nothing to submit");
    return;
  }
  if (!(await keyFileIsLive())) {
    log(`skipping: ${KEY_LOCATION} is not served yet`);
    return;
  }
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const urlList = urls.slice(i, i + BATCH_SIZE);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const body = (await response.text()).trim();
      log(`submitted ${urlList.length} URLs → HTTP ${response.status}${body ? ` ${body.slice(0, 200)}` : ""}`);
    } catch (error) {
      log(`submit failed: ${error.message}`);
    }
  }
}

async function main() {
  const [command = "submit", ...rest] = process.argv.slice(2);
  const dryRun = rest.includes("--dry-run");

  if (command === "snapshot") {
    try {
      const xml = await fetchText(`${SITE}/sitemap.xml`);
      fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
      fs.writeFileSync(SNAPSHOT, xml);
      log(`saved live sitemap snapshot (${parseSitemap(xml).size} URLs)`);
    } catch (error) {
      log(`snapshot failed: ${error.message}`);
    }
    return;
  }

  if (command === "urls") {
    const urls = rest.filter((arg) => arg.startsWith("https://"));
    if (dryRun) return log(urls.join("\n"));
    return submit(urls);
  }

  if (command !== "submit") {
    log(`unknown command "${command}"`);
    return;
  }

  if (!fs.existsSync(SNAPSHOT)) {
    log("no snapshot of the previous sitemap; run `snapshot` before deploying. Skipping.");
    return;
  }
  const previous = parseSitemap(fs.readFileSync(SNAPSHOT, "utf8"));

  let currentXml;
  if (fs.existsSync(BUILD_SITEMAP)) {
    currentXml = fs.readFileSync(BUILD_SITEMAP, "utf8");
  } else {
    try {
      currentXml = await fetchText(`${SITE}/sitemap.xml?t=${Date.now()}`);
    } catch (error) {
      log(`could not read the new sitemap: ${error.message}`);
      return;
    }
  }
  const current = parseSitemap(currentXml);
  if (current.size === 0) {
    log("new sitemap has no URLs; skipping");
    return;
  }

  const urls = diffSitemaps(previous, current);
  log(`${urls.length} changed URLs (previous ${previous.size}, current ${current.size})`);
  if (dryRun) {
    urls.forEach((url) => log(url));
    return;
  }
  await submit(urls);
}

main()
  .catch((error) => log(`unexpected error: ${error.message}`))
  .finally(() => process.exit(0));
