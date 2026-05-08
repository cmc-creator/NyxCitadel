'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Activity } from 'lucide-react';

const HAI_TYPES = ['CAUTI', 'CLABSI', 'SSI', 'MRSA_BSI', 'CDI', 'VAP', 'HAP', 'SSI_COLON', 'OTHER'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function EditHaiSurveillancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submittedToNhsn, setSubmittedToNhsn] = useState(false);

  useEffect(() => {
    fetch(`/api/infection-control/hai/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setSubmittedToNhsn(d.submittedToNhsn ?? false); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError('');
    const form = e.currentTarget;
    const patientDaysVal = (form.elements.namedItem('patientDays') as HTMLInputElement).value;
    const caseCountVal = Number((form.elements.namedItem('caseCount') as HTMLInputElement).value) || 0;
    const patientDays = patientDaysVal ? Number(patientDaysVal) : null;
    const rate = patientDays && patientDays > 0 ? Number(((caseCountVal / patientDays) * 1000).toFixed(3)) : null;
    const payload = {
      reportMonth:    Number((form.elements.namedItem('reportMonth') as HTMLSelectElement).value),
      reportYear:     Number((form.elements.namedItem('reportYear') as HTMLInputElement).value),
      haiType:        (form.elements.namedItem('haiType') as HTMLSelectElement).value,
      caseCount:      caseCountVal,
      patientDays,
      rate,
      nhsnBenchmark:  (form.elements.namedItem('nhsnBenchmark') as HTMLInputElement).value ? Number((form.elements.namedItem('nhsnBenchmark') as HTMLInputElement).value) : null,
      sir:            (form.elements.namedItem('sir') as HTMLInputElement).value ? Number((form.elements.namedItem('sir') as HTMLInputElement).value) : null,
      submittedToNhsn,
      notes:          (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/infection-control/hai/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/infection-control/hai/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/infection-control/hai/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-red-600" />
          Edit HAI Surveillance Report
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Reporting Period &amp; Type</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Month *</label>
              <select name="reportMonth" required defaultValue={data.reportMonth} className="form-input w-full">
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Year *</label>
              <input name="reportYear" type="number" required defaultValue={data.reportYear} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">HAI Type *</label>
              <select name="haiType" required defaultValue={data.haiType} className="form-input w-full">
                <option value="">Select…</option>
                {HAI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Counts &amp; Rate</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Case Count *</label>
              <input name="caseCount" type="number" min="0" required defaultValue={data.caseCount ?? 0} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Patient-Days</label>
              <input name="patientDays" type="number" min="0" defaultValue={data.patientDays ?? ''} className="form-input w-full" placeholder="Used to calculate rate" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">NHSN Benchmark</label>
              <input name="nhsnBenchmark" type="number" step="0.001" defaultValue={data.nhsnBenchmark ?? ''} className="form-input w-full" placeholder="SIR pooled mean" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">SIR (Standardized Infection Ratio)</label>
              <input name="sir" type="number" step="0.001" defaultValue={data.sir ?? ''} className="form-input w-full" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="submittedToNhsn" type="checkbox" className="rounded" checked={submittedToNhsn} onChange={e => setSubmittedToNhsn(e.target.checked)} />
            Submitted to NHSN
          </label>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
          <textarea name="notes" rows={2} defaultValue={data.notes ?? ''} className="form-input w-full" />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/infection-control/hai/${id}`} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
