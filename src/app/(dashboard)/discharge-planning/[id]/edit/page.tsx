'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

const DISPOSITIONS = [
  'HOME_NO_SERVICES', 'HOME_WITH_SERVICES', 'HOME_HEALTH', 'SNF', 'LTAC',
  'ACUTE_REHAB', 'BEHAVIORAL_HEALTH', 'HOSPICE_HOME', 'HOSPICE_FACILITY',
  'ASSISTED_LIVING', 'BOARD_CARE', 'AMA', 'EXPIRED',
];

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function EditDischargePlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/discharge-plans/${id}`)
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
      patientMrn:             (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      patientInitials:        (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      admitDate:              (form.elements.namedItem('admitDate') as HTMLInputElement).value,
      unit:                   (form.elements.namedItem('unit') as HTMLInputElement).value,
      assessmentStartDate:    (form.elements.namedItem('assessmentStartDate') as HTMLInputElement).value,
      assessmentBy:           (form.elements.namedItem('assessmentBy') as HTMLInputElement).value,
      expectedDisposition:    (form.elements.namedItem('expectedDisposition') as HTMLSelectElement).value,
      estimatedDischargeDate: (form.elements.namedItem('estimatedDischargeDate') as HTMLInputElement).value || null,
      insuranceAuth:          (form.elements.namedItem('insuranceAuth') as HTMLInputElement).value || null,
      primaryDx:              (form.elements.namedItem('primaryDx') as HTMLInputElement).value,
      careCoordinator:        (form.elements.namedItem('careCoordinator') as HTMLInputElement).value || null,
      familyInvolved:         (form.elements.namedItem('familyInvolved') as HTMLInputElement).checked,
      barrierNotes:           (form.elements.namedItem('barrierNotes') as HTMLTextAreaElement).value || null,
      moonRequired:           (form.elements.namedItem('moonRequired') as HTMLInputElement).checked,
    };
    const res = await fetch(`/api/discharge-plans/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/discharge-planning/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/discharge-planning/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Home className="w-6 h-6 text-rose-600" />
          Edit Discharge Plan
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Patient &amp; Admission</h2>
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Admit Date *</label>
              <input name="admitDate" type="date" required defaultValue={data.admitDate?.split('T')[0] ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Primary Diagnosis *</label>
              <input name="primaryDx" type="text" required defaultValue={data.primaryDx ?? ''} className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Assessment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assessment Start Date *</label>
              <input name="assessmentStartDate" type="date" required defaultValue={data.assessmentStartDate?.split('T')[0] ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assessed By *</label>
              <input name="assessmentBy" type="text" required defaultValue={data.assessmentBy ?? ''} className="form-input w-full" placeholder="Social worker / case manager" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Care Coordinator</label>
            <input name="careCoordinator" type="text" defaultValue={data.careCoordinator ?? ''} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Discharge Planning</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expected Disposition *</label>
              <select name="expectedDisposition" required defaultValue={data.expectedDisposition ?? ''} className="form-input w-full">
                <option value="">Select…</option>
                {DISPOSITIONS.map(d => <option key={d} value={d}>{formatLabel(d)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Est. Discharge Date</label>
              <input name="estimatedDischargeDate" type="date" defaultValue={data.estimatedDischargeDate?.split('T')[0] ?? ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Insurance Authorization #</label>
            <input name="insuranceAuth" type="text" defaultValue={data.insuranceAuth ?? ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Barrier Notes</label>
            <textarea name="barrierNotes" rows={2} defaultValue={data.barrierNotes ?? ''} className="form-input w-full" placeholder="Homeless, no support, insurance denial, etc." />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input name="familyInvolved" type="checkbox" defaultChecked={!!data.familyInvolved} className="rounded" />
              Family / Caregiver Involved
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input name="moonRequired" type="checkbox" defaultChecked={!!data.moonRequired} className="rounded" />
              MOON Notice Required
            </label>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/discharge-planning/${id}`} className="px-4 py-2 text-sm text-slate-600">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
