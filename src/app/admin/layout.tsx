"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }
  const is = (p: string) => (pathname.startsWith(p) ? "bg-black text-white" : "bg-neutral-100 text-neutral-800");
  return (
    <div className="space-y-6 p-4">
      <nav className="flex gap-2">
        <Link className={`rounded-lg px-3 py-2 text-sm ${is("/admin/intakes")}`} href="/admin/intakes">Submissions</Link>
        <Link className={`rounded-lg px-3 py-2 text-sm ${is("/admin/dashboard")}`} href="/admin/dashboard">Dashboard</Link>
        <Link className={`rounded-lg px-3 py-2 text-sm ${is("/admin/slots")}`} href="/admin/slots">Slots</Link>
        <button onClick={logout} className="ml-auto rounded-lg bg-neutral-200 px-3 py-2 text-sm text-neutral-800">Logout</button>
      </nav>
      {children}
    </div>
  );
}


