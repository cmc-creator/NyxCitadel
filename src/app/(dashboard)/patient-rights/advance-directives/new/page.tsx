'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ScrollText } from 'lucide-react';

const AD_TYPES = ['Living Will', 'DPAHC', 'POLST', 'Healthcare Proxy', 'DNR Order', 'None'];

export default function NewAdvanceDirectivePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      patientInitials:     (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      patientMrn:          (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      admitDate:           (form.elements.namedItem('admitDate') as HTMLInputElement).value,
      adExists:            (form.elements.namedItem('adExists') as HTMLInputElement).checked,
      adType:              (form.elements.namedItem('adType') as HTMLSelectElement).value || null,
      adOnFile:            (form.elements.namedItem('adOnFile') as HTMLInputElement).checked,
      informationProvided: (form.elements.namedItem('informationProvided') as HTMLInputElement).checked,
      providedBy:          (form.elements.namedItem('providedBy') as HTMLInputElement).value || null,
      patientDeclined:     (form.elements.namedItem('patientDeclined') as HTMLInputElement).checked,
      documentedBy:        (form.elements.namedItem('documentedBy') as HTMLInputElement).value,
      documentedDate:      (form.elements.namedItem('documentedDate') as HTMLInputElement).value,
      notes:               (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/patient-rights/advance-directives', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/patient-rights/advance-directives'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save advance directive record.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/patient-rights/advance-directives" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Advance Directives
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-teal-600" />
          Document Advance Directive Status
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">CMS §482.13(b)(3) — advance directive status must be documented at admission.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Patient</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient Initials *</label>
              <input name="patientInitials" required className="form-input w-full" placeholder="J.S." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">MRN</label>
              <input name="patientMrn" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Admit Date *</label>
            <input name="admitDate" type="date" required className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Advance Directive Status</h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="adExists" type="checkbox" className="rounded" />
              Patient has an advance directive
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="adOnFile" type="checkbox" className="rounded" />
              Copy on file / in chart
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="informationProvided" type="checkbox" defaultChecked className="rounded" />
              Patient provided information about advance directives
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="patientDeclined" type="checkbox" className="rounded" />
              Patient declined to complete / discuss
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">AD Type</label>
              <select name="adType" className="form-input w-full">
                <option value="">Select…</option>
                {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Information Provided By</label>
              <input name="providedBy" className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Documentation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Documented By *</label>
              <input name="documentedBy" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Documented Date *</label>
              <input name="documentedDate" type="date" required className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/patient-rights/advance-directives" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
