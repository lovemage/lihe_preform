import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";

export async function requireAdminApiSession() {
  const session = await getAdminSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true as const,
    session,
  };
}
