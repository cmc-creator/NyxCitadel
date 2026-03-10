'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Droplets } from 'lucide-react';

const STAFF_TYPES = ['RN', 'LPN', 'CNA', 'MD', 'PA', 'NP', 'RT', 'PT', 'OT', 'ST', 'Phlebotomy', 'Other'];

export default function NewHandHygieneAuditPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [opportunities, setOpportunities] = useState(0);
  const [compliant, setCompliant] = useState(0);

  const complianceRate = opportunities > 0 ? Math.round((compliant / opportunities) * 10000) / 100 : 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      auditDate:      (form.elements.namedItem('auditDate') as HTMLInputElement).value,
      unit:           (form.elements.namedItem('unit') as HTMLInputElement).value,
      auditor:        (form.elements.namedItem('auditor') as HTMLInputElement).value,
      opportunities,
      compliant,
      complianceRate,
      staffType:      (form.elements.namedItem('staffType') as HTMLSelectElement).value || null,
      notes:          (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/infection-control/hand-hygiene', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/infection-control/hand-hygiene'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save audit.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/infection-control/hand-hygiene" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Hand Hygiene
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-red-600" />
          New Hand Hygiene Audit
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Compliance rate is calculated automatically from opportunities and compliant moments.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Audit Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Audit Date *</label>
              <input name="auditDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Staff Type</label>
              <select name="staffType" className="form-input w-full">
                <option value="">All / Mixed</option>
                {STAFF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit / Area *</label>
              <input name="unit" type="text" required className="form-input w-full" placeholder="e.g. Med-Surg 2N" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Auditor *</label>
              <input name="auditor" type="text" required className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Observations</h2>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Opportunities *</label>
              <input
                name="opportunities" type="number" min="0" required defaultValue="0"
                className="form-input w-full"
                onChange={e => setOpportunities(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Compliant Moments *</label>
              <input
                name="compliant" type="number" min="0" required defaultValue="0"
                className="form-input w-full"
                onChange={e => setCompliant(Number(e.target.value))}
              />
            </div>
            <div className="pb-0.5">
              <p className="text-xs font-medium text-slate-600 mb-1">Compliance Rate</p>
              <p className={`text-xl font-bold ${complianceRate >= 90 ? 'text-green-600' : complianceRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                {complianceRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea name="notes" rows={2} className="form-input w-full" />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/infection-control/hand-hygiene" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Audit'}
          </button>
        </div>
      </form>
    </div>
  );
}
