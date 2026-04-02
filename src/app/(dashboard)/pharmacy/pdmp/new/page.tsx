'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';

export default function NewPdmpCheckPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [significantFinding, setSignificantFinding] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      checkDate:          (form.elements.namedItem('checkDate') as HTMLInputElement).value,
      patientInitials:    (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      patientDob:         (form.elements.namedItem('patientDob') as HTMLInputElement).value || null,
      prescriberId:       (form.elements.namedItem('prescriberId') as HTMLInputElement).value,
      prescriptionType:   (form.elements.namedItem('prescriptionType') as HTMLInputElement).value,
      significantFinding,
      findingNotes:       significantFinding ? ((form.elements.namedItem('findingNotes') as HTMLTextAreaElement).value || null) : null,
      actionTaken:        (form.elements.namedItem('actionTaken') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/pharmacy/pdmp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/pharmacy/pdmp'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save check.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/pharmacy/pdmp" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to PDMP Checks
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Search className="w-6 h-6 text-teal-600" />
          Log PDMP Check
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Document a Prescription Drug Monitoring Program query. Patient identifiers are stored as initials only.</p>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Check Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Check Date *</label>
              <input name="checkDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient Initials *</label>
              <input name="patientInitials" type="text" required maxLength={6} className="form-input w-full" placeholder="e.g. J.D." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient DOB</label>
              <input name="patientDob" type="date" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prescriber ID / Name *</label>
              <input name="prescriberId" type="text" required className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Prescription Type *</label>
            <input name="prescriptionType" type="text" required className="form-input w-full" placeholder="e.g. Oxycodone 5mg #30" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Findings</h2>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="significantFinding" type="checkbox" className="rounded"
              checked={significantFinding} onChange={e => setSignificantFinding(e.target.checked)} />
            Significant Finding Identified
          </label>
          {significantFinding && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Finding Notes *</label>
              <textarea name="findingNotes" rows={2} className="form-input w-full" placeholder="Describe the concern (early fills, multiple prescribers, etc.)" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action Taken</label>
            <textarea name="actionTaken" rows={2} className="form-input w-full" placeholder="Prescriber notified, prescription modified, referral placed, etc." />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/pharmacy/pdmp" className="px-4 py-2 text-sm rounded-lg border border-border text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Check'}
          </button>
        </div>
      </form>
    </div>
  );
}
