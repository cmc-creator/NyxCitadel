'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  ['ORIENTATION', 'Orientation'],
  ['ANNUAL_MANDATORY', 'Annual Mandatory'],
  ['EMERGENCY_MANAGEMENT', 'Emergency Management'],
  ['FIRE_SAFETY', 'Fire Safety'],
  ['INFECTION_CONTROL', 'Infection Control'],
  ['CPR_BLS', 'CPR / BLS'],
  ['CPI_DE_ESCALATION', 'CPI / De-escalation'],
  ['SUICIDE_RISK', 'Suicide Risk Assessment'],
  ['RESTRAINT_SECLUSION', 'Restraint & Seclusion'],
  ['MEDICATION_MANAGEMENT', 'Medication Management'],
  ['HIPAA_PRIVACY', 'HIPAA / Privacy'],
  ['CLINICAL_COMPETENCY', 'Clinical Competency'],
  ['LEADERSHIP', 'Leadership'],
  ['HAZMAT', 'Hazmat'],
  ['OTHER', 'Other'],
];

const STATUSES = [
  ['PENDING', 'Pending'],
  ['IN_PROGRESS', 'In Progress'],
  ['COMPLETED', 'Completed'],
  ['EXPIRED', 'Expired'],
  ['OVERDUE', 'Overdue'],
  ['EXEMPT', 'Exempt'],
];

const REGULATORY_BODIES = [
  ['', '— None —'],
  ['JOINT_COMMISSION', 'The Joint Commission'],
  ['CMS', 'CMS'],
  ['AZ_ADHS', 'AZ ADHS'],
  ['AZ_BON', 'AZ Board of Nursing'],
  ['OSHA', 'OSHA'],
  ['SAMHSA', 'SAMHSA'],
  ['INTERNAL', 'Internal'],
  ['OTHER', 'Other'],
];

export default function NewTrainingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    const getChk = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).checked;

    const data = {
      staffName:      get('staffName'),
      staffId:        get('staffId') || null,
      department:     get('department') || null,
      jobTitle:       get('jobTitle') || null,
      trainingName:   get('trainingName'),
      category:       get('category'),
      status:         get('status'),
      completedDate:  get('completedDate') || null,
      expiryDate:     get('expiryDate') || null,
      isRequired:     getChk('isRequired'),
      score:          get('score') ? Number(get('score')) : null,
      passingScore:   get('passingScore') ? Number(get('passingScore')) : null,
      provider:       get('provider') || null,
      notes:          get('notes') || null,
      regulatoryBody: get('regulatoryBody') || null,
    };

    const res = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/trackers/training');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save training record.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/trackers/training" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Training Tracker
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-purple-600" />
          Log Training Record
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Document staff training completions, competency assessments, and certifications.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">

        {/* Staff Info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Staff Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
              <input name="staffName" required className="form-input w-full" placeholder="First and last name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Employee ID</label>
              <input name="staffId" className="form-input w-full" placeholder="EMP-12345" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Job Title</label>
              <input name="jobTitle" className="form-input w-full" placeholder="RN, MHT, Pharmacist…" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <input name="department" className="form-input w-full" placeholder="Nursing, Pharmacy, Behavioral Health…" />
            </div>
          </div>
        </div>

        {/* Training Details */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Training Details</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Training Name *</label>
            <input name="trainingName" required className="form-input w-full" placeholder="e.g., CPI Nonviolent Crisis Intervention — Annual Recertification" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select name="category" required className="form-input w-full">
                <option value="">Select category…</option>
                {CATEGORIES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" defaultValue="COMPLETED" className="form-input w-full">
                {STATUSES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Completed Date</label>
              <input type="date" name="completedDate" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expiry / Renewal Date</label>
              <input type="date" name="expiryDate" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Training Provider / Vendor</label>
            <input name="provider" className="form-input w-full" placeholder="e.g., Crisis Prevention Institute (CPI), internal" />
          </div>
        </div>

        {/* Scoring */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Assessment Score <span className="font-normal text-slate-400">(optional)</span></h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Score Achieved (%)</label>
              <input type="number" name="score" min="0" max="100" step="0.1" className="form-input w-full" placeholder="e.g., 92" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Passing Score (%)</label>
              <input type="number" name="passingScore" min="0" max="100" step="0.1" className="form-input w-full" placeholder="e.g., 80" />
            </div>
          </div>
        </div>

        {/* Regulatory & Flags */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Compliance Flags</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Regulatory Body</label>
            <select name="regulatoryBody" className="form-input w-full">
              {REGULATORY_BODIES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isRequired" name="isRequired" defaultChecked className="accent-purple-600" />
            <label htmlFor="isRequired" className="text-sm text-slate-700">This is a required / mandatory training</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full resize-none" placeholder="Additional notes or observations…" />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/trackers/training" className="btn-secondary text-sm">Cancel</a>
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : 'Log Training Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
