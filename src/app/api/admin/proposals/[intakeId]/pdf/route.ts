import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pdf } from "@react-pdf/renderer";
import ProposalPDF from "@/lib/proposal/pdfDoc";
import { put } from "@vercel/blob";

export async function GET(_req: Request, ctx: { params: Promise<{ intakeId: string }> }) {
  const { intakeId } = await ctx.params;
  const intake = await prisma.intake.findUnique({ where: { id: intakeId } });
  const est = await prisma.equipmentEstimate.findUnique({ where: { intakeId } });
  const prop = await prisma.proposal.findFirst({ where: { intakeId }, orderBy: { version: "desc" } });
  if (!intake || !est || !prop) return NextResponse.json({ error: "Missing data" }, { status: 404 });

  const doc = ProposalPDF({ intake, proposal: prop });
  const file = await pdf(doc).toBuffer();

  // Optional: store and persist URL
  const key = `proposals/${prop.proposalNo}-v${prop.version}.pdf`;
  const stored = await put(key, file, { access: "public", contentType: "application/pdf" }).catch(() => null);
  if (stored?.url) {
    await prisma.proposal.update({ where: { id: prop.id }, data: { pdfUrl: stored.url } }).catch(() => {});
  }

  return new NextResponse(file, { headers: { "Content-Type": "application/pdf" } });
}


