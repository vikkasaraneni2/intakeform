"use client";
import { useEffect, useState } from "react";
import IntakeForm, { IntakePayload } from "./IntakeForm";
import SlotPicker from "./SlotPicker";

export default function WalkthroughWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "page_view", path: "/walkthrough" }) });
  }, []);

  async function handleIntakeSubmit(values: IntakePayload) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/intakes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Intake failed");
      setIntakeId(json.intakeId);
      setStep(2);
    } catch (e) {
      const err = e as { message?: string };
      setSubmitError(err?.message || "Submission failed");
    }
  }

  async function handleBook(slotId: string) {
    if (!intakeId) return;
    setBookingError(null);
    try {
      const res = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intakeId, slotId }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Booking failed");
      setScheduledAt(json.scheduledAt);
      setStep(3);
    } catch (e) {
      const err = e as { message?: string };
      setBookingError(err?.message || "Booking failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <span className={`rounded-full px-2 py-1 ${step >= 1 ? "bg-black text-white" : "bg-neutral-200"}`}>1 Intake</span>
        <span>→</span>
        <span className={`rounded-full px-2 py-1 ${step >= 2 ? "bg-black text-white" : "bg-neutral-200"}`}>2 Availability</span>
        <span>→</span>
        <span className={`rounded-full px-2 py-1 ${step >= 3 ? "bg-black text-white" : "bg-neutral-200"}`}>3 Confirmation</span>
      </div>

      {step === 1 && <IntakeForm onSubmit={handleIntakeSubmit} serverError={submitError} />}
      {step === 2 && (
        <div className="space-y-3">
          {bookingError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{bookingError}</div>}
          <SlotPicker onBook={handleBook} />
        </div>
      )}
      {step === 3 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">You’re booked</h2>
          <p className="mt-2 text-neutral-700">We emailed calendar invites. Your walkthrough is set for <strong>{new Date(scheduledAt || "").toLocaleString()}</strong>.</p>
          <ul className="mt-4 list-inside list-disc text-neutral-600">
            <li>Please ensure escort/PPE availability at the start time.</li>
            <li>Arrange roof/electrical room access and keys.</li>
            <li>Photos only if permitted.</li>
          </ul>
        </div>
      )}
    </div>
  );
}


