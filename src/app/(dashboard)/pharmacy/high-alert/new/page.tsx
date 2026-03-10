'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NewHighAlertAuditPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      auditDate:       (form.elements.namedItem('auditDate') as HTMLInputElement).value,
      medication:      (form.elements.namedItem('medication') as HTMLInputElement).value,
      unit:            (form.elements.namedItem('unit') as HTMLInputElement).value,
      auditor:         (form.elements.namedItem('auditor') as HTMLInputElement).value,
      storageCorrect:  (form.elements.namedItem('storageCorrect') as HTMLInputElement).checked,
      labelingCorrect: (form.elements.namedItem('labelingCorrect') as HTMLInputElement).checked,
      doubleCheckDone: (form.elements.namedItem('doubleCheckDone') as HTMLInputElement).checked,
      auditFindings:   (form.elements.namedItem('auditFindings') as HTMLTextAreaElement).value || null,
      actionRequired:  (form.elements.namedItem('actionRequired') as HTMLInputElement).checked,
      actionTaken:     (form.elements.namedItem('actionTaken') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/pharmacy/high-alert', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/pharmacy/high-alert'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save audit.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/pharmacy/high-alert" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to High-Alert Medications
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-violet-600" />
          New High-Alert Med Audit
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Audit Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Audit Date *</label>
              <input name="auditDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Auditor *</label>
              <input name="auditor" type="text" required className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Medication *</label>
              <input name="medication" type="text" required className="form-input w-full" placeholder="e.g. Heparin, Insulin" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit / Location *</label>
              <input name="unit" type="text" required className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Checklist</h2>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="storageCorrect" type="checkbox" defaultChecked className="rounded" />
            Storage is correct (segregated, properly labeled area)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="labelingCorrect" type="checkbox" defaultChecked className="rounded" />
            Labeling is correct (auxiliary labels present)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="doubleCheckDone" type="checkbox" defaultChecked className="rounded" />
            Independent double-check process in place
          </label>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Audit Findings</label>
            <textarea name="auditFindings" rows={2} className="form-input w-full" placeholder="Observations, gaps, concerns…" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="actionRequired" type="checkbox" className="rounded" />
            Action Required
          </label>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action Taken</label>
            <textarea name="actionTaken" rows={2} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/pharmacy/high-alert" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Audit'}
          </button>
        </div>
      </form>
    </div>
  );
}
