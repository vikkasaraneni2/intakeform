"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

export const dynamic = "force-dynamic";

function LoginInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const csrf = getCsrf();
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": csrf || "" }, body: JSON.stringify({ token }) });
    if (!res.ok) {
      const j = await res.json();
      setError(j?.error || "Login failed");
      return;
    }
    const next = sp.get("next") || "/admin";
    router.push(next);
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Access token" className="w-full rounded-md border p-2 text-sm" />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="rounded-md bg-black px-3 py-2 text-sm text-white">Sign in</button>
      </form>
    </div>
  );
}

function getCsrf() {
  const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-600">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}


