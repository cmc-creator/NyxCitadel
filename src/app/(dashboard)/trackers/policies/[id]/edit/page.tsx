'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  ['ADMINISTRATIVE', 'Administrative'],
  ['CLINICAL', 'Clinical'],
  ['EMERGENCY_MANAGEMENT', 'Emergency Management'],
  ['ENVIRONMENT_OF_CARE', 'Environment of Care'],
  ['HUMAN_RESOURCES', 'Human Resources'],
  ['INFECTION_CONTROL', 'Infection Control'],
  ['INFORMATION_MANAGEMENT', 'Information Management'],
  ['LEADERSHIP', 'Leadership'],
  ['LIFE_SAFETY', 'Life Safety'],
  ['MEDICATION_MANAGEMENT', 'Medication Management'],
  ['PATIENT_RIGHTS', 'Patient Rights'],
  ['PERFORMANCE_IMPROVEMENT', 'Performance Improvement'],
  ['PRIVACY_SECURITY', 'Privacy & Security'],
  ['OTHER', 'Other'],
];

const REVIEW_FREQUENCIES = [
  ['ANNUAL', 'Annual'],
  ['BIENNIAL', 'Biennial (every 2 years)'],
  ['SEMI_ANNUAL', 'Semi-Annual'],
  ['QUARTERLY', 'Quarterly'],
  ['AS_NEEDED', 'As Needed'],
];

const REGULATORY_BODIES = [
  'JOINT_COMMISSION', 'CMS', 'AZ_ADHS', 'AZ_BON', 'AZ_BPPE',
  'DEA', 'OSHA', 'HIPAA', 'SAMHSA', 'INTERNAL', 'OTHER',
];

const REG_LABELS: Record<string, string> = {
  JOINT_COMMISSION: 'The Joint Commission',
  CMS: 'CMS', AZ_ADHS: 'AZ ADHS', AZ_BON: 'AZ Board of Nursing',
  AZ_BPPE: 'AZ Board of Pharmacy', DEA: 'DEA', OSHA: 'OSHA',
  HIPAA: 'HIPAA', SAMHSA: 'SAMHSA', INTERNAL: 'Internal', OTHER: 'Other',
};

export default function EditPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedBodies, setSelectedBodies] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/policy-docs/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setSelectedBodies(d.regulatoryBodies ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
  }, [id]);

  function toggleBody(v: string) {
    setSelectedBodies(prev => prev.includes(v) ? prev.filter(b => b !== v) : [...prev, v]);
  }

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
      category:        get('category'),
      version:         get('version') || '1.0',
      effectiveDate:   get('effectiveDate'),
      nextReviewDate:  get('nextReviewDate'),
      reviewFrequency: get('reviewFrequency'),
      owner:           get('owner') || null,
      standardRef:     get('standardRef') || null,
      description:     get('description') || null,
      regulatoryBodies: selectedBodies,
    };

    const res = await fetch(`/api/policy-docs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/trackers/policies/${id}`);
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
        <a href={`/trackers/policies/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          Edit Policy / Procedure
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">

        {/* Core Info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Policy Information</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Policy Title *</label>
            <input name="title" required defaultValue={data.title} className="form-input w-full" />
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Version</label>
              <input name="version" defaultValue={data.version ?? '1.0'} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Owner / Responsible Department</label>
            <input name="owner" defaultValue={data.owner ?? ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Standard / Regulatory Reference</label>
            <input name="standardRef" defaultValue={data.standardRef ?? ''} className="form-input w-full" />
          </div>
        </div>

        {/* Dates */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Review Schedule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Effective Date *</label>
              <input type="date" name="effectiveDate" required defaultValue={data.effectiveDate ? data.effectiveDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Review Date *</label>
              <input type="date" name="nextReviewDate" required defaultValue={data.nextReviewDate ? data.nextReviewDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Review Frequency</label>
            <select name="reviewFrequency" defaultValue={data.reviewFrequency ?? 'ANNUAL'} className="form-input w-full">
              {REVIEW_FREQUENCIES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Regulatory Bodies */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Applicable Regulatory Bodies</h2>
          <div className="flex flex-wrap gap-2">
            {REGULATORY_BODIES.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => toggleBody(v)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedBodies.includes(v)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                }`}
              >
                {REG_LABELS[v] ?? v}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Summary / Description <span className="font-normal text-slate-400">(optional)</span></h2>
          <textarea name="description" rows={3} defaultValue={data.description ?? ''} className="form-input w-full resize-none" />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/trackers/policies/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
