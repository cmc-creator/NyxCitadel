'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';

export default function EditPdmpCheckPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [significantFinding, setSignificantFinding] = useState(false);

  useEffect(() => {
    fetch(`/api/pharmacy/pdmp/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setSignificantFinding(d.significantFinding ?? false);
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
      checkDate:        (form.elements.namedItem('checkDate') as HTMLInputElement).value,
      patientInitials:  (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      patientDob:       (form.elements.namedItem('patientDob') as HTMLInputElement).value || null,
      prescriberId:     (form.elements.namedItem('prescriberId') as HTMLInputElement).value,
      prescriptionType: (form.elements.namedItem('prescriptionType') as HTMLInputElement).value,
      significantFinding,
      findingNotes:     significantFinding ? ((form.elements.namedItem('findingNotes') as HTMLTextAreaElement).value || null) : null,
      actionTaken:      (form.elements.namedItem('actionTaken') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/pharmacy/pdmp/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/pharmacy/pdmp/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/pharmacy/pdmp/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-6 h-6 text-violet-600" />
          Edit PDMP Check
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Check Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Check Date *</label>
              <input name="checkDate" type="date" required className="form-input w-full"
                defaultValue={data.checkDate ? data.checkDate.split('T')[0] : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient Initials *</label>
              <input name="patientInitials" type="text" required maxLength={6} className="form-input w-full"
                defaultValue={data.patientInitials ?? ''} placeholder="e.g. J.D." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient DOB</label>
              <input name="patientDob" type="date" className="form-input w-full"
                defaultValue={data.patientDob ? data.patientDob.split('T')[0] : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prescriber ID / Name *</label>
              <input name="prescriberId" type="text" required className="form-input w-full"
                defaultValue={data.prescriberId ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Prescription Type *</label>
            <input name="prescriptionType" type="text" required className="form-input w-full"
              defaultValue={data.prescriptionType ?? ''} placeholder="e.g. Oxycodone 5mg #30" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Findings</h2>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="significantFinding" type="checkbox" className="rounded"
              checked={significantFinding} onChange={e => setSignificantFinding(e.target.checked)} />
            Significant Finding Identified
          </label>
          {significantFinding && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Finding Notes *</label>
              <textarea name="findingNotes" rows={2} className="form-input w-full"
                defaultValue={data.findingNotes ?? ''}
                placeholder="Describe the concern (early fills, multiple prescribers, etc.)" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action Taken</label>
            <textarea name="actionTaken" rows={2} className="form-input w-full"
              defaultValue={data.actionTaken ?? ''}
              placeholder="Prescriber notified, prescription modified, referral placed, etc." />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/pharmacy/pdmp/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
