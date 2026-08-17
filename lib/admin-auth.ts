import { cookies } from "next/headers";
import { createHmac } from "crypto";

const SECRET = process.env.ADMIN_SECRET || "dev-secret-change-me";

export function signToken(payload: string): string {
  const hmac = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx === -1) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
  return payload === "admin" && sig === expected;
}

export async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyToken(cookieStore.get("admin_session")?.value);
}