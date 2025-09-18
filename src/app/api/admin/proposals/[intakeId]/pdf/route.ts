import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pdf } from "@react-pdf/renderer";
import ProposalPDF from "@/lib/proposal/pdfDoc";

export async function GET(_req: Request, ctx: { params: Promise<{ intakeId: string }> }) {
  const { intakeId } = await ctx.params;
  const intake = await prisma.intake.findUnique({ where: { id: intakeId } });
  const est = await prisma.equipmentEstimate.findUnique({ where: { intakeId } });
  const prop = await prisma.proposal.findFirst({ where: { intakeId }, orderBy: { version: "desc" } });
  if (!intake || !est || !prop) return NextResponse.json({ error: "Missing data" }, { status: 404 });

  const doc = ProposalPDF({ intake, proposal: prop });
  // Use Blob/ArrayBuffer to satisfy BodyInit typing across runtimes
  const fileBuf: unknown = await (pdf(doc) as any).toBuffer();
  const blob = new Blob([fileBuf as ArrayBufferLike], { type: "application/pdf" });
  return new Response(blob, { headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" } });
}

export const runtime = 'nodejs';


