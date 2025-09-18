import SlotsManager from "@/components/SlotsManager";
import { requireAdmin } from "@/lib/adminGuard";

export default async function SlotsPage() {
  await requireAdmin();
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Availability Slots</h1>
      <SlotsManager />
    </div>
  );
}




