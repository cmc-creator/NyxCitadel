'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const ICRA_STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'SUPERSEDED'];

export default function EditIcraPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/infection-control/icra/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError('');
    const form = e.currentTarget;
    const payload = {
      assessmentYear: Number((form.elements.namedItem('assessmentYear') as HTMLInputElement).value),
      conductedDate:  (form.elements.namedItem('conductedDate') as HTMLInputElement).value,
      conductedBy:    (form.elements.namedItem('conductedBy') as HTMLInputElement).value,
      reviewedBy:     (form.elements.namedItem('reviewedBy') as HTMLInputElement).value || null,
      status:         (form.elements.namedItem('status') as HTMLSelectElement).value,
      notes:          (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/infection-control/icra/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/infection-control/icra/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/infection-control/icra/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          Edit IC Risk Assessment
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Assessment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Assessment Year *</label>
              <input name="assessmentYear" type="number" required defaultValue={data.assessmentYear} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status *</label>
              <select name="status" required defaultValue={data.status} className="form-input w-full">
                {ICRA_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Conducted Date *</label>
            <input name="conductedDate" type="date" required defaultValue={data.conductedDate ? data.conductedDate.split('T')[0] : ''} className="form-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Conducted By *</label>
              <input name="conductedBy" type="text" required defaultValue={data.conductedBy} className="form-input w-full" placeholder="IC Officer / Team" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Reviewed By</label>
              <input name="reviewedBy" type="text" defaultValue={data.reviewedBy ?? ''} className="form-input w-full" placeholder="Department director, etc." />
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
          <textarea name="notes" rows={3} defaultValue={data.notes ?? ''} className="form-input w-full" placeholder="Scope, methodology, or context…" />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/infection-control/icra/${id}`} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
