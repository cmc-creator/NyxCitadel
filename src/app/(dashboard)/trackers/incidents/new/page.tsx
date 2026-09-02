'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { AiFieldHelper } from '@/components/ai/AiFieldHelper';
import { SentryPageGuide } from '@/components/ai/SentryPageGuide';
import { VoiceIncidentModal } from '@/components/trackers/VoiceIncidentModal';

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
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [immediateActions, setImmediateActions] = useState('');
  const [dateOccurred, setDateOccurred] = useState('');

  function handleApplyVoiceData(data: {
    incidentType: string;
    severity: string;
    description: string;
    unit: string;
    dateOccurred: string;
  }) {
    setIncidentType(INCIDENT_TYPES.includes(data.incidentType) ? data.incidentType : 'OTHER');
    setSeverity(SEVERITY_LEVELS.includes(data.severity) ? data.severity : data.severity || '');
    setDescription(data.description);
    setLocation(data.unit);
    // datetime-local expects YYYY-MM-DDTHH:mm; voice parse may return a date-only string
    setDateOccurred(data.dateOccurred.includes('T') ? data.dateOccurred : `${data.dateOccurred}T00:00`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      incidentType,
      severity,
      dateOccurred:      dateOccurred || (form.elements.namedItem('dateOccurred') as HTMLInputElement).value,
      location,
      description,
      immediateActions,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <a href="/trackers/incidents" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
          </a>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            File Incident Report
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete within 24 hours of occurrence. AZ ADHS Sentinel events must be reported within 24 hours.
          </p>
        </div>

        <VoiceIncidentModal onApplyParsedData={handleApplyVoiceData} />
      </div>

      <SentryPageGuide
        pageKey="incidents-new"
        title="Filing an Incident Report"
        body="An incident report is your official record of what happened. Document the facts clearly and objectively. Use the sparkle button next to any text field to have Sentry help you write it."
        tips={[
          "Describe only what you directly observed or was reported to you",
          "Immediate Actions should list every clinical response: nursing, physician notification, family contact",
          "Sentinel events (patient death, serious harm, elopement) require AZ ADHS reporting within 24 hours",
          "This report may trigger an RCA -- thorough documentation now saves time later",
        ]}
      />

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        {/* Core info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Incident Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Incident Type *</label>
              <select
                name="incidentType"
                required
                value={incidentType}
                onChange={e => setIncidentType(e.target.value)}
                className="form-input w-full"
              >
                <option value="">Select type...</option>
                {INCIDENT_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Severity *</label>
              <select
                name="severity"
                required
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="form-input w-full"
              >
                <option value="">Select severity...</option>
                {SEVERITY_LEVELS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date &amp; Time of Incident *</label>
              <input
                name="dateOccurred"
                type="datetime-local"
                required
                value={dateOccurred}
                onChange={e => setDateOccurred(e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <input
                name="location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. Unit 3B, Room 12, Common Area"
              />
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Narrative &amp; Actions</h2>
          <AiFieldHelper
            fieldLabel="Description of Incident"
            pageContext="New Incident Report"
            value={description}
            onChange={setDescription}
            rows={5}
            required
            name="description"
            placeholder="Describe what occurred, sequence of events, who was involved, environmental factors..."
            formHints={{
              incidentType: incidentType.replace(/_/g, ' '),
              severity,
              location,
            }}
          />
          <AiFieldHelper
            fieldLabel="Immediate Actions Taken"
            pageContext="New Incident Report"
            value={immediateActions}
            onChange={setImmediateActions}
            rows={3}
            name="immediateActions"
            placeholder="Nursing response, physician notification, family notification, environmental changes..."
            formHints={{
              incidentType: incidentType.replace(/_/g, ' '),
              severity,
              incidentDescription: description.slice(0, 200),
            }}
          />
        </div>

        {/* Reporting flags */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Reporting Flags</h2>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="patientInvolved" type="checkbox" className="rounded border-slate-300 text-teal-600" />
            Patient was involved in this incident
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="reportableToState" type="checkbox" className="rounded border-slate-300 text-teal-600" />
            Requires AZ ADHS / Regulatory Reporting (Sentinel Event, Abuse, Unexpected Death)
          </label>
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/trackers/incidents" className="text-sm text-slate-500 hover:text-foreground/80">Cancel</a>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Submit Incident Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
