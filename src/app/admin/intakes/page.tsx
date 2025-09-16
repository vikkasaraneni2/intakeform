import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

function buildWhere(q?: string) {
  if (!q) return {};
  return {
    OR: [
      { company: { contains: q, mode: "insensitive" as const } },
      { contactName: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } },
      { siteAddress: { contains: q, mode: "insensitive" as const } },
    ],
  };
}

export default async function IntakesPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const sp = searchParams ? await searchParams : undefined;
  const q = sp?.q || "";
  const intakes = await prisma.intake.findMany({ where: buildWhere(q), orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Submissions</h1>

      <form className="flex gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="Search company, contact, email, address" className="w-full rounded-md border p-2 text-sm" />
        <button className="rounded-md bg-black px-3 py-2 text-sm text-white">Search</button>
        <Link className="rounded-md border px-3 py-2 text-sm" href="/admin/intakes">Clear</Link>
        <a className="ml-auto rounded-md border px-3 py-2 text-sm" href="/api/admin/export/intakes">Export CSV</a>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-white p-4 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Company</th>
              <th className="p-2 text-left">Contact</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Address</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Scheduled</th>
              <th className="p-2 text-left">View</th>
            </tr>
          </thead>
          <tbody>
            {intakes.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-2">{i.createdAt.toLocaleString()}</td>
                <td className="p-2">{i.company}</td>
                <td className="p-2">{i.contactName}</td>
                <td className="p-2">{i.email}</td>
                <td className="p-2">{i.siteAddress}</td>
                <td className="p-2">{i.status}</td>
                <td className="p-2">{i.scheduledAt ? i.scheduledAt.toLocaleString() : "—"}</td>
                <td className="p-2"><Link className="text-blue-600 underline" href={`/admin/intakes/${i.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


