import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin/config";
import { verifySessionToken } from "@/lib/admin/session";

export async function verifyAuth(request?: NextRequest) {
  const token = request?.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return {
      authenticated: false as const,
      user: null,
    };
  }

  let session: Awaited<ReturnType<typeof verifySessionToken>> | null = null;

  try {
    session = await verifySessionToken(token);
  } catch {
    session = null;
  }

  if (!session) {
    return {
      authenticated: false as const,
      user: null,
    };
  }

  return {
    authenticated: true as const,
    user: {
      id: session.userId,
      username: session.username,
    },
  };
}
