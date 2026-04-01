'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, ArrowLeft } from 'lucide-react';

const DRILL_TYPES: { value: string; label: string }[] = [
  { value: 'FIRE_EVACUATION',       label: 'Fire Evacuation' },
  { value: 'CODE_RED',              label: 'Code RED (Fire)' },
  { value: 'CODE_BLUE',             label: 'Code BLUE (Medical Emergency)' },
  { value: 'CODE_GRAY',             label: 'Code GRAY (Combative Patient)' },
  { value: 'CODE_SILVER',           label: 'Code SILVER (Active Shooter/Weapon)' },
  { value: 'CODE_ORANGE',           label: 'Code ORANGE (Hazmat)' },
  { value: 'CODE_PURPLE',           label: 'Code PURPLE (Child Abduction)' },
  { value: 'CODE_BLACK',            label: 'Code BLACK (Bomb Threat)' },
  { value: 'UTILITY_FAILURE',       label: 'Utility Failure' },
  { value: 'MASS_CASUALTY',         label: 'Mass Casualty Incident' },
  { value: 'IT_DISASTER_RECOVERY',  label: 'IT Disaster Recovery' },
  { value: 'COMMUNICATION_FAILURE', label: 'Communication Failure' },
  { value: 'SHELTER_IN_PLACE',      label: 'Shelter in Place' },
  { value: 'DECONTAMINATION',       label: 'Decontamination' },
  { value: 'TABLETOP',              label: 'Tabletop Exercise' },
  { value: 'FULL_SCALE',            label: 'Full-Scale Exercise' },
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
      drillName:        (form.elements.namedItem('drillName') as HTMLInputElement).value,
      drillType:        (form.elements.namedItem('drillType') as HTMLSelectElement).value,
      scheduledDate:    (form.elements.namedItem('scheduledDate') as HTMLInputElement).value,
      location:         (form.elements.namedItem('location') as HTMLInputElement).value,
      scenario:         (form.elements.namedItem('scenario') as HTMLTextAreaElement).value,
      objectives:       (form.elements.namedItem('objectives') as HTMLTextAreaElement).value,
      participantCount: (form.elements.namedItem('participantCount') as HTMLInputElement).value
                          ? Number((form.elements.namedItem('participantCount') as HTMLInputElement).value)
                          : undefined,
      observer:         (form.elements.namedItem('observer') as HTMLInputElement).value,
    };

    const res = await fetch('/api/drills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const created = await res.json();
      router.push(`/emergency/drills/${created.id}`);
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
        <a href="/emergency/drills" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
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
                {DRILL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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
            <label className="block text-xs font-medium text-slate-600 mb-1">Scenario Description</label>
            <textarea name="scenario" rows={3} className="form-input w-full"
              placeholder="Describe the emergency scenario that will be simulated…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Learning Objectives</label>
            <textarea name="objectives" rows={3} className="form-input w-full"
              placeholder="What competencies will this drill test?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expected Participant Count</label>
              <input name="participantCount" type="number" min="1" className="form-input w-full" placeholder="e.g. 24" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Observer / Evaluator</label>
              <input name="observer" className="form-input w-full" placeholder="Name and title" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/emergency/drills" className="text-sm text-slate-500 hover:text-slate-700">Cancel</a>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Schedule Drill'}
          </button>
        </div>
      </form>
    </div>
  );
}
