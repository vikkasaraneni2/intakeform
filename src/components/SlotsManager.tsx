"use client";
import { useEffect, useState } from "react";

type Slot = { id: string; startTime: string; endTime: string; capacity: number; bookedCount: number; isActive: boolean };

export default function SlotsManager() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [capacity, setCapacity] = useState(1);

  async function refresh() {
    const res = await fetch("/api/admin/slots");
    const j = await res.json();
    setSlots(j.slots || []);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function createSlot(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/slots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startTime: start, endTime: end, capacity }) });
    setStart("");
    setEnd("");
    setCapacity(1);
    refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/slots", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !isActive }) });
    refresh();
  }

  async function removeSlot(id: string) {
    await fetch(`/api/admin/slots?id=${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-4">
      <form className="flex flex-wrap items-end gap-2" onSubmit={createSlot}>
        <div className="flex flex-col text-sm">
          <label className="text-neutral-600">Start</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-md border p-2" required />
        </div>
        <div className="flex flex-col text-sm">
          <label className="text-neutral-600">End</label>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-md border p-2" required />
        </div>
        <div className="flex flex-col text-sm">
          <label className="text-neutral-600">Capacity</label>
          <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value || "1", 10))} className="w-24 rounded-md border p-2" />
        </div>
        <button className="rounded-md bg-black px-3 py-2 text-sm text-white">Add Slot</button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-white p-4 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50"><tr><th className="p-2 text-left">Start</th><th className="p-2 text-left">End</th><th className="p-2 text-left">Capacity</th><th className="p-2 text-left">Booked</th><th className="p-2 text-left">Active</th><th className="p-2 text-left">Actions</th></tr></thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{new Date(s.startTime).toLocaleString()}</td>
                <td className="p-2">{new Date(s.endTime).toLocaleString()}</td>
                <td className="p-2">{s.capacity}</td>
                <td className="p-2">{s.bookedCount}</td>
                <td className="p-2">{s.isActive ? "Yes" : "No"}</td>
                <td className="p-2">
                  <button className="mr-2 rounded-md border px-2 py-1" onClick={() => toggleActive(s.id, s.isActive)}>{s.isActive ? "Deactivate" : "Activate"}</button>
                  <button className="rounded-md border px-2 py-1" onClick={() => removeSlot(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



