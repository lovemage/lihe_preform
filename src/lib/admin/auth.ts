import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminConfig } from "@/lib/admin/config";
import { createSessionToken, verifySessionToken } from "@/lib/admin/session";

function timingSafeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function hashPassword(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function authenticateAdmin(username: string, password: string) {
  const config = getAdminConfig();
  const expectedHash = config.passwordHash ?? (config.password ? hashPassword(config.password) : undefined);

  if (!expectedHash) {
    throw new Error("ADMIN_PASSWORD or ADMIN_PASSWORD_HASH must be configured");
  }

  const validUsername = timingSafeCompare(username, config.username);
  const validPassword = timingSafeCompare(hashPassword(password), expectedHash);

  if (!validUsername || !validPassword) {
    return null;
  }

  return {
    id: "admin",
    username: config.username,
  };
}

export async function setAdminSession(user: { id: string; username: string }) {
  const token = await createSessionToken({ sub: user.id, username: user.username });
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
