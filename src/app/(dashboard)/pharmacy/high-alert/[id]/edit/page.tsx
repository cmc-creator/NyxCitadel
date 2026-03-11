'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

export default function EditHighAlertAuditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [storageCorrect, setStorageCorrect] = useState(true);
  const [labelingCorrect, setLabelingCorrect] = useState(true);
  const [doubleCheckDone, setDoubleCheckDone] = useState(true);
  const [actionRequired, setActionRequired] = useState(false);

  useEffect(() => {
    fetch(`/api/pharmacy/high-alert/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setStorageCorrect(d.storageCorrect ?? true);
        setLabelingCorrect(d.labelingCorrect ?? true);
        setDoubleCheckDone(d.doubleCheckDone ?? true);
        setActionRequired(d.actionRequired ?? false);
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
      auditDate:       (form.elements.namedItem('auditDate') as HTMLInputElement).value,
      medication:      (form.elements.namedItem('medication') as HTMLInputElement).value,
      unit:            (form.elements.namedItem('unit') as HTMLInputElement).value,
      auditor:         (form.elements.namedItem('auditor') as HTMLInputElement).value,
      storageCorrect,
      labelingCorrect,
      doubleCheckDone,
      auditFindings:   (form.elements.namedItem('auditFindings') as HTMLTextAreaElement).value || null,
      actionRequired,
      actionTaken:     (form.elements.namedItem('actionTaken') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/pharmacy/high-alert/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/pharmacy/high-alert/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/pharmacy/high-alert/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-violet-600" />
          Edit High-Alert Med Audit
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Audit Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Audit Date *</label>
              <input name="auditDate" type="date" required className="form-input w-full"
                defaultValue={data.auditDate ? data.auditDate.split('T')[0] : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Auditor *</label>
              <input name="auditor" type="text" required className="form-input w-full"
                defaultValue={data.auditor ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Medication *</label>
              <input name="medication" type="text" required className="form-input w-full"
                defaultValue={data.medication ?? ''} placeholder="e.g. Heparin, Insulin" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit / Location *</label>
              <input name="unit" type="text" required className="form-input w-full"
                defaultValue={data.unit ?? ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Checklist</h2>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="storageCorrect" type="checkbox" className="rounded"
              checked={storageCorrect} onChange={e => setStorageCorrect(e.target.checked)} />
            Storage is correct (segregated, properly labeled area)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="labelingCorrect" type="checkbox" className="rounded"
              checked={labelingCorrect} onChange={e => setLabelingCorrect(e.target.checked)} />
            Labeling is correct (auxiliary labels present)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="doubleCheckDone" type="checkbox" className="rounded"
              checked={doubleCheckDone} onChange={e => setDoubleCheckDone(e.target.checked)} />
            Independent double-check process in place
          </label>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Audit Findings</label>
            <textarea name="auditFindings" rows={2} className="form-input w-full"
              defaultValue={data.auditFindings ?? ''} placeholder="Observations, gaps, concerns…" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="actionRequired" type="checkbox" className="rounded"
              checked={actionRequired} onChange={e => setActionRequired(e.target.checked)} />
            Action Required
          </label>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action Taken</label>
            <textarea name="actionTaken" rows={2} className="form-input w-full"
              defaultValue={data.actionTaken ?? ''} />
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <DeleteButton apiPath={`/api/pharmacy/high-alert/${id}`} redirectPath="/pharmacy/high-alert" label="high-alert med record" />
          <div className="flex gap-3">
            <a href={`/pharmacy/high-alert/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</a>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
