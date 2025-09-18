import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname.startsWith("/admin/login");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminLoginApi = pathname.startsWith("/api/admin/login");
  const method = req.method.toUpperCase();
  const isWriteMethod = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

  const jwt = req.cookies.get("admin_session")?.value;
  const secret = process.env.SESSION_SECRET || "";

  // Initialize response
  let res = NextResponse.next();

  // Security headers for admin and api
  if (isAdminPath || isAdminApi) {
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Cache-Control", "no-store");
    // CSP (permissive for styles to avoid breaking Next inline)
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "form-action 'self'",
    ].join("; ");
    res.headers.set("Content-Security-Policy", csp);
  }

  // Admin auth: verify JWT
  if ((isAdminPath && !isAdminLogin) || (isAdminApi && !isAdminLoginApi)) {
    const ok = jwt && secret ? await verifyJwtEdge(jwt, secret) : null;
    if (!ok) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: res.headers });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      const r = NextResponse.redirect(url);
      // propagate headers
      res.headers.forEach((v, k) => r.headers.set(k, v));
      return r;
    }
  }

  // Rate limit login attempts (simple in-memory per-edge-instance)
  if (isAdminLoginApi && method === "POST") {
    const ip = getClientIp(req) || "unknown";
    if (!rateLimitAllow(ip, 10, 600)) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: res.headers });
    }
  }

  // CSRF: issue token on admin pages; enforce on admin API write methods (including login)
  const csrfCookie = req.cookies.get("csrf_token")?.value;
  if (isAdminPath && method === "GET" && !csrfCookie) {
    const token = randomToken();
    res.cookies.set("csrf_token", token, { sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  }
  if ((isAdminApi && (isWriteMethod || isAdminLoginApi))) {
    const headerToken = req.headers.get("x-csrf-token") || "";
    if (!csrfCookie || headerToken !== csrfCookie) {
      return NextResponse.json({ error: "Invalid CSRF" }, { status: 403, headers: res.headers });
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

// Helpers
function getClientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    null
  );
}

const rl = (globalThis as any).__rl || ((globalThis as any).__rl = new Map<string, { c: number; r: number }>());
function rateLimitAllow(key: string, max: number, windowSec: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const cur = rl.get(key);
  if (!cur || now > cur.r) {
    rl.set(key, { c: 1, r: now + windowSec });
    return true;
  }
  if (cur.c < max) {
    cur.c++;
    rl.set(key, cur);
    return true;
  }
  return false;
}

function randomToken(): string {
  // Edge-safe random: use Web Crypto
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(base64Url.length / 4) * 4, "=");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function textToUint8Array(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}

function parseJwtPayload(token: string): { payload?: any; sigInput?: string; sig?: string } {
  const parts = token.split(".");
  if (parts.length !== 3) return {};
  const [h, p, s] = parts;
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(p)));
    return { payload: json, sigInput: `${h}.${p}`, sig: s };
  } catch {
    return {};
  }
}

async function verifyJwtEdge(token: string, secret: string): Promise<boolean> {
  const { payload, sigInput, sig } = parseJwtPayload(token);
  if (!payload || !sigInput || !sig) return false;
  const exp = payload.exp ? Number(payload.exp) : 0;
  if (!exp || Math.floor(Date.now() / 1000) > exp) return false;
  const key = textToUint8Array(secret);
  const data = textToUint8Array(sigInput);
  const sigBytes = base64UrlToUint8Array(sig);
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const ab = await crypto.subtle.sign("HMAC", cryptoKey, data.buffer as ArrayBuffer);
    const computed = new Uint8Array(ab);
    return timingSafeEqual(computed, sigBytes);
  } catch {
    return false;
  }
}


