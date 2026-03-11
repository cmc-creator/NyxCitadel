'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

const RS_TYPES = [
  'PHYSICAL_RESTRAINT', 'MECHANICAL_RESTRAINT', 'CHEMICAL_RESTRAINT', 'SECLUSION', 'PHYSICAL_HOLD',
];

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function EditRestraintEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/restraint-seclusion/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError('');
    const form = e.currentTarget;
    const payload = {
      eventNumber:           (form.elements.namedItem('eventNumber') as HTMLInputElement).value,
      patientMrn:            (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      patientInitials:       (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      unit:                  (form.elements.namedItem('unit') as HTMLInputElement).value,
      eventDate:             (form.elements.namedItem('eventDate') as HTMLInputElement).value,
      eventTime:             (form.elements.namedItem('eventTime') as HTMLInputElement).value,
      rsType:                (form.elements.namedItem('rsType') as HTMLSelectElement).value,
      orderingProvider:      (form.elements.namedItem('orderingProvider') as HTMLInputElement).value,
      orderDateTime:         (form.elements.namedItem('orderDateTime') as HTMLInputElement).value,
      initiatedBy:           (form.elements.namedItem('initiatedBy') as HTMLInputElement).value,
      clinicalJustification: (form.elements.namedItem('clinicalJustification') as HTMLTextAreaElement).value,
      behaviors:             (form.elements.namedItem('behaviors') as HTMLTextAreaElement).value,
      lessRestrictiveTried:  (form.elements.namedItem('lessRestrictiveTried') as HTMLTextAreaElement).value,
    };
    const res = await fetch(`/api/restraint-seclusion/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/restraint-seclusion/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/restraint-seclusion/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldOff className="w-6 h-6 text-rose-600" />
          Edit Restraint / Seclusion Event
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Event Identification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Event Number *</label>
              <input name="eventNumber" type="text" required defaultValue={data.eventNumber ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Restraint / Seclusion Type *</label>
              <select name="rsType" required defaultValue={data.rsType ?? ''} className="form-input w-full">
                <option value="">Select…</option>
                {RS_TYPES.map(t => <option key={t} value={t}>{formatLabel(t)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient Initials *</label>
              <input name="patientInitials" type="text" required maxLength={6} defaultValue={data.patientInitials ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">MRN</label>
              <input name="patientMrn" type="text" defaultValue={data.patientMrn ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit *</label>
              <input name="unit" type="text" required defaultValue={data.unit ?? ''} className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Event Date *</label>
              <input name="eventDate" type="date" required defaultValue={data.eventDate?.split('T')[0] ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Event Time *</label>
              <input name="eventTime" type="time" required defaultValue={data.eventTime ?? ''} className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Order &amp; Staff</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ordering Provider *</label>
              <input name="orderingProvider" type="text" required defaultValue={data.orderingProvider ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Order DateTime *</label>
              <input name="orderDateTime" type="datetime-local" required
                defaultValue={data.orderDateTime ? data.orderDateTime.slice(0, 16) : ''}
                className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Initiated By *</label>
            <input name="initiatedBy" type="text" required defaultValue={data.initiatedBy ?? ''} className="form-input w-full" placeholder="Staff name / role" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Clinical Documentation</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Behaviors Warranting Use *</label>
            <textarea name="behaviors" rows={2} required defaultValue={data.behaviors ?? ''} className="form-input w-full" placeholder="Describe observed behaviors…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Less Restrictive Interventions Tried *</label>
            <textarea name="lessRestrictiveTried" rows={2} required defaultValue={data.lessRestrictiveTried ?? ''} className="form-input w-full" placeholder="Verbal de-escalation, reorientation, etc." />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Clinical Justification *</label>
            <textarea name="clinicalJustification" rows={3} required defaultValue={data.clinicalJustification ?? ''} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <DeleteButton apiPath={`/api/restraint-seclusion/${id}`} redirectPath="/restraint-seclusion" label="restraint/seclusion event" />
          <div className="flex gap-3">
            <a href={`/restraint-seclusion/${id}`} className="px-4 py-2 text-sm text-slate-600">Cancel</a>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
