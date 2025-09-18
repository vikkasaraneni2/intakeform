export async function listServiceFusionSlots(from: Date, to: Date) {
  console.warn("ServiceFusion provider is not implemented — falling back to empty list.");
  return [] as { id: string; startTime: Date; endTime: Date; capacity: number; bookedCount: number; isActive: boolean }[];
}




