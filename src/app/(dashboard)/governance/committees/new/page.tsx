'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';

const COMMITTEE_TYPES = [
  'GOVERNING_BODY', 'MEDICAL_EXECUTIVE', 'QUALITY_PATIENT_SAFETY', 'IC',
  'PHARMACY_THERAPEUTICS', 'PEER_REVIEW', 'EOC', 'EMERGENCY_PREP',
  'ETHICS', 'CREDENTIALS', 'FINANCE', 'COMPLIANCE',
];

function formatCommitteeType(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function NewCommitteeMeetingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;

    const parseLines = (name: string) =>
      (form.elements.namedItem(name) as HTMLTextAreaElement).value
        .split('\n').map((s: string) => s.trim()).filter(Boolean);

    const data = {
      committeeType:  (form.elements.namedItem('committeeType') as HTMLSelectElement).value,
      meetingDate:    (form.elements.namedItem('meetingDate') as HTMLInputElement).value,
      quorumMet:      (form.elements.namedItem('quorumMet') as HTMLInputElement).checked,
      chair:          (form.elements.namedItem('chair') as HTMLInputElement).value,
      attendees:      parseLines('attendees'),
      absentees:      parseLines('absentees'),
      agendaItems:    parseLines('agendaItems'),
      notes:          (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
      actionItems:    [],
      reportReferences: [],
    };

    const res = await fetch('/api/governance/committees', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/governance/committees'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save meeting.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/governance/committees" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Committee Meetings
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-600" />
          Log Committee Meeting
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Enter one item per line for attendees, absentees, and agenda items.</p>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Meeting Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Committee *</label>
              <select name="committeeType" required className="form-input w-full">
                <option value="">Select committee…</option>
                {COMMITTEE_TYPES.map(t => <option key={t} value={t}>{formatCommitteeType(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Meeting Date *</label>
              <input name="meetingDate" type="date" required className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Chair *</label>
            <input name="chair" type="text" required className="form-input w-full" />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="quorumMet" type="checkbox" defaultChecked className="rounded" />
            Quorum Met
          </label>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Attendance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Attendees (one per line)</label>
              <textarea name="attendees" rows={4} className="form-input w-full" placeholder="Jane Smith, MD&#10;Bob Jones, RN&#10;…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Absentees (one per line)</label>
              <textarea name="absentees" rows={4} className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Agenda Items (one per line) *</label>
          <textarea name="agendaItems" rows={5} required className="form-input w-full" placeholder="1. Approval of prior minutes&#10;2. Quality metrics review&#10;…" />
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes / Minutes Summary</label>
          <textarea name="notes" rows={3} className="form-input w-full" />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/governance/committees" className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-accent/50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Meeting'}
          </button>
        </div>
      </form>
    </div>
  );
}
