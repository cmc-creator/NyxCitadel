'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  ['', '- Not specified -'],
  ['COMPLIANCE_OFFICER', 'Compliance Officer'],
  ['EM_COORDINATOR', 'EM Coordinator'],
  ['NURSING_DIRECTOR', 'Nursing Director'],
  ['FACILITY_ADMIN', 'Facility Admin'],
  ['DEPARTMENT_HEAD', 'Department Head'],
];

export default function EditComplianceItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  useEffect(() => {
    fetch(`/api/compliance/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setIsRequired(d.isRequired ?? true);
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
      title:           get('title'),
      description:     get('description') || null,
      regulatoryBody:  get('regulatoryBody'),
      standardRef:     get('standardRef') || null,
      category:        get('category'),
      frequency:       get('frequency'),
      lastDoneDate:    get('lastDoneDate') || null,
      nextDueDate:     get('nextDueDate') || null,
      status:          get('status'),
      isRequired,
      notes:           get('notes') || null,
      responsibleRole: get('responsibleRole') || null,
    };

    const res = await fetch(`/api/compliance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/trackers/compliance/${id}`);
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
        <a href={`/trackers/compliance/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          Edit Compliance Item
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">

        {/* Core Info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Compliance Requirement</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input name="title" required defaultValue={data.title} className="form-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Regulatory Body *</label>
              <select name="regulatoryBody" required defaultValue={data.regulatoryBody} className="form-input w-full">
                <option value="">Select body…</option>
                {REGULATORY_BODIES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <input name="category" required defaultValue={data.category} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Standard / Regulatory Reference</label>
            <input name="standardRef" defaultValue={data.standardRef ?? ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea name="description" rows={2} defaultValue={data.description ?? ''} className="form-input w-full resize-none" />
          </div>
        </div>

        {/* Schedule */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Schedule &amp; Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Frequency *</label>
              <select name="frequency" required defaultValue={data.frequency} className="form-input w-full">
                <option value="">Select frequency…</option>
                {FREQUENCIES.map(([v, l]) => (
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Last Completed Date</label>
              <input type="date" name="lastDoneDate" defaultValue={data.lastDoneDate ? data.lastDoneDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Due Date</label>
              <input type="date" name="nextDueDate" defaultValue={data.nextDueDate ? data.nextDueDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
          </div>
        </div>

        {/* Ownership */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Ownership &amp; Flags</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Responsible Role</label>
            <select name="responsibleRole" defaultValue={data.responsibleRole ?? ''} className="form-input w-full">
              {RESPONSIBLE_ROLES.map(([v, l]) => (
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
            <label htmlFor="isRequired" className="text-sm text-slate-700">This is a mandatory compliance requirement</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea name="notes" rows={2} defaultValue={data.notes ?? ''} className="form-input w-full resize-none" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/trackers/compliance/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
