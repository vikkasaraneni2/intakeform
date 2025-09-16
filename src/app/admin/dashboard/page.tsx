import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay, subDays } from "date-fns";

async function getMetrics() {
  const now = new Date();
  const d7 = subDays(now, 7);
  const d30 = subDays(now, 30);

  const [visitorsL7, formsL7, bookingsL7, submitBookedPctL30, avgHours] = await Promise.all([
    prisma.activity.groupBy({ by: ["sessionId"], where: { type: "page_view", ts: { gte: d7 } } }).then((r) => r.length),
    prisma.activity.count({ where: { type: "intake_submitted", ts: { gte: d7 } } }),
    prisma.activity.count({ where: { type: "schedule_booked", ts: { gte: d7 } } }),
    (async () => {
      const s = await prisma.activity.count({ where: { type: "intake_submitted", ts: { gte: d30 } } });
      const b = await prisma.activity.count({ where: { type: "schedule_booked", ts: { gte: d30 } } });
      return s ? Math.round((100 * b) / s) : 0;
    })(),
    (async () => {
      const rows = await prisma.intake.findMany({ where: { scheduledAt: { not: null } }, select: { scheduledAt: true, createdAt: true } });
      if (!rows.length) return 0;
      const avg = rows.reduce((acc, r) => acc + (r.scheduledAt!.getTime() - r.createdAt.getTime()) / 3600000, 0) / rows.length;
      return Math.round(avg * 100) / 100;
    })(),
  ]);

  const start = startOfDay(subDays(now, 29));
  const days: { date: string; views: number; forms: number; bookings: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d0 = new Date(start.getTime() + i * 86400000);
    const d1 = endOfDay(d0);
    const [views, forms, bookings] = await Promise.all([
      prisma.activity.count({ where: { type: "page_view", ts: { gte: d0, lte: d1 } } }),
      prisma.activity.count({ where: { type: "intake_submitted", ts: { gte: d0, lte: d1 } } }),
      prisma.activity.count({ where: { type: "schedule_booked", ts: { gte: d0, lte: d1 } } }),
    ]);
    days.push({ date: d0.toISOString().slice(0, 10), views, forms, bookings });
  }

  const agedNew = await prisma.intake.findMany({ where: { status: "NEW", createdAt: { lt: subDays(now, 0) } }, orderBy: { createdAt: "asc" } });
  const upcoming = await prisma.visit.findMany({ where: { scheduledAt: { gte: now } }, include: { intake: true }, orderBy: { scheduledAt: "asc" } });
  const recentActivity = await prisma.activity.findMany({ orderBy: { ts: "desc" }, take: 50 });

  return { visitorsL7, formsL7, bookingsL7, submitBookedPctL30, avgHours, days, agedNew, upcoming, recentActivity };
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getMetrics();
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Tile label="Visitors (L7)" value={data.visitorsL7} />
        <Tile label="Forms (L7)" value={data.formsL7} />
        <Tile label="Bookings (L7)" value={data.bookingsL7} />
        <Tile label="Submit→Booked % (L30)" value={`${data.submitBookedPctL30}%`} />
        <Tile label="Avg hrs submit→booked" value={data.avgHours} />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-medium">30‑day trend</h2>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50"><tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Views</th><th className="p-2 text-left">Forms</th><th className="p-2 text-left">Bookings</th></tr></thead>
          <tbody>
            {data.days.map((d) => (
              <tr key={d.date} className="border-t">
                <td className="p-2">{d.date}</td>
                <td className="p-2">{d.views}</td>
                <td className="p-2">{d.forms}</td>
                <td className="p-2">{d.bookings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Aged NEW > 4h">
          {data.agedNew.length === 0 ? <p className="text-sm text-neutral-500">None</p> : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50"><tr><th className="p-2 text-left">Company</th><th className="p-2 text-left">Contact</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Created</th></tr></thead>
              <tbody>
                {data.agedNew.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.company}</td>
                    <td className="p-2">{r.contactName}</td>
                    <td className="p-2">{r.email}</td>
                    <td className="p-2">{r.createdAt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Upcoming (7 days)">
          {data.upcoming.length === 0 ? <p className="text-sm text-neutral-500">No visits scheduled</p> : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50"><tr><th className="p-2 text-left">When</th><th className="p-2 text-left">Company</th><th className="p-2 text-left">Address</th></tr></thead>
              <tbody>
                {data.upcoming.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="p-2">{v.scheduledAt.toLocaleString()}</td>
                    <td className="p-2">{v.intake.company}</td>
                    <td className="p-2">{v.intake.siteAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-medium">Recent Activity (last 50)</h2>
        {data.recentActivity.length === 0 ? <p className="text-sm text-neutral-500">No activity</p> : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50"><tr><th className="p-2 text-left">When</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Path</th></tr></thead>
            <tbody>
              {data.recentActivity.map((a) => (
                <tr key={a.id} className="border-t"><td className="p-2">{a.ts.toLocaleString()}</td><td className="p-2">{a.type}</td><td className="p-2">{a.path}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm"><div className="text-sm text-neutral-500">{label}</div><div className="text-2xl font-semibold">{value}</div></div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm"><h2 className="mb-3 text-lg font-medium">{title}</h2>{children}</div>
  );
}



