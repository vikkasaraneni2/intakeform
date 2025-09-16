export function assertOrigin(req: Request) {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  const ok =
    base &&
    (origin === base || referer.startsWith(base + "/") || referer.startsWith("http://localhost:"));
  if (!ok) {
    const err = new Error("Forbidden: bad origin") as Error & { status?: number };
    err.status = 403;
    throw err;
  }
}


