'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';

const REGULATORY_BODIES = [
  'JOINT_COMMISSION', 'CMS', 'AZ_ADHS', 'AZ_BOMEX', 'AZ_BON',
  'DEA', 'OSHA', 'NFPA', 'EPA', 'INTERNAL', 'OTHER',
];

const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const FREQUENCY_VALUES = ['ONCE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'];

export default function EditCalendarEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/calendar/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const payload = {
      title:          (form.elements.namedItem('title') as HTMLInputElement).value,
      description:    (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      dueDate:        (form.elements.namedItem('dueDate') as HTMLInputElement).value,
      category:       (form.elements.namedItem('category') as HTMLInputElement).value,
      regulatoryBody: (form.elements.namedItem('regulatoryBody') as HTMLSelectElement).value,
      priority:       (form.elements.namedItem('priority') as HTMLSelectElement).value,
      frequency:      (form.elements.namedItem('frequency') as HTMLSelectElement).value,
      assignedTo:     (form.elements.namedItem('assignedTo') as HTMLInputElement).value,
      notes:          (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
    };

    const res = await fetch(`/api/calendar/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/calendar/${id}`);
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to update event.');
      setSaving(false);
    }
  }

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Not found.'}</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/calendar/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Event
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Edit Compliance Event
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Event Title *</label>
            <input name="title" required defaultValue={data.title ?? ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea name="description" rows={3} defaultValue={data.description ?? ''} className="form-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Due Date *</label>
              <input name="dueDate" type="date" required defaultValue={data.dueDate?.split('T')[0] ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select name="priority" defaultValue={data.priority ?? 'MEDIUM'} className="form-input w-full">
                {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Regulatory Body</label>
              <select name="regulatoryBody" defaultValue={data.regulatoryBody ?? ''} className="form-input w-full">
                <option value="">Select…</option>
                {REGULATORY_BODIES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
              <select name="frequency" defaultValue={data.frequency ?? 'ONCE'} className="form-input w-full">
                {FREQUENCY_VALUES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category Tag</label>
              <input name="category" defaultValue={data.category ?? ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assigned To</label>
              <input name="assignedTo" defaultValue={data.assignedTo ?? ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} defaultValue={data.notes ?? ''} className="form-input w-full" />
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href={`/calendar/${id}`} className="text-sm text-slate-500 hover:text-slate-700">Cancel</a>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
