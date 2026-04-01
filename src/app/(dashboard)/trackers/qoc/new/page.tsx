'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

export default function NewQocPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    dateReceived:         '',
    complainantType:      'ANONYMOUS',
    cmsComplaintNumber:   '',
    stateReferenceNumber: '',
    allegationSummary:    '',
    allegationCategories: [] as string[],
    loiReceivedDate:      '',
    investigationType:    'STANDARD',
    investigatorName:     '',
    responseSubmittedDate:'',
    surveyDate:           '',
    assignedTo:           '',
    notes:                '',
  });

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/qoc-complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          allegationCategories: form.allegationCategories,
          loiReceivedDate:      form.loiReceivedDate || null,
          responseSubmittedDate:form.responseSubmittedDate || null,
          surveyDate:           form.surveyDate || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Save failed');
      }
      router.push('/trackers/qoc');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/trackers/qoc" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to QOC Tracker
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-teal-600" />
          Log QOC / LOI Complaint
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          CMS 42 CFR 488 - Quality of Care complaint or Letter of Investigation received
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Complaint info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Complaint Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Received <span className="text-red-500">*</span></label>
              <input type="date" required value={form.dateReceived} onChange={set('dateReceived')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Complainant Type <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">CMS Complaint Number</label>
              <input type="text" placeholder="e.g. AZ-2026-XXXXX" value={form.cmsComplaintNumber} onChange={set('cmsComplaintNumber')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State / ADHS Reference #</label>
              <input type="text" placeholder="State tracking number" value={form.stateReferenceNumber} onChange={set('stateReferenceNumber')}
                className="input-field w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Allegation Summary <span className="text-red-500">*</span></label>
            <textarea required rows={3} value={form.allegationSummary} onChange={set('allegationSummary')}
              placeholder="Describe the allegations being investigated..."
              className="input-field w-full resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Allegation Categories (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {ALLEGATION_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.allegationCategories.includes(cat)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOI Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Letter of Investigation (LOI)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">LOI Received Date</label>
              <input type="date" value={form.loiReceivedDate} onChange={set('loiReceivedDate')}
                className="input-field w-full" />
              <p className="text-xs text-slate-400 mt-1">Response due 10 business days after receipt</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Investigation Type</label>
              <select value={form.investigationType} onChange={set('investigationType')} className="input-field w-full">
                <option value="STANDARD">Standard</option>
                <option value="IMMEDIATE_JEOPARDY">Immediate Jeopardy</option>
                <option value="EXPANDED">Expanded</option>
                <option value="REVISIT">Revisit</option>
                <option value="FOLLOW_UP">Follow-Up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State Investigator Name</label>
              <input type="text" value={form.investigatorName} onChange={set('investigatorName')}
                placeholder="Name of assigned investigator" className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Response Submitted Date</label>
              <input type="date" value={form.responseSubmittedDate} onChange={set('responseSubmittedDate')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Survey / On-Site Date</label>
              <input type="date" value={form.surveyDate} onChange={set('surveyDate')}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
              <input type="text" value={form.assignedTo} onChange={set('assignedTo')}
                placeholder="Staff member responsible" className="input-field w-full" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
          <textarea rows={3} value={form.notes} onChange={set('notes')}
            placeholder="Additional internal notes..."
            className="input-field w-full resize-none" />
        </div>

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Log Complaint'}
          </button>
          <Link href="/trackers/qoc" className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 rounded-lg border border-slate-300 hover:border-slate-400 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
