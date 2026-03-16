'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';

const COMMITTEE_TYPES = [
  'GOVERNING_BODY', 'MEDICAL_EXECUTIVE', 'QUALITY_PATIENT_SAFETY', 'IC',
  'PHARMACY_THERAPEUTICS', 'PEER_REVIEW', 'EOC', 'EMERGENCY_PREP',
  'ETHICS', 'CREDENTIALS', 'FINANCE', 'COMPLIANCE',
];

function formatCommitteeType(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function EditCommitteeMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [quorumMet, setQuorumMet] = useState(false);

  useEffect(() => {
    fetch(`/api/governance/committees/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setQuorumMet(!!d.quorumMet);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;

    const parseLines = (name: string) =>
      (form.elements.namedItem(name) as HTMLTextAreaElement).value
        .split('\n').map((s: string) => s.trim()).filter(Boolean);

    const payload = {
      committeeType: (form.elements.namedItem('committeeType') as HTMLSelectElement).value,
      meetingDate:   (form.elements.namedItem('meetingDate') as HTMLInputElement).value,
      quorumMet,
      chair:         (form.elements.namedItem('chair') as HTMLInputElement).value,
      attendees:     parseLines('attendees'),
      absentees:     parseLines('absentees'),
      agendaItems:   parseLines('agendaItems'),
      notes:         (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/governance/committees/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/governance/committees/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/governance/committees/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Edit Committee Meeting
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Enter one item per line for attendees, absentees, and agenda items.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Meeting Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Committee *</label>
              <select name="committeeType" required className="form-input w-full" defaultValue={data.committeeType ?? ''}>
                <option value="">Select committee…</option>
                {COMMITTEE_TYPES.map(t => <option key={t} value={t}>{formatCommitteeType(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Meeting Date *</label>
              <input name="meetingDate" type="date" required className="form-input w-full" defaultValue={data.meetingDate?.split('T')[0] ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Chair *</label>
            <input name="chair" type="text" required className="form-input w-full" defaultValue={data.chair ?? ''} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="quorumMet" type="checkbox" className="rounded"
              checked={quorumMet} onChange={e => setQuorumMet(e.target.checked)} />
            Quorum Met
          </label>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Attendance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Attendees (one per line)</label>
              <textarea name="attendees" rows={4} className="form-input w-full"
                defaultValue={Array.isArray(data.attendees) ? data.attendees.join('\n') : (data.attendees ?? '')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Absentees (one per line)</label>
              <textarea name="absentees" rows={4} className="form-input w-full"
                defaultValue={Array.isArray(data.absentees) ? data.absentees.join('\n') : (data.absentees ?? '')} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Agenda Items (one per line) *</label>
          <textarea name="agendaItems" rows={5} required className="form-input w-full"
            defaultValue={Array.isArray(data.agendaItems) ? data.agendaItems.join('\n') : (data.agendaItems ?? '')} />
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes / Minutes Summary</label>
          <textarea name="notes" rows={3} className="form-input w-full" defaultValue={data.notes ?? ''} />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/governance/committees/${id}`} className="px-4 py-2 text-sm text-slate-600">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
