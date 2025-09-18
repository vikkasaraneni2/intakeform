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

  const base = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const logoUrl = `${base}/cec-logo.png`;
  const doc = ProposalPDF({ intake, proposal: prop, logoUrl });
  // Render to Buffer and return as ArrayBuffer to satisfy BodyInit in Node
  // Use @react-pdf's pdf().toBuffer() in Node runtime and return as Blob to satisfy BodyInit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buf = await (pdf(doc) as any).toBuffer();
  const blob = new Blob([buf], { type: "application/pdf" });
  return new Response(blob, { headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" } });
}

export const runtime = 'nodejs';


