import WalkthroughWizard from "@/components/WalkthroughWizard";

export default function WalkthroughPage() {
  return (
    <div className="space-y-6 p-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Free NFPA 70B Walkthrough (60–90 min)</h1>
        <p className="text-neutral-600">We verify access/PPE, note roof & electrical room constraints, and—if permitted—capture photos to prep your PM plan. Same‑day response guaranteed.</p>
      </header>
      <WalkthroughWizard />
    </div>
  );
}




