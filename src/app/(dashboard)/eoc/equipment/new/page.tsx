'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wrench } from 'lucide-react';

const CATEGORIES = [
  'FIRE_SUPPRESSION', 'FIRE_ALARM', 'EMERGENCY_LIGHTING', 'GENERATOR',
  'HVAC', 'MEDICAL_GAS', 'ELEVATOR', 'SECURITY_SYSTEM', 'PLUMBING',
  'ELECTRICAL', 'MEDICAL_EQUIPMENT', 'NURSE_CALL', 'DOOR_HARDWARE',
];
const FREQUENCIES = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'AS_NEEDED'];

export default function NewEquipmentPmPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      equipmentName:  (form.elements.namedItem('equipmentName') as HTMLInputElement).value,
      equipmentId:    (form.elements.namedItem('equipmentId') as HTMLInputElement).value || null,
      location:       (form.elements.namedItem('location') as HTMLInputElement).value,
      category:       (form.elements.namedItem('category') as HTMLSelectElement).value,
      frequency:      (form.elements.namedItem('frequency') as HTMLSelectElement).value,
      lastServiceDate:(form.elements.namedItem('lastServiceDate') as HTMLInputElement).value || null,
      nextServiceDate:(form.elements.namedItem('nextServiceDate') as HTMLInputElement).value,
      vendor:         (form.elements.namedItem('vendor') as HTMLInputElement).value || null,
      contactPhone:   (form.elements.namedItem('contactPhone') as HTMLInputElement).value || null,
      notes:          (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/eoc/equipment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/eoc/equipment'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save equipment PM.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/eoc/equipment" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Equipment PM
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wrench className="w-6 h-6 text-muted-foreground" />
          Add Equipment PM Record
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Equipment Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Equipment Name *</label>
              <input name="equipmentName" required className="form-input w-full" placeholder="e.g. Fire Suppression System - Kitchen" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Asset Tag / Serial #</label>
              <input name="equipmentId" className="form-input w-full" placeholder="Optional identifier" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Location *</label>
              <input name="location" required className="form-input w-full" placeholder="Building / floor / room" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category *</label>
              <select name="category" required className="form-input w-full">
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Maintenance Schedule</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Frequency *</label>
              <select name="frequency" required className="form-input w-full">
                {FREQUENCIES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Last Service Date</label>
              <input name="lastServiceDate" type="date" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Next Service Date *</label>
              <input name="nextServiceDate" type="date" required className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Vendor</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vendor Name</label>
              <input name="vendor" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Phone</label>
              <input name="contactPhone" type="tel" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/eoc/equipment" className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-accent/50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50">
            {saving ? 'Saving…' : 'Add Equipment'}
          </button>
        </div>
      </form>
    </div>
  );
}
