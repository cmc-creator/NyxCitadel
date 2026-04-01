'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, HardHat } from 'lucide-react';

const INJURY_TYPES = [
  'NEEDLESTICK_SHARPS', 'PATIENT_HANDLING_MUSCULOSKELETAL', 'SLIP_TRIP_FALL',
  'STRUCK_BY_OBJECT', 'PATIENT_ASSAULT', 'CHEMICAL_EXPOSURE',
  'WORKPLACE_VIOLENCE', 'REPETITIVE_MOTION', 'OTHER',
];
const OUTCOMES = ['INJURY_ILLNESS', 'DAYS_AWAY', 'JOB_TRANSFER_RESTRICTION', 'MEDICAL_TREATMENT_ONLY', 'FATALITY'];

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function NewOshaLogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      caseNumber:       (form.elements.namedItem('caseNumber') as HTMLInputElement).value,
      caseYear:         Number((form.elements.namedItem('caseYear') as HTMLInputElement).value),
      injuryDate:       (form.elements.namedItem('injuryDate') as HTMLInputElement).value,
      employeeName:     (form.elements.namedItem('employeeName') as HTMLInputElement).value,
      jobTitle:         (form.elements.namedItem('jobTitle') as HTMLInputElement).value,
      department:       (form.elements.namedItem('department') as HTMLInputElement).value,
      injuryType:       (form.elements.namedItem('injuryType') as HTMLSelectElement).value,
      bodyPart:         (form.elements.namedItem('bodyPart') as HTMLInputElement).value,
      description:      (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      daysAway:         Number((form.elements.namedItem('daysAway') as HTMLInputElement).value) || 0,
      daysRestriction:  Number((form.elements.namedItem('daysRestriction') as HTMLInputElement).value) || 0,
      recordable:       (form.elements.namedItem('recordable') as HTMLInputElement).checked,
      privacyCase:      (form.elements.namedItem('privacyCase') as HTMLInputElement).checked,
      outcome:          (form.elements.namedItem('outcome') as HTMLSelectElement).value,
      rootCause:        (form.elements.namedItem('rootCause') as HTMLTextAreaElement).value || null,
      correctiveAction: (form.elements.namedItem('correctiveAction') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/workforce-health/osha', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/workforce-health/osha'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save log.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/workforce-health/osha" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to OSHA 300 Log
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <HardHat className="w-6 h-6 text-orange-600" />
          New OSHA Incident Entry
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Log a recordable workplace injury or illness for OSHA 300 reporting.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Case &amp; Employee</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Case Number *</label>
              <input name="caseNumber" type="text" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Year *</label>
              <input name="caseYear" type="number" required defaultValue={new Date().getFullYear()} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Injury Date *</label>
              <input name="injuryDate" type="date" required className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Employee Name *</label>
              <input name="employeeName" type="text" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Job Title *</label>
              <input name="jobTitle" type="text" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department *</label>
              <input name="department" type="text" required className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Incident Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Injury/Illness Type *</label>
              <select name="injuryType" required className="form-input w-full">
                <option value="">Select…</option>
                {INJURY_TYPES.map(t => <option key={t} value={t}>{formatLabel(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Body Part *</label>
              <input name="bodyPart" type="text" required className="form-input w-full" placeholder="e.g. Lower back, Left hand" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
            <textarea name="description" rows={3} required className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Outcome &amp; Classification</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Outcome *</label>
              <select name="outcome" required className="form-input w-full">
                <option value="">Select…</option>
                {OUTCOMES.map(o => <option key={o} value={o}>{formatLabel(o)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Days Away</label>
              <input name="daysAway" type="number" min="0" defaultValue="0" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Days Restricted</label>
              <input name="daysRestriction" type="number" min="0" defaultValue="0" className="form-input w-full" />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="recordable" type="checkbox" defaultChecked className="rounded" />
              Recordable (OSHA 300)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="privacyCase" type="checkbox" className="rounded" />
              Privacy Case
            </label>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Root Cause</label>
            <textarea name="rootCause" rows={2} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Corrective Action</label>
            <textarea name="correctiveAction" rows={2} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/workforce-health/osha" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Log Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
