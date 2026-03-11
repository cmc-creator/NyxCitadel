'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

const INCIDENT_TYPES = [
  'FALL', 'MEDICATION_ERROR', 'ELOPEMENT', 'ASSAULT_PATIENT_ON_PATIENT',
  'ASSAULT_PATIENT_ON_STAFF', 'SELF_HARM', 'SUICIDE_ATTEMPT', 'DEATH',
  'RESTRAINT_ADVERSE_EVENT', 'SECLUSION_ADVERSE_EVENT', 'PROPERTY_DAMAGE',
  'VISITOR_INJURY', 'EQUIPMENT_FAILURE', 'FIRE', 'UTILITY_FAILURE', 'OTHER',
];

const SEVERITY_LEVELS = ['MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC', 'SENTINEL'];

export default function EditIncidentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [patientInvolved, setPatientInvolved] = useState(false);
  const [reportableToState, setReportableToState] = useState(false);

  useEffect(() => {
    fetch(`/api/incidents/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setPatientInvolved(d.patientInvolved ?? false);
        setReportableToState(d.reportableToState ?? false);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;

    const payload = {
      incidentType:      (form.elements.namedItem('incidentType') as HTMLSelectElement).value,
      severity:          (form.elements.namedItem('severity') as HTMLSelectElement).value,
      dateOccurred:      (form.elements.namedItem('dateOccurred') as HTMLInputElement).value,
      location:          (form.elements.namedItem('location') as HTMLInputElement).value,
      description:       (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      immediateActions:  (form.elements.namedItem('immediateActions') as HTMLTextAreaElement).value,
      patientInvolved,
      reportableToState,
    };

    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/trackers/incidents/${id}`);
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to update.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/trackers/incidents/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Edit Incident Report
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {/* Core info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Incident Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Incident Type *</label>
              <select name="incidentType" required defaultValue={data.incidentType} className="form-input w-full">
                <option value="">Select type…</option>
                {INCIDENT_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Severity *</label>
              <select name="severity" required defaultValue={data.severity} className="form-input w-full">
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
              <input
                name="dateOccurred"
                type="datetime-local"
                required
                defaultValue={data.dateOccurred ? data.dateOccurred.slice(0, 16) : ''}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <input name="location" defaultValue={data.location ?? ''} className="form-input w-full" />
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Narrative &amp; Actions</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description of Incident *</label>
            <textarea name="description" required rows={5} defaultValue={data.description ?? ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Immediate Actions Taken</label>
            <textarea name="immediateActions" rows={3} defaultValue={data.immediateActions ?? ''} className="form-input w-full" />
          </div>
        </div>

        {/* Reporting flags */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Reporting Flags</h2>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={patientInvolved}
              onChange={e => setPatientInvolved(e.target.checked)}
              className="rounded border-slate-300 text-purple-600"
            />
            Patient was involved in this incident
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={reportableToState}
              onChange={e => setReportableToState(e.target.checked)}
              className="rounded border-slate-300 text-purple-600"
            />
            Requires AZ ADHS / Regulatory Reporting (Sentinel Event, Abuse, Unexpected Death)
          </label>
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <DeleteButton apiPath={`/api/incidents/${id}`} redirectPath="/trackers/incidents" label="incident" />
          <div className="flex gap-3">
            <a href={`/trackers/incidents/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</a>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
