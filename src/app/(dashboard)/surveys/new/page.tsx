'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, ArrowLeft } from 'lucide-react';

const SURVEY_TYPES = [
  ['ACCREDITATION', 'Accreditation Survey'],
  ['VALIDATION', 'Validation Survey'],
  ['COMPLAINT', 'Complaint Investigation'],
  ['LICENSURE', 'Licensure Survey'],
  ['CERTIFICATION', 'Certification Survey'],
  ['FOLLOW_UP', 'Follow-Up Survey'],
  ['SELF_ASSESSMENT', 'Self-Assessment'],
  ['MOCK', 'Mock Survey'],
];

const REGULATORY_BODIES = [
  ['JOINT_COMMISSION', 'The Joint Commission'],
  ['CMS', 'Centers for Medicare & Medicaid (CMS)'],
  ['AZ_ADHS', 'AZ Department of Health Services (ADHS)'],
  ['AZ_BOMEX', 'AZ Board of Medical Examiners'],
  ['AZ_BON', 'AZ Board of Nursing'],
  ['CARF', 'CARF International'],
  ['DNV', 'DNV Healthcare'],
  ['NCQA', 'NCQA'],
  ['SAMHSA', 'SAMHSA'],
  ['INTERNAL', 'Internal'],
  ['OTHER', 'Other'],
];

const STATUSES = [
  ['SCHEDULED', 'Scheduled'],
  ['IN_PROGRESS', 'In Progress'],
  ['COMPLETED', 'Completed'],
  ['RESPONSE_DUE', 'Response Due'],
  ['RESPONSE_SUBMITTED', 'Response Submitted'],
  ['CLOSED', 'Closed'],
];

export default function NewSurveyPage() {
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
      surveyType:        get('surveyType'),
      regulatoryBody:    get('regulatoryBody'),
      conductedDate:     get('conductedDate') || null,
      surveyorNames:     get('surveyorNames') || null,
      status:            get('status'),
      responseDeadline:  get('responseDeadline') || null,
      immediateJeopardy: getChk('immediateJeopardy'),
      conditionLevel:    getChk('conditionLevel'),
      findingCount:      get('findingCount') ? Number(get('findingCount')) : null,
      notes:             get('notes') || null,
    };

    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/surveys');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save survey record.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/surveys" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Surveys &amp; Inspections
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-teal-600" />
          Add Survey / Inspection
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Log regulatory surveys, accreditation visits, complaint investigations, and mock surveys.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">

        {/* Survey Info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Survey Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Survey Type *</label>
              <select name="surveyType" required className="form-input w-full">
                <option value="">Select type…</option>
                {SURVEY_TYPES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Regulatory Body *</label>
              <select name="regulatoryBody" required className="form-input w-full">
                <option value="">Select body…</option>
                {REGULATORY_BODIES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
              <select name="status" defaultValue="SCHEDULED" className="form-input w-full">
                {STATUSES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Conducted / Survey Date</label>
              <input type="date" name="conductedDate" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Surveyor Name(s)</label>
            <input name="surveyorNames" className="form-input w-full" placeholder="Names of surveyors present" />
          </div>
        </div>

        {/* Findings */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Findings &amp; Response</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Number of Findings</label>
              <input type="number" name="findingCount" min="0" className="form-input w-full" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Response Deadline</label>
              <input type="date" name="responseDeadline" className="form-input w-full" />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="immediateJeopardy" name="immediateJeopardy" className="accent-red-600" />
              <label htmlFor="immediateJeopardy" className="text-sm text-foreground/80">
                <span className="font-medium text-red-600">Immediate Jeopardy</span> cited
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="conditionLevel" name="conditionLevel" className="accent-orange-500" />
              <label htmlFor="conditionLevel" className="text-sm text-foreground/80">
                <span className="font-medium text-orange-500">Condition-Level</span> deficiency
              </label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Notes <span className="font-normal text-muted-foreground/70">(optional)</span></h2>
          <textarea name="notes" rows={3} className="form-input w-full resize-none" placeholder="Survey scope, key observations, follow-up actions…" />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/surveys" className="btn-secondary text-sm">Cancel</a>
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : 'Add Survey Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
