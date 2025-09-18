import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/jwt";

export async function requireAdmin() {
  const c = cookies();
  const token = c.get("admin_session")?.value;
  const secret = process.env.SESSION_SECRET || "";
  if (!token || !secret) redirect("/admin/login");
  const ok = verifyJwt<{ role?: string }>(token, secret);
  if (!ok || ok.role !== "admin") redirect("/admin/login");
}


