'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';

const HOLD_TYPES = [
  'Title 36 - 72hr Emergency', 'Court Order - 5 Day', 'Court Order - 30 Day',
  'Involuntary Outpatient Treatment', 'Petition for Evaluation', 'Other',
];

export default function EditInvoluntaryHoldPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [legalCounselNotified, setLegalCounselNotified] = useState(false);

  useEffect(() => {
    fetch(`/api/patient-rights/holds/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLegalCounselNotified(!!d.legalCounselNotified);
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
      patientInitials:      (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      patientMrn:           (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      holdType:             (form.elements.namedItem('holdType') as HTMLSelectElement).value,
      holdStartDate:        (form.elements.namedItem('holdStartDate') as HTMLInputElement).value,
      holdExpiryDate:       (form.elements.namedItem('holdExpiryDate') as HTMLInputElement).value,
      petitionerName:       (form.elements.namedItem('petitionerName') as HTMLInputElement).value || null,
      orderingPhysician:    (form.elements.namedItem('orderingPhysician') as HTMLInputElement).value,
      legalCounselNotified,
      courtHearingDate:     (form.elements.namedItem('courtHearingDate') as HTMLInputElement).value || null,
      notes:                (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/patient-rights/holds/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/patient-rights/holds/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/patient-rights/holds/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Lock className="w-6 h-6 text-red-600" />
          Edit Involuntary Hold
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Patient &amp; Hold Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Patient Initials *</label>
              <input name="patientInitials" required className="form-input w-full" defaultValue={data.patientInitials ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">MRN</label>
              <input name="patientMrn" className="form-input w-full" defaultValue={data.patientMrn ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Hold Type *</label>
            <select name="holdType" required className="form-input w-full" defaultValue={data.holdType ?? ''}>
              <option value="">Select…</option>
              {HOLD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Hold Start Date *</label>
              <input name="holdStartDate" type="datetime-local" required className="form-input w-full"
                defaultValue={data.holdStartDate ? data.holdStartDate.slice(0, 16) : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Hold Expiry Date *</label>
              <input name="holdExpiryDate" type="datetime-local" required className="form-input w-full"
                defaultValue={data.holdExpiryDate ? data.holdExpiryDate.slice(0, 16) : ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Legal &amp; Clinical</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Ordering Physician *</label>
              <input name="orderingPhysician" required className="form-input w-full" defaultValue={data.orderingPhysician ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Petitioner Name</label>
              <input name="petitionerName" className="form-input w-full" defaultValue={data.petitionerName ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Court Hearing Date</label>
            <input name="courtHearingDate" type="date" className="form-input w-full" defaultValue={data.courtHearingDate?.split('T')[0] ?? ''} />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="legalCounselNotified" type="checkbox" className="rounded"
              checked={legalCounselNotified} onChange={e => setLegalCounselNotified(e.target.checked)} />
            Legal counsel / patient advocate notified
          </label>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
          <textarea name="notes" rows={3} className="form-input w-full" defaultValue={data.notes ?? ''} />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/patient-rights/holds/${id}`} className="px-4 py-2 text-sm text-muted-foreground">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
