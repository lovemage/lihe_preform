import type { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";

export async function verifyAuth(_request?: NextRequest) {
  const session = await getAdminSession();

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
