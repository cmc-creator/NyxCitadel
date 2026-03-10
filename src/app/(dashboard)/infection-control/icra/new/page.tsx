'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const ICRA_STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'SUPERSEDED'];

export default function NewIcraPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      assessmentYear: Number((form.elements.namedItem('assessmentYear') as HTMLInputElement).value),
      conductedDate:  (form.elements.namedItem('conductedDate') as HTMLInputElement).value,
      conductedBy:    (form.elements.namedItem('conductedBy') as HTMLInputElement).value,
      reviewedBy:     (form.elements.namedItem('reviewedBy') as HTMLInputElement).value || null,
      status:         (form.elements.namedItem('status') as HTMLSelectElement).value,
      notes:          (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
      riskAreas:      [],
      goals:          [],
    };

    const res = await fetch('/api/infection-control/icra', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/infection-control/icra'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save ICRA.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/infection-control/icra" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to ICRA
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          New IC Risk Assessment
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Create the annual infection control risk assessment. Risk areas and goals are added after creation.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Assessment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assessment Year *</label>
              <input name="assessmentYear" type="number" required defaultValue={currentYear} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status *</label>
              <select name="status" required defaultValue="DRAFT" className="form-input w-full">
                {ICRA_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Conducted Date *</label>
            <input name="conductedDate" type="date" required className="form-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Conducted By *</label>
              <input name="conductedBy" type="text" required className="form-input w-full" placeholder="IC Officer / Team" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reviewed By</label>
              <input name="reviewedBy" type="text" className="form-input w-full" placeholder="Department director, etc." />
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea name="notes" rows={3} className="form-input w-full" placeholder="Scope, methodology, or context…" />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/infection-control/icra" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Create ICRA'}
          </button>
        </div>
      </form>
    </div>
  );
}
