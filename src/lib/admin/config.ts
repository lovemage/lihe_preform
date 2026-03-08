import { getOptionalEnv, getRequiredEnv } from "@/lib/utils/env";

export const ADMIN_COOKIE_NAME = "lihe_admin_session";

export function getAdminConfig() {
  return {
    username: getRequiredEnv("ADMIN_USERNAME"),
    password: getOptionalEnv("ADMIN_PASSWORD"),
    passwordHash: getOptionalEnv("ADMIN_PASSWORD_HASH"),
    sessionSecret: getRequiredEnv("ADMIN_SESSION_SECRET"),
  };
}

export function getD1Config() {
  return {
    accountId: getRequiredEnv("CLOUDFLARE_ACCOUNT_ID"),
    databaseId: getRequiredEnv("CLOUDFLARE_D1_DATABASE_ID"),
    apiToken: getRequiredEnv("CLOUDFLARE_D1_API_TOKEN"),
  };
}

export function getR2Config() {
  return {
    accountId: getRequiredEnv("CLOUDFLARE_ACCOUNT_ID"),
    accessKeyId: getRequiredEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    bucket: getRequiredEnv("CLOUDFLARE_R2_BUCKET"),
    publicBaseUrl: getRequiredEnv("CLOUDFLARE_R2_PUBLIC_BASE_URL"),
  };
}
