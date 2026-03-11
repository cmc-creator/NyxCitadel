'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

const RATINGS = ['EXCELLENT', 'ACCEPTABLE', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY'];

export default function EditOppeRecordPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [approvedByMec, setApprovedByMec] = useState(false);

  useEffect(() => {
    fetch(`/api/credentialing/oppe/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setApprovedByMec(d.approvedByMec ?? false);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const payload = {
      providerId:     (form.elements.namedItem('providerId') as HTMLInputElement).value,
      periodStart:    (form.elements.namedItem('periodStart') as HTMLInputElement).value,
      periodEnd:      (form.elements.namedItem('periodEnd') as HTMLInputElement).value,
      reviewCycle:    (form.elements.namedItem('reviewCycle') as HTMLInputElement).value,
      totalCases:     Number((form.elements.namedItem('totalCases') as HTMLInputElement).value) || 0,
      compliantCases: Number((form.elements.namedItem('compliantCases') as HTMLInputElement).value) || 0,
      overallRating:  (form.elements.namedItem('overallRating') as HTMLSelectElement).value,
      reviewedBy:     (form.elements.namedItem('reviewedBy') as HTMLInputElement).value || null,
      approvedByMec,
      notes:          (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/credentialing/oppe/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/credentialing/oppe/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/credentialing/oppe/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-purple-600" />
          Edit OPPE Record
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Ongoing Professional Practice Evaluation — TJC MS.08.01.01.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Provider &amp; Review Period</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Provider ID *</label>
            <input name="providerId" required className="form-input w-full font-mono text-sm"
              defaultValue={data.providerId ?? ''} placeholder="Provider record ID" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Period Start *</label>
              <input name="periodStart" type="date" required className="form-input w-full"
                defaultValue={data.periodStart ? data.periodStart.split('T')[0] : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Period End *</label>
              <input name="periodEnd" type="date" required className="form-input w-full"
                defaultValue={data.periodEnd ? data.periodEnd.split('T')[0] : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Review Cycle Label *</label>
              <input name="reviewCycle" required className="form-input w-full"
                defaultValue={data.reviewCycle ?? ''} placeholder="Q1 2026" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Case Counts &amp; Rating</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Total Cases Reviewed</label>
              <input name="totalCases" type="number" min="0" className="form-input w-full"
                defaultValue={data.totalCases ?? 0} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Compliant Cases</label>
              <input name="compliantCases" type="number" min="0" className="form-input w-full"
                defaultValue={data.compliantCases ?? 0} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Overall Rating *</label>
              <select name="overallRating" required className="form-input w-full" defaultValue={data.overallRating ?? 'ACCEPTABLE'}>
                {RATINGS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reviewed By</label>
              <input name="reviewedBy" className="form-input w-full"
                defaultValue={data.reviewedBy ?? ''} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="approvedByMec" type="checkbox" className="rounded"
              checked={approvedByMec} onChange={e => setApprovedByMec(e.target.checked)} />
            Approved by Medical Executive Committee (MEC)
          </label>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea name="notes" rows={3} className="form-input w-full"
            defaultValue={data.notes ?? ''} />
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <DeleteButton apiPath={`/api/credentialing/oppe/${id}`} redirectPath="/credentialing/oppe" label="OPPE review" />
          <div className="flex gap-3">
            <a href={`/credentialing/oppe/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</a>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
