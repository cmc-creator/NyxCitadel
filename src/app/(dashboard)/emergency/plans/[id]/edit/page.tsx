'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, ArrowLeft } from 'lucide-react';

const PLAN_TYPES = [
  ['EMERGENCY_OPERATIONS_PLAN',  'Emergency Operations Plan'],
  ['FIRE_RESPONSE_PLAN',         'Fire Response Plan'],
  ['EVACUATION_PLAN',            'Evacuation Plan'],
  ['SHELTER_IN_PLACE',           'Shelter in Place'],
  ['ACTIVE_THREAT',              'Active Threat Plan'],
  ['MASS_CASUALTY',              'Mass Casualty Plan'],
  ['UTILITY_FAILURE',            'Utility Failure Plan'],
  ['IT_DISASTER_RECOVERY',       'IT Disaster Recovery'],
  ['COMMUNICATION_PLAN',         'Communication Plan'],
  ['CONTINUITY_OF_OPERATIONS',   'Continuity of Operations'],
  ['HAZMAT_RESPONSE',            'Hazmat Response Plan'],
  ['PANDEMIC_PLAN',              'Pandemic Plan'],
  ['COMMUNITY_PARTNER_MOU',      'Community Partner MOU'],
];

const STATUSES = [
  ['ACTIVE',   'Active'],
  ['DRAFT',    'Draft'],
  ['ARCHIVED', 'Archived'],
];

export default function EditEmergencyPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/emergency-plans/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError('');
    const form = e.currentTarget;
    const get = (n: string) =>
      (form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    const payload = {
      planName:         get('planName'),
      planType:         get('planType'),
      version:          get('version') || '1.0',
      effectiveDate:    get('effectiveDate'),
      nextReviewDate:   get('nextReviewDate'),
      lastReviewedDate: get('lastReviewedDate') || null,
      approvedBy:       get('approvedBy') || null,
      status:           get('status'),
      documentUrl:      get('documentUrl') || null,
      summary:          get('summary') || null,
    };
    const res = await fetch(`/api/emergency-plans/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/emergency/plans/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/emergency/plans/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" /> Edit Emergency Plan
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name <span className="text-red-500">*</span></label>
          <input name="planName" required defaultValue={data.planName ?? ''} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Annual Emergency Operations Plan 2026" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Plan Type <span className="text-red-500">*</span></label>
            <select name="planType" required defaultValue={data.planType ?? ''} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">- Select type -</option>
              {PLAN_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select name="status" defaultValue={data.status ?? 'ACTIVE'} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
            <input name="version" defaultValue={data.version ?? '1.0'} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="1.0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Approved By</label>
            <input name="approvedBy" defaultValue={data.approvedBy ?? ''} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Name or role" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Effective Date <span className="text-red-500">*</span></label>
            <input type="date" name="effectiveDate" required defaultValue={data.effectiveDate?.split('T')[0] ?? ''} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Next Review Date <span className="text-red-500">*</span></label>
            <input type="date" name="nextReviewDate" required defaultValue={data.nextReviewDate?.split('T')[0] ?? ''} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Reviewed Date</label>
          <input type="date" name="lastReviewedDate" defaultValue={data.lastReviewedDate?.split('T')[0] ?? ''} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Document URL</label>
          <input type="url" name="documentUrl" defaultValue={data.documentUrl ?? ''} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Summary / Scope</label>
          <textarea name="summary" rows={3} defaultValue={data.summary ?? ''} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="Brief description of plan scope and purpose..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <a href={`/emergency/plans/${id}`} className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
