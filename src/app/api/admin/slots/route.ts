import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const slots = await prisma.availabilitySlot.findMany({ orderBy: { startTime: "asc" } });
  return NextResponse.json({ slots });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const startTime = new Date(body.startTime);
  const endTime = new Date(body.endTime);
  const capacity = Number(body.capacity || 1);
  if (!startTime || !endTime || !(startTime instanceof Date) || !(endTime instanceof Date)) {
    return NextResponse.json({ error: "Invalid start/end" }, { status: 400 });
  }
  const slot = await prisma.availabilitySlot.create({ data: { startTime, endTime, capacity } });
  return NextResponse.json({ slot });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = body.id as string;
  const isActive = Boolean(body.isActive);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const slot = await prisma.availabilitySlot.update({ where: { id }, data: { isActive } });
  return NextResponse.json({ slot });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.availabilitySlot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}



