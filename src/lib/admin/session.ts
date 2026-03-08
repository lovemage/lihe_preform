import { SignJWT, jwtVerify } from "jose";
import { getAdminConfig } from "@/lib/admin/config";

const encoder = new TextEncoder();
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  sub: string;
  username: string;
};

function getSecret() {
  return encoder.encode(getAdminConfig().sessionSecret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const result = await jwtVerify(token, getSecret());
  return {
    userId: result.payload.sub ?? "admin",
    username: typeof result.payload.username === "string" ? result.payload.username : "admin",
  };
}
