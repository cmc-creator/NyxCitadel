'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pill } from 'lucide-react';

const SCHEDULES = ['SCHEDULE_II', 'SCHEDULE_III', 'SCHEDULE_IV', 'SCHEDULE_V'];
const SHIFTS = ['Day', 'Evening', 'Night'];

export default function EditControlledSubstancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expected, setExpected] = useState(0);
  const [counted, setCounted] = useState(0);
  const [discrepancyFound, setDiscrepancyFound] = useState(false);
  const [reportedToPharmacy, setReportedToPharmacy] = useState(false);

  const countDifference = expected - counted;

  useEffect(() => {
    fetch(`/api/pharmacy/controlled-substances/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setExpected(d.amountExpected ?? 0);
        setCounted(d.amountCounted ?? 0);
        setDiscrepancyFound(d.discrepancyFound ?? false);
        setReportedToPharmacy(d.reportedToPharmacy ?? false);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const payload = {
      logDate:                (form.elements.namedItem('logDate') as HTMLInputElement).value,
      unit:                   (form.elements.namedItem('unit') as HTMLInputElement).value,
      shift:                  (form.elements.namedItem('shift') as HTMLSelectElement).value,
      medicationName:         (form.elements.namedItem('medicationName') as HTMLInputElement).value,
      schedule:               (form.elements.namedItem('schedule') as HTMLSelectElement).value,
      discrepancyFound,
      amountExpected:         expected,
      amountCounted:          counted,
      countDifference,
      witnessName:            (form.elements.namedItem('witnessName') as HTMLInputElement).value,
      countedBy:              (form.elements.namedItem('countedBy') as HTMLInputElement).value,
      discrepancyExplanation: (form.elements.namedItem('discrepancyExplanation') as HTMLTextAreaElement).value || null,
      reportedToPharmacy,
      reportedDate:           (form.elements.namedItem('reportedDate') as HTMLInputElement).value || null,
    };
    const res = await fetch(`/api/pharmacy/controlled-substances/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/pharmacy/controlled-substances/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/pharmacy/controlled-substances/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-500 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Pill className="w-6 h-6 text-teal-600" />
          Edit CS Count Log
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Count difference is calculated automatically.</p>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Count Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Log Date *</label>
              <input name="logDate" type="date" required className="form-input w-full"
                defaultValue={data.logDate ? data.logDate.split('T')[0] : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit *</label>
              <input name="unit" type="text" required className="form-input w-full"
                defaultValue={data.unit ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Shift *</label>
              <select name="shift" required className="form-input w-full" defaultValue={data.shift ?? ''}>
                {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Medication Name *</label>
              <input name="medicationName" type="text" required className="form-input w-full"
                defaultValue={data.medicationName ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Schedule *</label>
              <select name="schedule" required className="form-input w-full" defaultValue={data.schedule ?? ''}>
                {SCHEDULES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Count Amounts</h2>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount Expected *</label>
              <input name="amountExpected" type="number" step="0.01" required
                className="form-input w-full"
                defaultValue={data.amountExpected ?? 0}
                onChange={e => setExpected(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount Counted *</label>
              <input name="amountCounted" type="number" step="0.01" required
                className="form-input w-full"
                defaultValue={data.amountCounted ?? 0}
                onChange={e => setCounted(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="pb-0.5">
              <p className="text-xs font-medium text-slate-600 mb-1">Difference</p>
              <p className={`text-xl font-bold ${countDifference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {countDifference > 0 ? '+' : ''}{countDifference.toFixed(2)}
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="discrepancyFound" type="checkbox" className="rounded"
              checked={discrepancyFound} onChange={e => setDiscrepancyFound(e.target.checked)} />
            Discrepancy Found
          </label>
          {discrepancyFound && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Discrepancy Explanation</label>
              <textarea name="discrepancyExplanation" rows={2} className="form-input w-full"
                defaultValue={data.discrepancyExplanation ?? ''} />
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Signatures</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Counted By *</label>
              <input name="countedBy" type="text" required className="form-input w-full"
                defaultValue={data.countedBy ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Witness *</label>
              <input name="witnessName" type="text" required className="form-input w-full"
                defaultValue={data.witnessName ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer mt-2">
              <input name="reportedToPharmacy" type="checkbox" className="rounded"
                checked={reportedToPharmacy} onChange={e => setReportedToPharmacy(e.target.checked)} />
              Reported to Pharmacy
            </label>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reported Date</label>
              <input name="reportedDate" type="date" className="form-input w-full"
                defaultValue={data.reportedDate ? data.reportedDate.split('T')[0] : ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/pharmacy/controlled-substances/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-foreground">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
