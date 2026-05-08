'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Scale, ArrowLeft } from 'lucide-react';

const ALLEGATION_CATEGORIES = [
  'Quality of Care',
  'Patient Rights',
  'Abuse / Neglect',
  'Discharge Planning',
  'Medication Management',
  'Restraint / Seclusion',
  'Infection Control',
  'Staffing',
  'Environment of Care',
  'Grievance Process',
  'Privacy / HIPAA',
  'Informed Consent',
  'Transfer / Referral',
  'Other',
];

export default function EditQocPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    dateReceived:          '',
    complainantType:       'ANONYMOUS',
    cmsComplaintNumber:    '',
    stateReferenceNumber:  '',
    allegationSummary:     '',
    allegationCategories:  [] as string[],
    loiReceivedDate:       '',
    investigationType:     'STANDARD',
    investigatorName:      '',
    responseSubmittedDate: '',
    surveyDate:            '',
    assignedTo:            '',
    notes:                 '',
  });

  useEffect(() => {
    fetch(`/api/qoc-complaints/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setForm({
          dateReceived:          d.dateReceived ? d.dateReceived.split('T')[0] : '',
          complainantType:       d.complainantType ?? 'ANONYMOUS',
          cmsComplaintNumber:    d.cmsComplaintNumber ?? '',
          stateReferenceNumber:  d.stateReferenceNumber ?? '',
          allegationSummary:     d.allegationSummary ?? '',
          allegationCategories:  d.allegationCategories ?? [],
          loiReceivedDate:       d.loiReceivedDate ? d.loiReceivedDate.split('T')[0] : '',
          investigationType:     d.investigationType ?? 'STANDARD',
          investigatorName:      d.investigatorName ?? '',
          responseSubmittedDate: d.responseSubmittedDate ? d.responseSubmittedDate.split('T')[0] : '',
          surveyDate:            d.surveyDate ? d.surveyDate.split('T')[0] : '',
          assignedTo:            d.assignedTo ?? '',
          notes:                 d.notes ?? '',
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
  }, [id]);

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      allegationCategories: f.allegationCategories.includes(cat)
        ? f.allegationCategories.filter(c => c !== cat)
        : [...f.allegationCategories, cat],
    }));
  };

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }));

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/qoc-complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          loiReceivedDate:       form.loiReceivedDate || null,
          responseSubmittedDate: form.responseSubmittedDate || null,
          surveyDate:            form.surveyDate || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Save failed');
      }
      router.push(`/trackers/qoc/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <a href={`/trackers/qoc/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground/80 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Scale className="w-6 h-6 text-purple-600" />
          Edit QOC / LOI Complaint
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="space-y-6">
        {/* Complaint info */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Complaint Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Date Received <span className="text-red-500">*</span></label>
              <input type="date" required value={form.dateReceived} onChange={set('dateReceived')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Complainant Type <span className="text-red-500">*</span></label>
              <select value={form.complainantType} onChange={set('complainantType')} className="input-field w-full">
                <option value="ANONYMOUS">Anonymous</option>
                <option value="PATIENT">Patient</option>
                <option value="FAMILY_MEMBER">Family Member</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="ADVOCACY_ORG">Advocacy Organization</option>
                <option value="OTHER_PROVIDER">Other Provider</option>
                <option value="CMS_INITIATED">CMS Initiated</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">CMS Complaint Number</label>
              <input type="text" value={form.cmsComplaintNumber} onChange={set('cmsComplaintNumber')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">State / ADHS Reference #</label>
              <input type="text" value={form.stateReferenceNumber} onChange={set('stateReferenceNumber')}
                className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Allegation Summary <span className="text-red-500">*</span></label>
            <textarea required rows={3} value={form.allegationSummary} onChange={set('allegationSummary')}
              className="input-field w-full resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">Allegation Categories (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {ALLEGATION_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.allegationCategories.includes(cat)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-muted-foreground border-border hover:border-purple-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOI Information */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">Letter of Investigation (LOI)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">LOI Received Date</label>
              <input type="date" value={form.loiReceivedDate} onChange={set('loiReceivedDate')}
                className="input-field w-full" />
              <p className="text-xs text-muted-foreground/70 mt-1">Response due 10 business days after receipt</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Investigation Type</label>
              <select value={form.investigationType} onChange={set('investigationType')} className="input-field w-full">
                <option value="STANDARD">Standard</option>
                <option value="IMMEDIATE_JEOPARDY">Immediate Jeopardy</option>
                <option value="EXPANDED">Expanded</option>
                <option value="REVISIT">Revisit</option>
                <option value="FOLLOW_UP">Follow-Up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">State Investigator Name</label>
              <input type="text" value={form.investigatorName} onChange={set('investigatorName')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Response Submitted Date</label>
              <input type="date" value={form.responseSubmittedDate} onChange={set('responseSubmittedDate')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Survey / On-Site Date</label>
              <input type="date" value={form.surveyDate} onChange={set('surveyDate')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Assigned To</label>
              <input type="text" value={form.assignedTo} onChange={set('assignedTo')}
                className="input-field w-full" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-5">
          <label className="block text-sm font-medium text-foreground/80 mb-1">Internal Notes</label>
          <textarea rows={3} value={form.notes} onChange={set('notes')}
            className="input-field w-full resize-none" />
        </div>

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <a href={`/trackers/qoc/${id}`} className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg border border-border hover:border-slate-400 transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
