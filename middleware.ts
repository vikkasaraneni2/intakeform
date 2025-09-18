import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname.startsWith("/admin/login");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminLoginApi = pathname.startsWith("/api/admin/login");

  const jwt = req.cookies.get("admin_session")?.value;
  const secret = process.env.SESSION_SECRET || "";

  if ((isAdminPath && !isAdminLogin) || (isAdminApi && !isAdminLoginApi)) {
    const payload = jwt && secret ? verifyJwt<{ role?: string }>(jwt, secret) : null;
    const ok = !!payload && payload.role === "admin";
    if (!ok) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};


