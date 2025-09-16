import { prisma } from "@/lib/prisma";

export async function listDbSlots(from: Date, to: Date) {
  const slots = await prisma.availabilitySlot.findMany({
    where: { isActive: true, startTime: { gte: from, lte: to } },
    orderBy: { startTime: "asc" },
  });
  return slots.filter((s) => s.bookedCount < s.capacity);
}



