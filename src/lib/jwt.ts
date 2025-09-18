// Node runtime JWT HS256 minimal implementation (for API routes)
import crypto from "crypto";

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function hmacSha256(key: string, data: string): string {
  const mac = crypto.createHmac("sha256", key).update(data).digest();
  return base64url(mac);
}

export function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encHeader = base64url(JSON.stringify(header));
  const encPayload = base64url(JSON.stringify(payload));
  const input = `${encHeader}.${encPayload}`;
  const sig = hmacSha256(secret, input);
  return `${input}.${sig}`;
}

export function verifyJwt<T = Record<string, unknown>>(token: string, secret: string): T | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encHeader, encPayload, signature] = parts;
  const input = `${encHeader}.${encPayload}`;
  const expected = hmacSha256(secret, input);
  if (!timingSafeEqual(signature, expected)) return null;
  try {
    const payload: T & { exp?: number } = JSON.parse(Buffer.from(encPayload, "base64").toString("utf8"));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload as T;
  } catch {
    return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}


