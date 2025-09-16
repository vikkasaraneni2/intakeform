import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname.startsWith("/admin/login");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminLoginApi = pathname.startsWith("/api/admin/login");

  const token = req.cookies.get("admin_token")?.value;
  const expected = process.env.ADMIN_ACCESS_TOKEN || "";

  if ((isAdminPath && !isAdminLogin) || (isAdminApi && !isAdminLoginApi)) {
    if (!token || token !== expected) {
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


