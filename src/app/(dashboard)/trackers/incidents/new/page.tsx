'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const INCIDENT_TYPES = [
  'FALL', 'MEDICATION_ERROR', 'ELOPEMENT', 'ASSAULT_PATIENT_ON_PATIENT',
  'ASSAULT_PATIENT_ON_STAFF', 'SELF_HARM', 'SUICIDE_ATTEMPT', 'DEATH',
  'RESTRAINT_ADVERSE_EVENT', 'SECLUSION_ADVERSE_EVENT', 'PROPERTY_DAMAGE',
  'VISITOR_INJURY', 'EQUIPMENT_FAILURE', 'FIRE', 'UTILITY_FAILURE', 'OTHER',
];

const SEVERITY_LEVELS = ['MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC', 'SENTINEL'];

export default function NewIncidentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      incidentType:      (form.elements.namedItem('incidentType') as HTMLSelectElement).value,
      severity:          (form.elements.namedItem('severity') as HTMLSelectElement).value,
      dateOccurred:      (form.elements.namedItem('dateOccurred') as HTMLInputElement).value,
      location:          (form.elements.namedItem('location') as HTMLInputElement).value,
      description:       (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      immediateActions:  (form.elements.namedItem('immediateActions') as HTMLTextAreaElement).value,
      patientInvolved:   (form.elements.namedItem('patientInvolved') as HTMLInputElement).checked,
      reportableToState: (form.elements.namedItem('reportableToState') as HTMLInputElement).checked,
    };

    const res = await fetch('/api/incident-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/trackers/incidents');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save incident report.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/trackers/incidents" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          File Incident Report
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Complete within 24 hours of occurrence. AZ ADHS Sentinel events must be reported within 24 hours.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {/* Core info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Incident Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Incident Type *</label>
              <select name="incidentType" required className="form-input w-full">
                <option value="">Select type…</option>
                {INCIDENT_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Severity *</label>
              <select name="severity" required className="form-input w-full">
                <option value="">Select severity…</option>
                {SEVERITY_LEVELS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date &amp; Time of Incident *</label>
              <input name="dateOccurred" type="datetime-local" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <input name="location" className="form-input w-full" placeholder="e.g. Unit 3B, Room 12, Common Area" />
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Narrative &amp; Actions</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description of Incident *</label>
            <textarea name="description" required rows={5} className="form-input w-full"
              placeholder="Describe what occurred, sequence of events, who was involved, environmental factors…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Immediate Actions Taken</label>
            <textarea name="immediateActions" rows={3} className="form-input w-full"
              placeholder="Nursing response, physician notification, family notification, environmental changes…" />
          </div>
        </div>

        {/* Reporting flags */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Reporting Flags</h2>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="patientInvolved" type="checkbox" className="rounded border-slate-300 text-purple-600" />
            Patient was involved in this incident
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="reportableToState" type="checkbox" className="rounded border-slate-300 text-purple-600" />
            Requires AZ ADHS / Regulatory Reporting (Sentinel Event, Abuse, Unexpected Death)
          </label>
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/trackers/incidents" className="text-sm text-slate-500 hover:text-slate-700">Cancel</a>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Submit Incident Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
