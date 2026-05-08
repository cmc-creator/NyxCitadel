'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldOff } from 'lucide-react';

const RS_TYPES = [
  'PHYSICAL_RESTRAINT', 'MECHANICAL_RESTRAINT', 'CHEMICAL_RESTRAINT', 'SECLUSION', 'PHYSICAL_HOLD',
];

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function NewRestraintEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      eventNumber:          (form.elements.namedItem('eventNumber') as HTMLInputElement).value,
      patientMrn:           (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      patientInitials:      (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      unit:                 (form.elements.namedItem('unit') as HTMLInputElement).value,
      eventDate:            (form.elements.namedItem('eventDate') as HTMLInputElement).value,
      eventTime:            (form.elements.namedItem('eventTime') as HTMLInputElement).value,
      rsType:               (form.elements.namedItem('rsType') as HTMLSelectElement).value,
      orderingProvider:     (form.elements.namedItem('orderingProvider') as HTMLInputElement).value,
      orderDateTime:        (form.elements.namedItem('orderDateTime') as HTMLInputElement).value,
      initiatedBy:          (form.elements.namedItem('initiatedBy') as HTMLInputElement).value,
      clinicalJustification:(form.elements.namedItem('clinicalJustification') as HTMLTextAreaElement).value,
      behaviors:            (form.elements.namedItem('behaviors') as HTMLTextAreaElement).value,
      lessRestrictiveTried: (form.elements.namedItem('lessRestrictiveTried') as HTMLTextAreaElement).value,
      monitoringLogs:       [],
    };

    const res = await fetch('/api/restraint-seclusion', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/restraint-seclusion'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save event.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/restraint-seclusion" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Restraint / Seclusion
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldOff className="w-6 h-6 text-rose-600" />
          Log Restraint / Seclusion Event
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitoring logs are added after creation on the event detail page.</p>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Event Identification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Event Number *</label>
              <input name="eventNumber" type="text" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Restraint / Seclusion Type *</label>
              <select name="rsType" required className="form-input w-full">
                <option value="">Select…</option>
                {RS_TYPES.map(t => <option key={t} value={t}>{formatLabel(t)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Patient Initials *</label>
              <input name="patientInitials" type="text" required maxLength={6} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">MRN</label>
              <input name="patientMrn" type="text" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Unit *</label>
              <input name="unit" type="text" required className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Event Date *</label>
              <input name="eventDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Event Time *</label>
              <input name="eventTime" type="time" required className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Order &amp; Staff</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Ordering Provider *</label>
              <input name="orderingProvider" type="text" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Order DateTime *</label>
              <input name="orderDateTime" type="datetime-local" required className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Initiated By *</label>
            <input name="initiatedBy" type="text" required className="form-input w-full" placeholder="Staff name / role" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Clinical Documentation</h2>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Behaviors Warranting Use *</label>
            <textarea name="behaviors" rows={2} required className="form-input w-full" placeholder="Describe observed behaviors…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Less Restrictive Interventions Tried *</label>
            <textarea name="lessRestrictiveTried" rows={2} required className="form-input w-full" placeholder="Verbal de-escalation, reorientation, etc." />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Clinical Justification *</label>
            <textarea name="clinicalJustification" rows={3} required className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/restraint-seclusion" className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted/20">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Log Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
