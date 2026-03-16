'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  ['', '- None -'],
  ['JOINT_COMMISSION', 'The Joint Commission'],
  ['CMS', 'CMS'],
  ['AZ_ADHS', 'AZ ADHS'],
  ['AZ_BON', 'AZ Board of Nursing'],
  ['OSHA', 'OSHA'],
  ['SAMHSA', 'SAMHSA'],
  ['INTERNAL', 'Internal'],
  ['OTHER', 'Other'],
];

export default function EditTrainingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  useEffect(() => {
    fetch(`/api/training/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setIsRequired(d.isRequired ?? false);
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
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;

    const payload = {
      staffName:      get('staffName'),
      staffId:        get('staffId') || null,
      department:     get('department') || null,
      jobTitle:       get('jobTitle') || null,
      trainingName:   get('trainingName'),
      category:       get('category'),
      status:         get('status'),
      completedDate:  get('completedDate') || null,
      expiryDate:     get('expiryDate') || null,
      isRequired,
      score:          get('score') ? Number(get('score')) : null,
      passingScore:   get('passingScore') ? Number(get('passingScore')) : null,
      provider:       get('provider') || null,
      notes:          get('notes') || null,
      regulatoryBody: get('regulatoryBody') || null,
    };

    const res = await fetch(`/api/training/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/trackers/training/${id}`);
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
        <a href={`/trackers/training/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-purple-600" />
          Edit Training Record
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">

        {/* Staff Info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Staff Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
              <input name="staffName" required defaultValue={data.staffName} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Employee ID</label>
              <input name="staffId" defaultValue={data.staffId ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Job Title</label>
              <input name="jobTitle" defaultValue={data.jobTitle ?? ''} className="form-input w-full" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <input name="department" defaultValue={data.department ?? ''} className="form-input w-full" />
            </div>
          </div>
        </div>

        {/* Training Details */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Training Details</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Training Name *</label>
            <input name="trainingName" required defaultValue={data.trainingName} className="form-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select name="category" required defaultValue={data.category} className="form-input w-full">
                <option value="">Select category…</option>
                {CATEGORIES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" defaultValue={data.status} className="form-input w-full">
                {STATUSES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Completed Date</label>
              <input type="date" name="completedDate" defaultValue={data.completedDate ? data.completedDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expiry / Renewal Date</label>
              <input type="date" name="expiryDate" defaultValue={data.expiryDate ? data.expiryDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Training Provider / Vendor</label>
            <input name="provider" defaultValue={data.provider ?? ''} className="form-input w-full" />
          </div>
        </div>

        {/* Scoring */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Assessment Score <span className="font-normal text-slate-400">(optional)</span></h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Score Achieved (%)</label>
              <input type="number" name="score" min="0" max="100" step="0.1" defaultValue={data.score ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Passing Score (%)</label>
              <input type="number" name="passingScore" min="0" max="100" step="0.1" defaultValue={data.passingScore ?? ''} className="form-input w-full" />
            </div>
          </div>
        </div>

        {/* Regulatory & Flags */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Compliance Flags</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Regulatory Body</label>
            <select name="regulatoryBody" defaultValue={data.regulatoryBody ?? ''} className="form-input w-full">
              {REGULATORY_BODIES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRequired"
              checked={isRequired}
              onChange={e => setIsRequired(e.target.checked)}
              className="accent-purple-600"
            />
            <label htmlFor="isRequired" className="text-sm text-slate-700">This is a required / mandatory training</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} defaultValue={data.notes ?? ''} className="form-input w-full resize-none" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/trackers/training/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
