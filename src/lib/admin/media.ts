import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { getR2Config } from "@/lib/admin/config";
import { createMediaRecord } from "@/lib/admin/content-repository";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function createClient() {
  const config = getR2Config();

  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";
}

export async function uploadImageToR2(file: File, folder: string) {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new Error("Unsupported file type");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const transformed = sharp(buffer).rotate().resize({ width: 2400, withoutEnlargement: true });
  const metadata = await transformed.metadata();
  const webpBuffer = await transformed.webp({ quality: 88 }).toBuffer();

  const config = getR2Config();
  const client = createClient();
  const timestamp = new Date();
  const fileName = `${slugify(file.name.replace(/\.[^.]+$/, ""))}-${timestamp.getTime()}.webp`;
  const key = `${folder}/${timestamp.getUTCFullYear()}/${String(timestamp.getUTCMonth() + 1).padStart(2, "0")}/${fileName}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: webpBuffer,
      ContentType: "image/webp",
    }),
  );

  const publicBaseUrl = config.publicBaseUrl.replace(/\/$/, "");
  const url = `${publicBaseUrl}/${key}`;
  const mediaId = await createMediaRecord({
    r2Key: key,
    url,
    mimeType: "image/webp",
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    sizeBytes: webpBuffer.byteLength,
    originalFilename: file.name,
  });

  return {
    id: mediaId,
    r2Key: key,
    url,
    mimeType: "image/webp",
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    sizeBytes: webpBuffer.byteLength,
    originalFilename: file.name,
  };
}
