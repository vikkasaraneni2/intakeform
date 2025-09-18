"use client";
import { useEffect, useState } from "react";

type Props = { intakeId: string };

export default function ProposalEditor({ intakeId }: Props) {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ panels100A: 0, panels200A: 0, transformers45_75: 0, switchgear2000A: 0, reportOverheadPct: 0.3, mobilizationHours: 2, blendedRatePerHour: 190.6 });
  const [preview, setPreview] = useState<{ hours?: number; price?: number; crew?: string }>({});

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/proposals/${intakeId}`);
        const j = await r.json();
        if (j.estimate) {
          setForm((f) => ({ ...f,
            panels100A: j.estimate.panels100A ?? f.panels100A,
            panels200A: j.estimate.panels200A ?? f.panels200A,
            transformers45_75: j.estimate.transformers45_75 ?? f.transformers45_75,
            switchgear2000A: j.estimate.switchgear2000A ?? f.switchgear2000A,
            reportOverheadPct: j.estimate.reportOverheadPct ?? f.reportOverheadPct,
            mobilizationHours: j.estimate.mobilizationHours ?? f.mobilizationHours,
            blendedRatePerHour: j.estimate.blendedRatePerHour ?? f.blendedRatePerHour,
          }));
          if (typeof j.estimate.computedHours === 'number' && typeof j.estimate.computedPrice === 'number') {
            setPreview({ hours: j.estimate.computedHours, price: j.estimate.computedPrice });
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [intakeId]);

  async function saveDraft() {
    setMsg(null);
    const csrf = getCsrf();
    const r = await fetch(`/api/admin/proposals/${intakeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf || "" },
      body: JSON.stringify(form),
    });
    const j = await r.json();
    if (!r.ok) { setMsg(j?.error || "Save failed"); return; }
    setPreview({ hours: j.estimate.totalHours, price: j.estimate.price, crew: j.estimate.crewSuggestion });
    setMsg(`Saved draft (Proposal ${j.proposal.proposalNo} v${j.proposal.version})`);
  }

  async function generatePdf() {
    setMsg(null);
    const r = await fetch(`/api/admin/proposals/${intakeId}/pdf`);
    if (!r.ok) { setMsg("PDF error"); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `proposal-${intakeId}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="text-sm text-neutral-600">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {renderNum("100A Panels", "panels100A")}
        {renderNum("200A Panels", "panels200A")}
        {renderNum("Transformers 45–75 kVA", "transformers45_75")}
        {renderNum("Switchgear 2000A 3Ø (qty)", "switchgear2000A")}
        {renderNum("Report overhead %", "reportOverheadPct", 0.01)}
        {renderNum("Mobilization hours", "mobilizationHours", 1)}
        {renderNum("Blended rate $/hr", "blendedRatePerHour", 1)}
      </div>
      <div className="text-sm text-neutral-700">Preview: {preview.hours ? `${preview.hours} h` : "—"} • {preview.price ? `$${preview.price.toFixed(2)}` : "—"} {preview.crew ? `• ${preview.crew}` : ""}</div>
      {msg && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
      <div className="flex gap-2">
        <button className="rounded-md bg-black px-3 py-2 text-sm text-white" onClick={saveDraft}>Save Draft</button>
        <button className="rounded-md border px-3 py-2 text-sm" onClick={generatePdf}>Generate PDF</button>
      </div>
    </div>
  );

  function renderNum(label: string, key: keyof typeof form, step = 1) {
    return (
      <label className="text-sm">
        <div className="text-neutral-600">{label}</div>
        <input type="number" step={step} value={Number(form[key])} onChange={(e)=> setForm({ ...form, [key]: Number(e.target.value || 0) })} className="mt-1 w-full rounded-md border p-2" />
      </label>
    );
  }
}

function getCsrf() {
  const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}


