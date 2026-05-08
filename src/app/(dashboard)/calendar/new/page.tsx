'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';

const REGULATORY_BODIES = [
  'JOINT_COMMISSION', 'CMS', 'AZ_ADHS', 'AZ_BOMEX', 'AZ_BON',
  'DEA', 'OSHA', 'NFPA', 'EPA', 'INTERNAL', 'OTHER',
];

const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const FREQUENCY_VALUES = ['ONCE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'];

export default function NewCalendarEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
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

    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/calendar');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to create event.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/calendar" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Calendar
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-600" />
          Add Compliance Event
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Add a manual compliance event or deadline to the calendar.</p>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Event Title *</label>
            <input name="title" required className="form-input w-full" placeholder="e.g. Fire Drill Q1 – Day Shift" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea name="description" rows={3} className="form-input w-full"
              placeholder="Applicable standard, reference, or context" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date *</label>
              <input name="dueDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
              <select name="priority" className="form-input w-full" defaultValue="MEDIUM">
                {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Regulatory Body</label>
              <select name="regulatoryBody" className="form-input w-full">
                <option value="">Select…</option>
                {REGULATORY_BODIES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Frequency</label>
              <select name="frequency" className="form-input w-full" defaultValue="ONCE">
                {FREQUENCY_VALUES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category Tag</label>
              <input name="category" className="form-input w-full" placeholder="e.g. FIRE_DRILL, EM_MEETING" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Assigned To</label>
              <input name="assignedTo" className="form-input w-full" placeholder="Name or department" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" placeholder="Additional notes or reminders" />
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/calendar" className="text-sm text-muted-foreground hover:text-foreground/80">Cancel</a>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Add to Calendar'}
          </button>
        </div>
      </form>
    </div>
  );
}
