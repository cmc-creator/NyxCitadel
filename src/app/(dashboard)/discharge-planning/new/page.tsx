'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

const DISPOSITIONS = [
  'HOME_NO_SERVICES', 'HOME_WITH_SERVICES', 'HOME_HEALTH', 'SNF', 'LTAC',
  'ACUTE_REHAB', 'BEHAVIORAL_HEALTH', 'HOSPICE_HOME', 'HOSPICE_FACILITY',
  'ASSISTED_LIVING', 'BOARD_CARE', 'AMA', 'EXPIRED',
];

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function NewDischargePlanPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      patientMrn:            (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      patientInitials:       (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      admitDate:             (form.elements.namedItem('admitDate') as HTMLInputElement).value,
      unit:                  (form.elements.namedItem('unit') as HTMLInputElement).value,
      assessmentStartDate:   (form.elements.namedItem('assessmentStartDate') as HTMLInputElement).value,
      assessmentBy:          (form.elements.namedItem('assessmentBy') as HTMLInputElement).value,
      expectedDisposition:   (form.elements.namedItem('expectedDisposition') as HTMLSelectElement).value,
      estimatedDischargeDate:(form.elements.namedItem('estimatedDischargeDate') as HTMLInputElement).value || null,
      insuranceAuth:         (form.elements.namedItem('insuranceAuth') as HTMLInputElement).value || null,
      primaryDx:             (form.elements.namedItem('primaryDx') as HTMLInputElement).value,
      careCoordinator:       (form.elements.namedItem('careCoordinator') as HTMLInputElement).value || null,
      familyInvolved:        (form.elements.namedItem('familyInvolved') as HTMLInputElement).checked,
      barrierNotes:          (form.elements.namedItem('barrierNotes') as HTMLTextAreaElement).value || null,
      moonRequired:          (form.elements.namedItem('moonRequired') as HTMLInputElement).checked,
    };

    const res = await fetch('/api/discharge-plans', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/discharge-planning'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save plan.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/discharge-planning" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Discharge Planning
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Home className="w-6 h-6 text-rose-600" />
          New Discharge Plan
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Assessment should be initiated within 24 hours of admission.</p>
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
          <h2 className="text-sm font-semibold text-slate-800">Assessment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assessment Start Date *</label>
              <input name="assessmentStartDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assessed By *</label>
              <input name="assessmentBy" type="text" required className="form-input w-full" placeholder="Social worker / case manager" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Care Coordinator</label>
            <input name="careCoordinator" type="text" className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Discharge Planning</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expected Disposition *</label>
              <select name="expectedDisposition" required className="form-input w-full">
                <option value="">Select…</option>
                {DISPOSITIONS.map(d => <option key={d} value={d}>{formatLabel(d)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Est. Discharge Date</label>
              <input name="estimatedDischargeDate" type="date" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Insurance Authorization #</label>
            <input name="insuranceAuth" type="text" className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Barrier Notes</label>
            <textarea name="barrierNotes" rows={2} className="form-input w-full" placeholder="Homeless, no support, insurance denial, etc." />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="familyInvolved" type="checkbox" className="rounded" />
              Family / Caregiver Involved
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input name="moonRequired" type="checkbox" className="rounded" />
              MOON Notice Required
            </label>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/discharge-planning" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
