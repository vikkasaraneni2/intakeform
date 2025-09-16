import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await prisma.intake.findMany({ orderBy: { createdAt: "desc" } });
  const header = [
    "id","createdAt","status","company","contactName","email","phone","siteAddress","siteHours","roofAccess","accessNotes","recentOutages","brokerContact","ppeRequired","escortRequired","photoPermission","notes","source","leadScore","scheduledAt"
  ];
  const csv = [header.join(",")].concat(
    rows.map((i) => header.map((h) => formatCsvValue((i as Record<string, unknown>)[h])).join(","))
  ).join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=intakes.csv" } });
}

function formatCsvValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  const s = String(v);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}


