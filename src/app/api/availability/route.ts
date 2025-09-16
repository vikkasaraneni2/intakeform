import { NextResponse } from "next/server";
import { listOpenSlots } from "@/lib/availability";

export async function GET() {
  const now = new Date();
  const in21 = new Date(now.getTime() + 21 * 86400000);
  const slots = await listOpenSlots(now, in21);
  return NextResponse.json({ slots });
}



