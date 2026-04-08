'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Biohazard } from 'lucide-react';

export default function EditIcOutbreakPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reportedToHealth, setReportedToHealth] = useState(false);

  useEffect(() => {
    fetch(`/api/infection-control/outbreaks/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setReportedToHealth(d.reportedToHealth ?? false); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError('');
    const form = e.currentTarget;
    const containmentActions = (form.elements.namedItem('containmentActions') as HTMLTextAreaElement).value
      .split('\n').map(s => s.trim()).filter(Boolean);
    const payload = {
      outbreakNumber:   (form.elements.namedItem('outbreakNumber') as HTMLInputElement).value,
      organism:         (form.elements.namedItem('organism') as HTMLInputElement).value,
      unitAffected:     (form.elements.namedItem('unitAffected') as HTMLInputElement).value,
      caseCount:        Number((form.elements.namedItem('caseCount') as HTMLInputElement).value) || 0,
      startDate:        (form.elements.namedItem('startDate') as HTMLInputElement).value,
      endDate:          (form.elements.namedItem('endDate') as HTMLInputElement).value || null,
      reportedToHealth,
      reportDate:       (form.elements.namedItem('reportDate') as HTMLInputElement).value || null,
      containmentActions,
      summary:          (form.elements.namedItem('summary') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/infection-control/outbreaks/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/infection-control/outbreaks/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/infection-control/outbreaks/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-500 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Biohazard className="w-6 h-6 text-orange-600" />
          Edit Infection Outbreak
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Outbreak Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Outbreak Number *</label>
              <input name="outbreakNumber" required defaultValue={data.outbreakNumber} className="form-input w-full" placeholder="OB-2026-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Organism / Pathogen *</label>
              <input name="organism" required defaultValue={data.organism} className="form-input w-full" placeholder="C. diff, Norovirus, Influenza…" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit Affected *</label>
              <input name="unitAffected" required defaultValue={data.unitAffected} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Case Count</label>
              <input name="caseCount" type="number" min="0" defaultValue={data.caseCount ?? 0} className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Date *</label>
              <input name="startDate" type="date" required defaultValue={data.startDate ? data.startDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End Date (if resolved)</label>
              <input name="endDate" type="date" defaultValue={data.endDate ? data.endDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Reporting &amp; Containment</h2>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="reportedToHealth" type="checkbox" className="rounded" checked={reportedToHealth} onChange={e => setReportedToHealth(e.target.checked)} />
            Reported to public health department
          </label>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Report Date</label>
            <input name="reportDate" type="date" defaultValue={data.reportDate ? data.reportDate.split('T')[0] : ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Containment Actions (one per line)</label>
            <textarea name="containmentActions" rows={4} defaultValue={Array.isArray(data.containmentActions) ? data.containmentActions.join('\n') : (data.containmentActions ?? '')} className="form-input w-full" placeholder="Cohort affected patients&#10;Contact precautions&#10;Visitor restrictions&#10;Deep clean affected unit" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Summary</label>
            <textarea name="summary" rows={3} defaultValue={data.summary ?? ''} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/infection-control/outbreaks/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-foreground">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
