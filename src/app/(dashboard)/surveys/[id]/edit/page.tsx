'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ClipboardList, ArrowLeft } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

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

export default function EditSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/surveys/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    const getChk = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).checked;

    const payload = {
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

    const res = await fetch(`/api/surveys/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/surveys/${id}`);
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save survey record.');
      setSaving(false);
    }
  }

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Not found.'}</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/surveys/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Survey
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-purple-600" />
          Edit Survey / Inspection
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">

        {/* Survey Info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Survey Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Survey Type *</label>
              <select name="surveyType" required defaultValue={data.surveyType ?? ''} className="form-input w-full">
                <option value="">Select type…</option>
                {SURVEY_TYPES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Regulatory Body *</label>
              <select name="regulatoryBody" required defaultValue={data.regulatoryBody ?? ''} className="form-input w-full">
                <option value="">Select body…</option>
                {REGULATORY_BODIES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" defaultValue={data.status ?? 'SCHEDULED'} className="form-input w-full">
                {STATUSES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Conducted / Survey Date</label>
              <input type="date" name="conductedDate" defaultValue={data.conductedDate?.split('T')[0] ?? ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Surveyor Name(s)</label>
            <input name="surveyorNames" defaultValue={data.surveyorNames ?? ''} className="form-input w-full" />
          </div>
        </div>

        {/* Findings */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Findings &amp; Response</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Number of Findings</label>
              <input type="number" name="findingCount" min="0" defaultValue={data.findingCount ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Response Deadline</label>
              <input type="date" name="responseDeadline" defaultValue={data.responseDeadline?.split('T')[0] ?? ''} className="form-input w-full" />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="immediateJeopardy"
                name="immediateJeopardy"
                defaultChecked={data.immediateJeopardy ?? false}
                className="accent-red-600"
              />
              <label htmlFor="immediateJeopardy" className="text-sm text-slate-700">
                <span className="font-medium text-red-600">Immediate Jeopardy</span> cited
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="conditionLevel"
                name="conditionLevel"
                defaultChecked={data.conditionLevel ?? false}
                className="accent-orange-500"
              />
              <label htmlFor="conditionLevel" className="text-sm text-slate-700">
                <span className="font-medium text-orange-500">Condition-Level</span> deficiency
              </label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Notes</h2>
          <textarea name="notes" rows={3} defaultValue={data.notes ?? ''} className="form-input w-full resize-none" />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <DeleteButton apiPath={`/api/surveys/${id}`} redirectPath="/surveys" label="survey record" />
          <div className="flex gap-3">
            <a href={`/surveys/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</a>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
