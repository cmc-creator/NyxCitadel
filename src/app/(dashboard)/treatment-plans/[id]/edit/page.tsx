'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ClipboardList, ArrowLeft } from 'lucide-react';

export default function EditTreatmentPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/treatment-plans/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError('');
    const form = e.currentTarget;
    const treatmentTeam = (form.elements.namedItem('treatmentTeam') as HTMLTextAreaElement).value
      .split('\n').map((s: string) => s.trim()).filter(Boolean);
    const payload = {
      patientMrn:          (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      patientInitials:     (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      admitDate:           (form.elements.namedItem('admitDate') as HTMLInputElement).value,
      unit:                (form.elements.namedItem('unit') as HTMLInputElement).value,
      primaryDx:           (form.elements.namedItem('primaryDx') as HTMLInputElement).value,
      treatmentTeam,
      planCreatedDate:     (form.elements.namedItem('planCreatedDate') as HTMLInputElement).value,
      planCreatedBy:       (form.elements.namedItem('planCreatedBy') as HTMLInputElement).value,
      patientParticipated: (form.elements.namedItem('patientParticipated') as HTMLInputElement).checked,
      participationNotes:  (form.elements.namedItem('participationNotes') as HTMLTextAreaElement).value || null,
      dischargeGoal:       (form.elements.namedItem('dischargeGoal') as HTMLTextAreaElement).value || null,
      estimatedLos:        (form.elements.namedItem('estimatedLos') as HTMLInputElement).value || null,
    };
    const res = await fetch(`/api/treatment-plans/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/treatment-plans/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  const teamValue = Array.isArray(data.treatmentTeam) ? data.treatmentTeam.join('\n') : (data.treatmentTeam ?? '');

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/treatment-plans/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-rose-600" />
          Edit Treatment Plan
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Patient &amp; Admission</h2>
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
          <h2 className="text-sm font-semibold text-slate-800">Plan Creation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plan Created Date *</label>
              <input name="planCreatedDate" type="date" required defaultValue={data.planCreatedDate?.split('T')[0] ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plan Created By *</label>
              <input name="planCreatedBy" type="text" required defaultValue={data.planCreatedBy ?? ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Treatment Team (one member per line) *</label>
            <textarea name="treatmentTeam" rows={4} required defaultValue={teamValue} className="form-input w-full"
              placeholder="Dr. Jane Smith, MD — Attending&#10;Bob Jones, RN — Primary Nurse&#10;Alice Lee, SW — Social Work" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Patient Participation &amp; Goals</h2>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="patientParticipated" type="checkbox" defaultChecked={!!data.patientParticipated} className="rounded" />
            Patient / Legal Representative Participated in Plan Development
          </label>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Participation Notes</label>
            <textarea name="participationNotes" rows={2} defaultValue={data.participationNotes ?? ''} className="form-input w-full" placeholder="If patient unable to participate, document reason…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Discharge Goal</label>
            <textarea name="dischargeGoal" rows={2} defaultValue={data.dischargeGoal ?? ''} className="form-input w-full" placeholder="Patient will be discharged to home with home health support…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estimated Length of Stay</label>
            <input name="estimatedLos" type="text" defaultValue={data.estimatedLos ?? ''} className="form-input w-full" placeholder="e.g. 5-7 days" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/treatment-plans/${id}`} className="px-4 py-2 text-sm text-slate-600">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
