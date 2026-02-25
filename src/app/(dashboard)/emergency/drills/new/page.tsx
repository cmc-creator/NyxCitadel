'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, ArrowLeft } from 'lucide-react';

const DRILL_TYPES = [
  'FIRE_EVACUATION', 'CODE_GREY', 'CODE_SILVER', 'CODE_ORANGE',
  'LOCKDOWN', 'MASS_CASUALTY', 'HAZMAT', 'UTILITY_FAILURE',
  'ELOPEMENT', 'TABLETOP_EXERCISE', 'FUNCTIONAL_EXERCISE', 'FULL_SCALE',
];
export default function NewDrillPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      drillName:    (form.elements.namedItem('drillName') as HTMLInputElement).value,
      drillType:    (form.elements.namedItem('drillType') as HTMLSelectElement).value,
      scheduledDate:(form.elements.namedItem('scheduledDate') as HTMLInputElement).value,
      location:     (form.elements.namedItem('location') as HTMLInputElement).value,
      objectives:   (form.elements.namedItem('objectives') as HTMLTextAreaElement).value,
    };

    const res = await fetch('/api/drills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/emergency/drills');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to schedule drill.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/emergency/drills" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Drills
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Schedule Emergency Drill
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          JC requires 2 fire drills per shift per year (8 total), 1 tabletop, and 1 functional exercise annually.
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Drill Name *</label>
            <input name="drillName" required className="form-input w-full" placeholder="e.g. Q1 Fire Drill – Day Shift – Unit 3B" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Drill Type *</label>
              <select name="drillType" required className="form-input w-full">
                <option value="">Select type…</option>
                {DRILL_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Scheduled Date *</label>
              <input name="scheduledDate" type="date" required className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location / Units</label>
            <input name="location" className="form-input w-full" placeholder="e.g. All units, Unit 3B" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Objectives / Scenario Notes</label>
            <textarea name="objectives" rows={4} className="form-input w-full"
              placeholder="What competencies will this drill test? Describe the scenario or objectives…" />
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/emergency/drills" className="text-sm text-slate-500 hover:text-slate-700">Cancel</a>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Schedule Drill'}
          </button>
        </div>
      </form>
    </div>
  );
}
