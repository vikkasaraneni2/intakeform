import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear cookie immediately
  res.cookies.set("admin_token", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}


