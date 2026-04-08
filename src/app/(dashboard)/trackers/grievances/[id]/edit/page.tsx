'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MessageSquareWarning, ArrowLeft } from 'lucide-react';

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

export default function EditGrievancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reportableToAdhs, setReportableToAdhs] = useState(false);

  useEffect(() => {
    fetch(`/api/grievances/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setReportableToAdhs(d.reportableToAdhs ?? false);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-muted-foreground/70 p-8">LoadingΓÇª</div>;
  if (!data) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const f = e.currentTarget;

    const payload = {
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
      reportableToAdhs,
      notes:            (f.elements.namedItem('notes') as HTMLTextAreaElement).value,
    };

    const res = await fetch(`/api/grievances/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/trackers/grievances/${id}`);
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
        <a href={`/trackers/grievances/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-500 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquareWarning className="w-6 h-6 text-orange-500" />
          Edit Patient Grievance
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="space-y-5">
        {/* Grievance details */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Grievance Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Date Received *</label>
              <input
                name="dateReceived"
                type="date"
                required
                defaultValue={data.dateReceived ? data.dateReceived.split('T')[0] : ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Severity *</label>
              <select
                name="severity"
                required
                defaultValue={data.severity}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {SEVERITIES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Category *</label>
              <select
                name="category"
                required
                defaultValue={data.category}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Assigned To</label>
              <input
                name="assignedTo"
                defaultValue={data.assignedTo ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Grievance Summary *</label>
            <textarea
              name="summary"
              required
              rows={4}
              defaultValue={data.summary ?? ''}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Complainant info */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Complainant Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Complainant Name *</label>
              <input
                name="complainantName"
                required
                defaultValue={data.complainantName ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Complainant Type *</label>
              <select
                name="complainantType"
                required
                defaultValue={data.complainantType}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select type...</option>
                {COMPLAINANT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Phone</label>
              <input
                name="complainantPhone"
                type="tel"
                defaultValue={data.complainantPhone ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
              <input
                name="complainantEmail"
                type="email"
                defaultValue={data.complainantEmail ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Patient info */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Patient Information (if applicable)</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Patient Name</label>
              <input
                name="patientName"
                defaultValue={data.patientName ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">MRN</label>
              <input
                name="patientMRN"
                defaultValue={data.patientMRN ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Regulatory */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Regulatory</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={reportableToAdhs}
              onChange={e => setReportableToAdhs(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-foreground/80">
              Reportable to AZ ADHS (R9-10-211 adverse event or patient rights violation)
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Internal Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={data.notes ?? ''}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'SavingΓÇª' : 'Save Changes'}
          </button>
          <a href={`/trackers/grievances/${id}`} className="py-2.5 px-5 rounded-xl border border-border text-sm font-medium text-foreground/80 hover:bg-slate-50 transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
