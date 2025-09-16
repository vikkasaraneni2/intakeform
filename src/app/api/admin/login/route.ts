import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body?.token as string | undefined;
  const expected = process.env.ADMIN_ACCESS_TOKEN || "";
  if (!token || token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  // Session-only cookie (no maxAge) so the browser asks each new session
  res.cookies.set("admin_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return res;
}



