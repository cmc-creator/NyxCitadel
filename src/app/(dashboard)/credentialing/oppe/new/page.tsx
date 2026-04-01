'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BarChart2 } from 'lucide-react';

const RATINGS = ['EXCELLENT', 'ACCEPTABLE', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY'];

export default function NewOppeRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillProviderId = searchParams.get('providerId') ?? '';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      providerId:    (form.elements.namedItem('providerId') as HTMLInputElement).value,
      periodStart:   (form.elements.namedItem('periodStart') as HTMLInputElement).value,
      periodEnd:     (form.elements.namedItem('periodEnd') as HTMLInputElement).value,
      reviewCycle:   (form.elements.namedItem('reviewCycle') as HTMLInputElement).value,
      totalCases:    Number((form.elements.namedItem('totalCases') as HTMLInputElement).value) || 0,
      compliantCases:Number((form.elements.namedItem('compliantCases') as HTMLInputElement).value) || 0,
      overallRating: (form.elements.namedItem('overallRating') as HTMLSelectElement).value,
      reviewedBy:    (form.elements.namedItem('reviewedBy') as HTMLInputElement).value || null,
      approvedByMec: (form.elements.namedItem('approvedByMec') as HTMLInputElement).checked,
      notes:         (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
      metrics:       [],
    };

    const res = await fetch('/api/credentialing/oppe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) {
      const returnTo = prefillProviderId ? `/credentialing/providers/${prefillProviderId}` : '/credentialing/oppe';
      router.push(returnTo);
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save OPPE record.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/credentialing/oppe" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to OPPE
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-teal-600" />
          New OPPE Record
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Ongoing Professional Practice Evaluation - TJC MS.08.01.01. Metrics can be added after creation.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Provider &amp; Review Period</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Provider ID *</label>
            <input name="providerId" required defaultValue={prefillProviderId} className="form-input w-full font-mono text-sm" placeholder="Provider record ID" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Period Start *</label>
              <input name="periodStart" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Period End *</label>
              <input name="periodEnd" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Review Cycle Label *</label>
              <input name="reviewCycle" required className="form-input w-full" placeholder="Q1 2026" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Case Counts &amp; Rating</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Total Cases Reviewed</label>
              <input name="totalCases" type="number" min="0" defaultValue="0" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Compliant Cases</label>
              <input name="compliantCases" type="number" min="0" defaultValue="0" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Overall Rating *</label>
              <select name="overallRating" required defaultValue="ACCEPTABLE" className="form-input w-full">
                {RATINGS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reviewed By</label>
              <input name="reviewedBy" className="form-input w-full" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="approvedByMec" type="checkbox" className="rounded" />
            Approved by Medical Executive Committee (MEC)
          </label>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea name="notes" rows={3} className="form-input w-full" />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/credentialing/oppe" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Create OPPE Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
