import { listDbSlots } from "./db";
import { listServiceFusionSlots } from "./servicefusion";

export async function listOpenSlots(from: Date, to: Date) {
  const provider = (process.env.AVAILABILITY_PROVIDER || "db").toLowerCase();
  if (provider === "servicefusion") return listServiceFusionSlots(from, to);
  return listDbSlots(from, to);
}



