import fs from "fs/promises";
import path from "path";

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(target)));
    } else {
      files.push(target);
    }
  }

  return files;
}

async function main() {
  const root = path.join(process.cwd(), "public", "images");
  const files = await walk(root);
  console.log(JSON.stringify(files, null, 2));
  console.log("Use this manifest to batch convert and upload legacy public/images assets into Cloudflare R2.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
