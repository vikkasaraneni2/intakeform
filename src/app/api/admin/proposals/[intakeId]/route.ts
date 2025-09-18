import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { estimateFromCounts } from "@/lib/proposal/estimate";

export async function POST(req: NextRequest, { params }: { params: { intakeId: string } }) {
  const { intakeId } = params;
  const body = await req.json();
  const {
    panels100A = 0,
    panels200A = 0,
    transformers45_75 = 0,
    switchgear2000A = 0,
    reportOverheadPct,
    mobilizationHours,
    blendedRatePerHour,
  } = body || {};

  // CSRF is enforced in middleware; here we calculate and persist draft
  const est = await estimateFromCounts({ panels100A, panels200A, transformers45_75, switchgear2000A, reportOverheadPct, mobilizationHours, blendedRatePerHour });

  // Upsert equipment estimate row
  await prisma.equipmentEstimate.upsert({
    where: { intakeId },
    create: {
      intakeId,
      panels100A,
      panels200A,
      transformers45_75,
      switchgear2000A,
      reportOverheadPct: reportOverheadPct ?? undefined,
      mobilizationHours: mobilizationHours ?? undefined,
      blendedRatePerHour: blendedRatePerHour ?? undefined,
      computedHours: est.totalHours,
      computedPrice: est.price,
    },
    update: {
      panels100A,
      panels200A,
      transformers45_75,
      switchgear2000A,
      reportOverheadPct: reportOverheadPct ?? undefined,
      mobilizationHours: mobilizationHours ?? undefined,
      blendedRatePerHour: blendedRatePerHour ?? undefined,
      computedHours: est.totalHours,
      computedPrice: est.price,
    },
  });

  // Ensure a draft proposal row exists
  const existing = await prisma.proposal.findFirst({ where: { intakeId }, orderBy: { version: "desc" } });
  let proposalNo = existing?.proposalNo || `P-${intakeId.slice(-6).toUpperCase()}`;
  const version = existing ? existing.version : 1;
  const prop = await prisma.proposal.upsert({
    where: existing ? { intakeId_version: { intakeId, version } } : { id: "__create__" },
    create: { intakeId, proposalNo, version, subtotal: est.price, total: est.price },
    update: { subtotal: est.price, total: est.price },
  }).catch(async () => {
    // fallback create if custom compound key upsert path failed
    return prisma.proposal.create({ data: { intakeId, proposalNo, version, subtotal: est.price, total: est.price } });
  });

  return NextResponse.json({ estimate: est, proposal: { id: prop.id, proposalNo: prop.proposalNo, version: prop.version, total: prop.total } });
}

export async function GET(_req: NextRequest, { params }: { params: { intakeId: string } }) {
  const { intakeId } = params;
  const est = await prisma.equipmentEstimate.findUnique({ where: { intakeId } });
  const prop = await prisma.proposal.findFirst({ where: { intakeId }, orderBy: { version: "desc" } });
  return NextResponse.json({ estimate: est, proposal: prop });
}


