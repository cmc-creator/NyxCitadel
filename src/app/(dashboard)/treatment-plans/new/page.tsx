'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList } from 'lucide-react';

export default function NewTreatmentPlanPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const treatmentTeam = (form.elements.namedItem('treatmentTeam') as HTMLTextAreaElement).value
      .split('\n').map((s: string) => s.trim()).filter(Boolean);
    const data = {
      patientMrn:         (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      patientInitials:    (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      admitDate:          (form.elements.namedItem('admitDate') as HTMLInputElement).value,
      unit:               (form.elements.namedItem('unit') as HTMLInputElement).value,
      primaryDx:          (form.elements.namedItem('primaryDx') as HTMLInputElement).value,
      treatmentTeam,
      planCreatedDate:    (form.elements.namedItem('planCreatedDate') as HTMLInputElement).value,
      planCreatedBy:      (form.elements.namedItem('planCreatedBy') as HTMLInputElement).value,
      patientParticipated:(form.elements.namedItem('patientParticipated') as HTMLInputElement).checked,
      participationNotes: (form.elements.namedItem('participationNotes') as HTMLTextAreaElement).value || null,
      dischargeGoal:      (form.elements.namedItem('dischargeGoal') as HTMLTextAreaElement).value || null,
      estimatedLos:       (form.elements.namedItem('estimatedLos') as HTMLInputElement).value || null,
      goals:              [],
    };

    const res = await fetch('/api/treatment-plans', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/treatment-plans'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save plan.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/treatment-plans" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Treatment Plans
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-rose-600" />
          New Treatment Plan
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Treatment goals are added after creation on the plan detail page.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Patient &amp; Admission</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient Initials *</label>
              <input name="patientInitials" type="text" required maxLength={6} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">MRN</label>
              <input name="patientMrn" type="text" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit *</label>
              <input name="unit" type="text" required className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Admit Date *</label>
              <input name="admitDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Primary Diagnosis *</label>
              <input name="primaryDx" type="text" required className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Plan Creation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plan Created Date *</label>
              <input name="planCreatedDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plan Created By *</label>
              <input name="planCreatedBy" type="text" required className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Treatment Team (one member per line) *</label>
            <textarea name="treatmentTeam" rows={4} required className="form-input w-full"
              placeholder="Dr. Jane Smith, MD - Attending&#10;Bob Jones, RN - Primary Nurse&#10;Alice Lee, SW - Social Work" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Patient Participation &amp; Goals</h2>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="patientParticipated" type="checkbox" defaultChecked className="rounded" />
            Patient / Legal Representative Participated in Plan Development
          </label>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Participation Notes</label>
            <textarea name="participationNotes" rows={2} className="form-input w-full" placeholder="If patient unable to participate, document reason…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Discharge Goal</label>
            <textarea name="dischargeGoal" rows={2} className="form-input w-full" placeholder="Patient will be discharged to home with home health support…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estimated Length of Stay</label>
            <input name="estimatedLos" type="text" className="form-input w-full" placeholder="e.g. 5-7 days" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/treatment-plans" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
