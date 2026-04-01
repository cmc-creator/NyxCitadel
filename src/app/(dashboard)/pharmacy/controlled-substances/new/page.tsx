'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pill } from 'lucide-react';

const SCHEDULES = ['SCHEDULE_II', 'SCHEDULE_III', 'SCHEDULE_IV', 'SCHEDULE_V'];
const SHIFTS = ['Day', 'Evening', 'Night'];

export default function NewControlledSubstancePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expected, setExpected] = useState(0);
  const [counted, setCounted] = useState(0);
  const [discrepancyFound, setDiscrepancyFound] = useState(false);

  const countDifference = expected - counted;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      logDate:               (form.elements.namedItem('logDate') as HTMLInputElement).value,
      unit:                  (form.elements.namedItem('unit') as HTMLInputElement).value,
      shift:                 (form.elements.namedItem('shift') as HTMLSelectElement).value,
      medicationName:        (form.elements.namedItem('medicationName') as HTMLInputElement).value,
      schedule:              (form.elements.namedItem('schedule') as HTMLSelectElement).value,
      discrepancyFound,
      amountExpected:        expected,
      amountCounted:         counted,
      countDifference,
      witnessName:           (form.elements.namedItem('witnessName') as HTMLInputElement).value,
      countedBy:             (form.elements.namedItem('countedBy') as HTMLInputElement).value,
      discrepancyExplanation:(form.elements.namedItem('discrepancyExplanation') as HTMLTextAreaElement).value || null,
      reportedToPharmacy:    (form.elements.namedItem('reportedToPharmacy') as HTMLInputElement).checked,
      reportedDate:          (form.elements.namedItem('reportedDate') as HTMLInputElement).value || null,
    };

    const res = await fetch('/api/pharmacy/controlled-substances', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/pharmacy/controlled-substances'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save log.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/pharmacy/controlled-substances" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Controlled Substances
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Pill className="w-6 h-6 text-violet-600" />
          New CS Count Log
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Count difference is calculated automatically.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Count Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Log Date *</label>
              <input name="logDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit *</label>
              <input name="unit" type="text" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Shift *</label>
              <select name="shift" required className="form-input w-full">
                {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Medication Name *</label>
              <input name="medicationName" type="text" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Schedule *</label>
              <select name="schedule" required className="form-input w-full">
                {SCHEDULES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Count Amounts</h2>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount Expected *</label>
              <input name="amountExpected" type="number" step="0.01" required defaultValue="0"
                className="form-input w-full"
                onChange={e => setExpected(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount Counted *</label>
              <input name="amountCounted" type="number" step="0.01" required defaultValue="0"
                className="form-input w-full"
                onChange={e => setCounted(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="pb-0.5">
              <p className="text-xs font-medium text-slate-600 mb-1">Difference</p>
              <p className={`text-xl font-bold ${countDifference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {countDifference > 0 ? '+' : ''}{countDifference.toFixed(2)}
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="discrepancyFound" type="checkbox" className="rounded"
              checked={discrepancyFound} onChange={e => setDiscrepancyFound(e.target.checked)} />
            Discrepancy Found
          </label>
          {discrepancyFound && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Discrepancy Explanation</label>
              <textarea name="discrepancyExplanation" rows={2} className="form-input w-full" />
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Signatures</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Counted By *</label>
              <input name="countedBy" type="text" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Witness *</label>
              <input name="witnessName" type="text" required className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mt-2">
              <input name="reportedToPharmacy" type="checkbox" className="rounded" />
              Reported to Pharmacy
            </label>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reported Date</label>
              <input name="reportedDate" type="date" className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/pharmacy/controlled-substances" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Log'}
          </button>
        </div>
      </form>
    </div>
  );
}
