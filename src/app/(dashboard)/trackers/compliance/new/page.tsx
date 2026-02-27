'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const REGULATORY_BODIES = [
  ['JOINT_COMMISSION', 'The Joint Commission'],
  ['CMS', 'CMS'],
  ['AZ_ADHS', 'AZ ADHS'],
  ['AZ_BON', 'AZ Board of Nursing'],
  ['AZ_BPPE', 'AZ Board of Pharmacy'],
  ['DEA', 'DEA'],
  ['OSHA', 'OSHA'],
  ['EPA', 'EPA'],
  ['SAMHSA', 'SAMHSA'],
  ['CARF', 'CARF'],
  ['INTERNAL', 'Internal'],
  ['OTHER', 'Other'],
];

const FREQUENCIES = [
  ['DAILY', 'Daily'],
  ['WEEKLY', 'Weekly'],
  ['MONTHLY', 'Monthly'],
  ['QUARTERLY', 'Quarterly'],
  ['SEMI_ANNUAL', 'Semi-Annual'],
  ['ANNUAL', 'Annual'],
  ['BIENNIAL', 'Biennial'],
  ['AS_NEEDED', 'As Needed'],
  ['ONE_TIME', 'One-Time'],
];

const STATUSES = [
  ['ACTIVE', 'Active'],
  ['COMPLIANT', 'Compliant'],
  ['NON_COMPLIANT', 'Non-Compliant'],
  ['PENDING_REVIEW', 'Pending Review'],
  ['WAIVED', 'Waived'],
  ['NA', 'N/A'],
];

const RESPONSIBLE_ROLES = [
  ['', '— Not specified —'],
  ['COMPLIANCE_OFFICER', 'Compliance Officer'],
  ['EM_COORDINATOR', 'EM Coordinator'],
  ['NURSING_DIRECTOR', 'Nursing Director'],
  ['FACILITY_ADMIN', 'Facility Admin'],
  ['DEPARTMENT_HEAD', 'Department Head'],
];

export default function NewComplianceItemPage() {
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
      title:           get('title'),
      description:     get('description') || null,
      regulatoryBody:  get('regulatoryBody'),
      standardRef:     get('standardRef') || null,
      category:        get('category'),
      frequency:       get('frequency'),
      lastDoneDate:    get('lastDoneDate') || null,
      nextDueDate:     get('nextDueDate') || null,
      status:          get('status'),
      isRequired:      getChk('isRequired'),
      notes:           get('notes') || null,
      responsibleRole: get('responsibleRole') || null,
    };

    const res = await fetch('/api/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/trackers/compliance');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save compliance item.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/trackers/compliance" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Compliance Tracker
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          Add Compliance Item
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track recurring regulatory requirements, inspections, and compliance activities.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">

        {/* Core Info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Compliance Requirement</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input name="title" required className="form-input w-full" placeholder="e.g., Fire Extinguisher Monthly Inspection, Nursing License Verification" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Regulatory Body *</label>
              <select name="regulatoryBody" required className="form-input w-full">
                <option value="">Select body…</option>
                {REGULATORY_BODIES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <input name="category" required className="form-input w-full" placeholder="e.g., Life Safety, Licensure, HR" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Standard / Regulatory Reference</label>
            <input name="standardRef" className="form-input w-full" placeholder="e.g., EC.02.03.05, 42 CFR 482.41" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea name="description" rows={2} className="form-input w-full resize-none" placeholder="What is required and how is compliance demonstrated?" />
          </div>
        </div>

        {/* Schedule */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Schedule &amp; Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Frequency *</label>
              <select name="frequency" required className="form-input w-full">
                <option value="">Select frequency…</option>
                {FREQUENCIES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" defaultValue="ACTIVE" className="form-input w-full">
                {STATUSES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last Completed Date</label>
              <input type="date" name="lastDoneDate" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Due Date</label>
              <input type="date" name="nextDueDate" className="form-input w-full" />
            </div>
          </div>
        </div>

        {/* Ownership */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Ownership &amp; Flags</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Responsible Role</label>
            <select name="responsibleRole" className="form-input w-full">
              {RESPONSIBLE_ROLES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isRequired" name="isRequired" defaultChecked className="accent-purple-600" />
            <label htmlFor="isRequired" className="text-sm text-slate-700">This is a mandatory compliance requirement</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea name="notes" rows={2} className="form-input w-full resize-none" placeholder="Additional context, evidence location, responsible parties…" />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/trackers/compliance" className="btn-secondary text-sm">Cancel</a>
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : 'Add Compliance Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
