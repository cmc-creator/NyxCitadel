'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Biohazard } from 'lucide-react';

export default function NewIcOutbreakPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const containmentActions = (form.elements.namedItem('containmentActions') as HTMLTextAreaElement).value
      .split('\n').map(s => s.trim()).filter(Boolean);
    const data = {
      outbreakNumber:    (form.elements.namedItem('outbreakNumber') as HTMLInputElement).value,
      organism:          (form.elements.namedItem('organism') as HTMLInputElement).value,
      unitAffected:      (form.elements.namedItem('unitAffected') as HTMLInputElement).value,
      caseCount:         Number((form.elements.namedItem('caseCount') as HTMLInputElement).value) || 0,
      startDate:         (form.elements.namedItem('startDate') as HTMLInputElement).value,
      endDate:           (form.elements.namedItem('endDate') as HTMLInputElement).value || null,
      reportedToHealth:  (form.elements.namedItem('reportedToHealth') as HTMLInputElement).checked,
      reportDate:        (form.elements.namedItem('reportDate') as HTMLInputElement).value || null,
      containmentActions,
      summary:           (form.elements.namedItem('summary') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/infection-control/outbreaks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/infection-control/outbreaks'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save outbreak.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/infection-control/outbreaks" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Outbreaks
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Biohazard className="w-6 h-6 text-orange-600" />
          Report Infection Outbreak
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Report to ADHS within 24 hours for reportable conditions (ARS §36-621).</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Outbreak Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Outbreak Number *</label>
              <input name="outbreakNumber" required className="form-input w-full" placeholder="OB-2026-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Organism / Pathogen *</label>
              <input name="organism" required className="form-input w-full" placeholder="C. diff, Norovirus, Influenza…" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit Affected *</label>
              <input name="unitAffected" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Case Count</label>
              <input name="caseCount" type="number" min="0" defaultValue="0" className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Date *</label>
              <input name="startDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End Date (if resolved)</label>
              <input name="endDate" type="date" className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Reporting &amp; Containment</h2>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="reportedToHealth" type="checkbox" className="rounded" />
            Reported to public health department
          </label>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Report Date</label>
            <input name="reportDate" type="date" className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Containment Actions (one per line)</label>
            <textarea name="containmentActions" rows={4} className="form-input w-full" placeholder="Cohort affected patients&#10;Contact precautions&#10;Visitor restrictions&#10;Deep clean affected unit" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Summary</label>
            <textarea name="summary" rows={3} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/infection-control/outbreaks" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Report Outbreak'}
          </button>
        </div>
      </form>
    </div>
  );
}
