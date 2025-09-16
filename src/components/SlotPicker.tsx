"use client";
import { useEffect, useState } from "react";

type Slot = { id: string; startTime: string; endTime: string };

export default function SlotPicker({ onBook }: { onBook: (slotId: string) => Promise<void> }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/availability");
        const j = await res.json();
        setSlots(j.slots || []);
      } catch (e) {
        const err = e as { message?: string };
        setError(err?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-neutral-600">Loading...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!slots.length) return <div className="text-sm text-neutral-600">No availability. Please check back soon.</div>;

  return (
    <div className="space-y-3">
      {slots.map((s) => (
        <div key={s.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm">{new Date(s.startTime).toLocaleString()} – {new Date(s.endTime).toLocaleString()}</div>
          <button className="rounded-md bg-black px-3 py-2 text-sm text-white" onClick={() => onBook(s.id)}>Book</button>
        </div>
      ))}
    </div>
  );
}


