import crypto from "crypto";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const username = required("ADMIN_USERNAME");
const password = process.env.ADMIN_PASSWORD;
const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? (password ? crypto.createHash("sha256").update(password).digest("hex") : null);

if (!passwordHash) {
  throw new Error("Set ADMIN_PASSWORD or ADMIN_PASSWORD_HASH before seeding admin");
}

console.log(JSON.stringify({ username, passwordHash }, null, 2));
console.log("Use this password hash to seed the admin_users table in D1 if you choose to persist credentials there later.");
