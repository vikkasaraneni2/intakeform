import { NextRequest, NextResponse } from "next/server";
import { signJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body?.token as string | undefined;
  const expected = process.env.ADMIN_ACCESS_TOKEN || "";
  if (!token || token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const secret = process.env.SESSION_SECRET || cryptoRandom();
  const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 60 minutes
  const jwt = signJwt({ sub: "admin", role: "admin", iat: Math.floor(Date.now() / 1000), exp }, secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", jwt, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return res;
}

function cryptoRandom() {
  // Non-cryptographic fallback for missing SESSION_SECRET in dev
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}



