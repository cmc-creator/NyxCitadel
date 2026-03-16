'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertOctagon } from 'lucide-react';

const CATEGORIES = [
  'LIFE_SAFETY', 'LIGATURE_RISK', 'FIRE_SAFETY', 'SECURITY', 'UTILITIES',
  'EQUIPMENT_FAILURE', 'CLEANLINESS', 'INFECTION_CONTROL', 'PATIENT_SAFETY', 'STRUCTURAL', 'OTHER',
];
const SEVERITIES = [
  { value: 'IMMEDIATE_JEOPARDY', label: 'Immediate Jeopardy - correct before patient occupancy' },
  { value: 'HIGH', label: 'High - correct within 24 hours' },
  { value: 'MEDIUM', label: 'Medium - correct within 30 days' },
  { value: 'LOW', label: 'Low - correct within 90 days' },
  { value: 'OBSERVATION', label: 'Observation - monitor only' },
];

export default function EditEocDeficiencyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/eoc/deficiencies/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load deficiency.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const payload = {
      defNumber:   (form.elements.namedItem('defNumber') as HTMLInputElement).value,
      roundId:     (form.elements.namedItem('roundId') as HTMLInputElement).value || null,
      location:    (form.elements.namedItem('location') as HTMLInputElement).value,
      unit:        (form.elements.namedItem('unit') as HTMLInputElement).value || null,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      category:    (form.elements.namedItem('category') as HTMLSelectElement).value,
      severity:    (form.elements.namedItem('severity') as HTMLSelectElement).value,
      assignedTo:  (form.elements.namedItem('assignedTo') as HTMLInputElement).value || null,
      dueDate:     (form.elements.namedItem('dueDate') as HTMLInputElement).value || null,
      notes:       (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/eoc/deficiencies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/eoc/deficiencies/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update deficiency.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/eoc/deficiencies/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-orange-500" />
          Edit EOC Deficiency
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Deficiency Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Deficiency Number *</label>
              <input name="defNumber" required className="form-input w-full" defaultValue={data.defNumber ?? ''} placeholder="DEF-2026-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Originating Round ID</label>
              <input name="roundId" className="form-input w-full" defaultValue={data.roundId ?? ''} placeholder="Optional - link to round" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location *</label>
              <input name="location" required className="form-input w-full" defaultValue={data.location ?? ''} placeholder="e.g. Unit 2A, Room 204" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
              <input name="unit" className="form-input w-full" defaultValue={data.unit ?? ''} placeholder="Unit designation" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
            <textarea name="description" required rows={4} className="form-input w-full"
              defaultValue={data.description ?? ''}
              placeholder="Describe the deficiency in detail…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select name="category" required className="form-input w-full" defaultValue={data.category ?? ''}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Severity *</label>
              <select name="severity" required className="form-input w-full" defaultValue={data.severity ?? ''}>
                <option value="">Select…</option>
                {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assigned To</label>
              <input name="assignedTo" className="form-input w-full" defaultValue={data.assignedTo ?? ''} placeholder="Name / role" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
              <input name="dueDate" type="date" className="form-input w-full"
                defaultValue={data.dueDate?.split('T')[0] ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" defaultValue={data.notes ?? ''} />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/eoc/deficiencies/${id}`} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
