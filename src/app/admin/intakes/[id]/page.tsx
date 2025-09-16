import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function IntakeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const i = await prisma.intake.findUnique({ where: { id } });
  if (!i) return <div>Not found</div>;
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">{i.company}</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Contact" value={`${i.contactName} — ${i.email}${i.phone ? ` — ${i.phone}` : ""}`} />
        <Field label="Status" value={i.status} />
        <Field label="Scheduled" value={i.scheduledAt ? i.scheduledAt.toLocaleString() : "—"} />
        <Field label="Address" value={i.siteAddress} />
        <Field label="Site hours" value={i.siteHours || "—"} />
        <Field label="Roof access" value={i.roofAccess || "—"} />
        <Field label="Photo permission" value={fmtBool(i.photoPermission)} />
        <Field label="PPE required" value={fmtBool(i.ppeRequired)} />
        <Field label="Escort required" value={fmtBool(i.escortRequired)} />
        <Field label="Broker / PM" value={i.brokerContact || "—"} />
        <Field label="Recent outages" value={i.recentOutages || "—"} />
        <Field label="Access / escort notes" value={i.accessNotes || "—"} />
        <Field label="Notes" value={i.notes || "—"} />
        <Field label="Created" value={i.createdAt.toLocaleString()} />
        <Field label="Updated" value={i.updatedAt.toLocaleString()} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

function fmtBool(b: boolean | null) { return b === null ? "—" : b ? "Yes" : "No"; }


