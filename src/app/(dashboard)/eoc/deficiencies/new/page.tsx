'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function NewEocDeficiencyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillRoundId = searchParams.get('roundId') ?? '';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
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

    const res = await fetch('/api/eoc/deficiencies', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/eoc/deficiencies'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save deficiency.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/eoc/deficiencies" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Deficiencies
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-orange-500" />
          Log EOC Deficiency
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Deficiency Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Deficiency Number *</label>
              <input name="defNumber" required className="form-input w-full" placeholder="DEF-2026-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Originating Round ID</label>
              <input name="roundId" defaultValue={prefillRoundId} className="form-input w-full" placeholder="Optional - link to round" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location *</label>
              <input name="location" required className="form-input w-full" placeholder="e.g. Unit 2A, Room 204" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
              <input name="unit" className="form-input w-full" placeholder="Unit designation" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
            <textarea name="description" required rows={4} className="form-input w-full" placeholder="Describe the deficiency in detail…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select name="category" required className="form-input w-full">
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Severity *</label>
              <select name="severity" required className="form-input w-full">
                <option value="">Select…</option>
                {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assigned To</label>
              <input name="assignedTo" className="form-input w-full" placeholder="Name / role" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
              <input name="dueDate" type="date" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/eoc/deficiencies" className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-accent/50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Log Deficiency'}
          </button>
        </div>
      </form>
    </div>
  );
}
