'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList } from 'lucide-react';

const ROUND_TYPES = [
  'LIFE_SAFETY_GENERAL', 'LIGATURE_RISK', 'FIRE_SAFETY',
  'INFECTION_CONTROL', 'SECURITY', 'UTILITIES',
  'PATIENT_ENVIRONMENT', 'EOC_COMMITTEE',
];

export default function NewEocRoundPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const participantIds = (form.elements.namedItem('participantIds') as HTMLTextAreaElement).value
      .split('\n').map(s => s.trim()).filter(Boolean);
    const areasInspected = (form.elements.namedItem('areasInspected') as HTMLTextAreaElement).value
      .split('\n').map(s => s.trim()).filter(Boolean);
    const data = {
      roundNumber:    (form.elements.namedItem('roundNumber') as HTMLInputElement).value,
      roundType:      (form.elements.namedItem('roundType') as HTMLSelectElement).value,
      conductedDate:  (form.elements.namedItem('conductedDate') as HTMLInputElement).value,
      conductedBy:    (form.elements.namedItem('conductedBy') as HTMLInputElement).value,
      participantIds,
      areasInspected,
      summary:        (form.elements.namedItem('summary') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/eoc/rounds', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/eoc/rounds'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save round.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/eoc/rounds" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to EOC Rounds
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          New EOC Inspection Round
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Round Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Round Number *</label>
              <input name="roundNumber" required className="form-input w-full" placeholder="EOC-ROUND-2026-Q1-01" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Round Type *</label>
              <select name="roundType" required className="form-input w-full">
                <option value="">Select…</option>
                {ROUND_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date Conducted *</label>
              <input name="conductedDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Lead Inspector *</label>
              <input name="conductedBy" required className="form-input w-full" placeholder="Name / title" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Additional Participants (one per line)</label>
            <textarea name="participantIds" rows={3} className="form-input w-full" placeholder="Jane Smith, RN&#10;Tom Jones, Safety Officer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Areas Inspected (one per line)</label>
            <textarea name="areasInspected" rows={3} className="form-input w-full" placeholder="Unit 1A&#10;Unit 2B&#10;Pharmacy&#10;Kitchen" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Summary / Overall Findings</label>
            <textarea name="summary" rows={3} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/eoc/rounds" className="px-4 py-2 text-sm rounded-lg border border-border text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Create Round'}
          </button>
        </div>
      </form>
    </div>
  );
}
