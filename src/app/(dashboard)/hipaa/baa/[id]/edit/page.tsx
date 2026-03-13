'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileCheck2 } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

export default function EditBaaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [phoneHipaaVerified, setPhoneHipaaVerified] = useState(false);

  useEffect(() => {
    fetch(`/api/hipaa/baa/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setAutoRenew(d.autoRenew ?? false);
        setPhoneHipaaVerified(d.phoneHipaaVerified ?? false);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError('');
    const form = e.currentTarget;
    const payload = {
      vendorName:         (form.elements.namedItem('vendorName') as HTMLInputElement).value,
      vendorContact:      (form.elements.namedItem('vendorContact') as HTMLInputElement).value || null,
      vendorEmail:        (form.elements.namedItem('vendorEmail') as HTMLInputElement).value || null,
      serviceDescription: (form.elements.namedItem('serviceDescription') as HTMLTextAreaElement).value,
      agreementDate:      (form.elements.namedItem('agreementDate') as HTMLInputElement).value,
      expiryDate:         (form.elements.namedItem('expiryDate') as HTMLInputElement).value || null,
      autoRenew,
      documentUrl:        (form.elements.namedItem('documentUrl') as HTMLInputElement).value || null,
      phoneHipaaVerified,
      notes:              (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/hipaa/baa/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/hipaa/baa/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/hipaa/baa/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-blue-500" />
          Edit Business Associate Agreement
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Vendor Information</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Vendor / Associate Name *</label>
            <input name="vendorName" required defaultValue={data.vendorName} className="form-input w-full" placeholder="e.g. Epic Systems, LabCorp, Transcription Co." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contact Name</label>
              <input name="vendorContact" defaultValue={data.vendorContact ?? ''} className="form-input w-full" placeholder="Primary contact" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contact Email</label>
              <input name="vendorEmail" type="email" defaultValue={data.vendorEmail ?? ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Services Providing Access to PHI *</label>
            <textarea name="serviceDescription" required rows={3} defaultValue={data.serviceDescription} className="form-input w-full" placeholder="Describe the services and how PHI is accessed or handled…" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibond text-slate-800">Agreement Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Agreement Date *</label>
              <input name="agreementDate" type="date" required defaultValue={data.agreementDate ? data.agreementDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
              <input name="expiryDate" type="date" defaultValue={data.expiryDate ? data.expiryDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Document URL / File Link</label>
            <input name="documentUrl" type="url" defaultValue={data.documentUrl ?? ''} className="form-input w-full" placeholder="https://…" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="autoRenew" type="checkbox" className="rounded" checked={autoRenew} onChange={e => setAutoRenew(e.target.checked)} />
              Auto-Renews
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="phoneHipaaVerified" type="checkbox" className="rounded" checked={phoneHipaaVerified} onChange={e => setPhoneHipaaVerified(e.target.checked)} />
              HIPAA Training / Verification Confirmed
            </label>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea name="notes" rows={3} defaultValue={data.notes ?? ''} className="form-input w-full" />
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <DeleteButton apiPath={`/api/hipaa/baa/${id}`} redirectPath="/hipaa/baa" label="BAA" />
          <div className="flex gap-3">
            <a href={`/hipaa/baa/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</a>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
