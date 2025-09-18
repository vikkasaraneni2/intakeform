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
  // Get a typed buffer and convert to ArrayBuffer for Response BodyInit
  const out = pdf(doc) as { toBuffer(): Promise<Uint8Array> };
  const buf = await out.toBuffer();
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Response(ab, { headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" } });
}

export const runtime = 'nodejs';


