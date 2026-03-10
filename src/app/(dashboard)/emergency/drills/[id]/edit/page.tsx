'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditDrillPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/drills/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError('');
    const form = e.currentTarget;
    const participantRaw = (form.elements.namedItem('participantCount') as HTMLInputElement).value;
    const payload = {
      drillName:        (form.elements.namedItem('drillName') as HTMLInputElement).value,
      drillType:        (form.elements.namedItem('drillType') as HTMLSelectElement).value,
      scheduledDate:    (form.elements.namedItem('scheduledDate') as HTMLInputElement).value,
      location:         (form.elements.namedItem('location') as HTMLInputElement).value,
      scenario:         (form.elements.namedItem('scenario') as HTMLTextAreaElement).value,
      objectives:       (form.elements.namedItem('objectives') as HTMLTextAreaElement).value,
      participantCount: participantRaw ? Number(participantRaw) : undefined,
      observer:         (form.elements.namedItem('observer') as HTMLInputElement).value,
    };
    const res = await fetch(`/api/drills/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/emergency/drills/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/emergency/drills/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Edit Emergency Drill
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Drill Name *</label>
            <input name="drillName" required defaultValue={data.drillName ?? ''} className="form-input w-full" placeholder="e.g. Q1 Fire Drill – Day Shift – Unit 3B" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Drill Type *</label>
              <select name="drillType" required defaultValue={data.drillType ?? ''} className="form-input w-full">
                <option value="">Select type…</option>
                {DRILL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Scheduled Date *</label>
              <input name="scheduledDate" type="date" required defaultValue={data.scheduledDate?.split('T')[0] ?? ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location / Units</label>
            <input name="location" defaultValue={data.location ?? ''} className="form-input w-full" placeholder="e.g. All units, Unit 3B" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Scenario Description</label>
            <textarea name="scenario" rows={3} defaultValue={data.scenario ?? ''} className="form-input w-full"
              placeholder="Describe the emergency scenario that will be simulated…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Learning Objectives</label>
            <textarea name="objectives" rows={3} defaultValue={data.objectives ?? ''} className="form-input w-full"
              placeholder="What competencies will this drill test?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expected Participant Count</label>
              <input name="participantCount" type="number" min="1" defaultValue={data.participantCount ?? ''} className="form-input w-full" placeholder="e.g. 24" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Observer / Evaluator</label>
              <input name="observer" defaultValue={data.observer ?? ''} className="form-input w-full" placeholder="Name and title" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/emergency/drills/${id}`} className="px-4 py-2 text-sm text-slate-600">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
