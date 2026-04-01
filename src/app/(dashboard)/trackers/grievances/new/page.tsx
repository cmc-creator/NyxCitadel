'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquareWarning, ArrowLeft, Info } from 'lucide-react';

const COMPLAINANT_TYPES = [
  { value: 'PATIENT',              label: 'Patient' },
  { value: 'FAMILY_MEMBER',        label: 'Family Member' },
  { value: 'GUARDIAN_CONSERVATOR', label: 'Guardian / Conservator' },
  { value: 'PATIENT_ADVOCATE',     label: 'Patient Advocate' },
  { value: 'STAFF',                label: 'Staff (Internal)' },
  { value: 'EXTERNAL_AGENCY',      label: 'External Agency' },
  { value: 'ANONYMOUS',            label: 'Anonymous' },
  { value: 'OTHER',                label: 'Other' },
];

const CATEGORIES = [
  { value: 'CLINICAL_CARE_QUALITY',    label: 'Clinical Care / Quality of Care' },
  { value: 'MEDICATION',               label: 'Medication' },
  { value: 'STAFF_CONDUCT',            label: 'Staff Conduct / Attitude' },
  { value: 'PATIENT_RIGHTS',           label: 'Patient Rights Violation' },
  { value: 'RESTRAINT_SECLUSION',      label: 'Restraint or Seclusion' },
  { value: 'DISCHARGE_PLANNING',       label: 'Discharge Planning' },
  { value: 'FACILITY_ENVIRONMENT',     label: 'Facility / Environment' },
  { value: 'BILLING',                  label: 'Billing / Financial' },
  { value: 'PRIVACY_CONFIDENTIALITY',  label: 'Privacy / HIPAA' },
  { value: 'COMMUNICATION',            label: 'Communication' },
  { value: 'NEGLECT_ABUSE',            label: 'Neglect or Abuse Allegation' },
  { value: 'OTHER',                    label: 'Other' },
];

const SEVERITIES = [
  { value: 'STANDARD',   label: 'Standard - routine grievance' },
  { value: 'EXPEDITED',  label: 'Expedited - clinical condition requires faster response' },
  { value: 'REGULATORY', label: 'Regulatory - potential regulatory violation' },
  { value: 'SENTINEL',   label: 'Sentinel - linked to sentinel event / serious harm' },
];

export default function NewGrievancePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const f = e.currentTarget;

    const data = {
      dateReceived:     (f.elements.namedItem('dateReceived') as HTMLInputElement).value,
      complainantName:  (f.elements.namedItem('complainantName') as HTMLInputElement).value,
      complainantType:  (f.elements.namedItem('complainantType') as HTMLSelectElement).value,
      complainantPhone: (f.elements.namedItem('complainantPhone') as HTMLInputElement).value,
      complainantEmail: (f.elements.namedItem('complainantEmail') as HTMLInputElement).value,
      patientName:      (f.elements.namedItem('patientName') as HTMLInputElement).value,
      patientMRN:       (f.elements.namedItem('patientMRN') as HTMLInputElement).value,
      summary:          (f.elements.namedItem('summary') as HTMLTextAreaElement).value,
      category:         (f.elements.namedItem('category') as HTMLSelectElement).value,
      severity:         (f.elements.namedItem('severity') as HTMLSelectElement).value,
      assignedTo:       (f.elements.namedItem('assignedTo') as HTMLInputElement).value,
      reportableToAdhs: (f.elements.namedItem('reportableToAdhs') as HTMLInputElement).checked,
      notes:            (f.elements.namedItem('notes') as HTMLTextAreaElement).value,
    };

    const res = await fetch('/api/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/trackers/grievances');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to log grievance.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/trackers/grievances" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Grievances
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquareWarning className="w-6 h-6 text-orange-500" />
          Log Patient Grievance
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          CMS 482.13(e) requires written acknowledgment within 7 days and resolution within 30 days.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <strong>Deadlines are automatically calculated</strong> - 7-day acknowledgment and 30-day resolution
          deadlines will be set from the date received. Overdue items show on the tracker with red alerts.
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Grievance details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Grievance Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Received *</label>
              <input
                name="dateReceived"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity *</label>
              <select
                name="severity"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {SEVERITIES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select
                name="category"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
              <input
                name="assignedTo"
                placeholder="Staff member name or role"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Grievance Summary *</label>
            <textarea
              name="summary"
              required
              rows={4}
              placeholder="Describe the grievance - what is the complaint, what happened, and what outcome is the complainant seeking?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Complainant info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Complainant Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Complainant Name *</label>
              <input
                name="complainantName"
                required
                placeholder="Full name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Complainant Type *</label>
              <select
                name="complainantType"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select type...</option>
                {COMPLAINANT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                name="complainantPhone"
                type="tel"
                placeholder="(xxx) xxx-xxxx"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                name="complainantEmail"
                type="email"
                placeholder="email@example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Patient info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Patient Information (if applicable)</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
              <input
                name="patientName"
                placeholder="Full name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">MRN</label>
              <input
                name="patientMRN"
                placeholder="Medical record number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* ADHS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Regulatory</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="reportableToAdhs"
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-slate-700">
              Reportable to AZ ADHS (R9-10-211 adverse event or patient rights violation)
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Any additional notes..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Logging...' : 'Log Grievance'}
          </button>
          <a
            href="/trackers/grievances"
            className="py-2.5 px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
