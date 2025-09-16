"use client";
import { useForm } from "react-hook-form";

export type IntakePayload = {
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  siteAddress: string;
  siteHours?: string;
  roofAccess?: string;
  accessNotes?: string;
  recentOutages?: string;
  brokerContact?: string;
  ppeRequired?: boolean;
  escortRequired?: boolean;
  photoPermission?: boolean;
  notes?: string;
  source?: string;
  leadScore?: string;
};

export default function IntakeForm({ onSubmit, serverError }: { onSubmit: (v: IntakePayload) => Promise<void>; serverError?: string | null }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<IntakePayload>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Company" required {...register("company", { required: true })} />
        <Input label="Contact name" required {...register("contactName", { required: true })} />
        <Input label="Email" required type="email" {...register("email", { required: true })} />
        <Input label="Phone" {...register("phone")} />
        <Input label="Site address" required {...register("siteAddress", { required: true })} className="md:col-span-2" />
        <Input label="Site hours" {...register("siteHours")} />
        <Input label="Roof access" {...register("roofAccess")} />
        <Input label="Access / escort notes" {...register("accessNotes")} className="md:col-span-2" />
        <Input label="Recent outages" {...register("recentOutages")} className="md:col-span-2" />
        <Input label="Broker / PM" {...register("brokerContact")} />
        <Checkbox label="PPE required" {...register("ppeRequired")} />
        <Checkbox label="Escort required" {...register("escortRequired")} />
        <Checkbox label="Photo permission" {...register("photoPermission")} />
        <Input label="Notes" {...register("notes")} className="md:col-span-2" />
      </div>
      {serverError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{serverError}</div>}
      <button disabled={isSubmitting} className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50">Continue</button>
    </form>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };
function Input({ label, className, ...props }: InputProps) {
  return (
    <label className={`text-sm ${className || ""}`}>
      <div className="text-neutral-600">{label}</div>
      <input className="mt-1 w-full rounded-md border p-2" {...props} />
    </label>
  );
}

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };
function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" {...props} />
      <span className="text-neutral-600">{label}</span>
    </label>
  );
}


