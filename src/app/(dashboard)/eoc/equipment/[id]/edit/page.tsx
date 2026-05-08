'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Wrench } from 'lucide-react';

const CATEGORIES = [
  'FIRE_SUPPRESSION', 'FIRE_ALARM', 'EMERGENCY_LIGHTING', 'GENERATOR',
  'HVAC', 'MEDICAL_GAS', 'ELEVATOR', 'SECURITY_SYSTEM', 'PLUMBING',
  'ELECTRICAL', 'MEDICAL_EQUIPMENT', 'NURSE_CALL', 'DOOR_HARDWARE',
];
const FREQUENCIES = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'AS_NEEDED'];

export default function EditEquipmentPmPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/eoc/equipment/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load equipment record.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const payload = {
      equipmentName:   (form.elements.namedItem('equipmentName') as HTMLInputElement).value,
      equipmentId:     (form.elements.namedItem('equipmentId') as HTMLInputElement).value || null,
      location:        (form.elements.namedItem('location') as HTMLInputElement).value,
      category:        (form.elements.namedItem('category') as HTMLSelectElement).value,
      frequency:       (form.elements.namedItem('frequency') as HTMLSelectElement).value,
      lastServiceDate: (form.elements.namedItem('lastServiceDate') as HTMLInputElement).value || null,
      nextServiceDate: (form.elements.namedItem('nextServiceDate') as HTMLInputElement).value,
      vendor:          (form.elements.namedItem('vendor') as HTMLInputElement).value || null,
      contactPhone:    (form.elements.namedItem('contactPhone') as HTMLInputElement).value || null,
      notes:           (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/eoc/equipment/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/eoc/equipment/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update equipment record.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/eoc/equipment/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wrench className="w-6 h-6 text-slate-600" />
          Edit Equipment PM Record
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Equipment Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Equipment Name *</label>
              <input name="equipmentName" required className="form-input w-full"
                defaultValue={data.equipmentName ?? ''}
                placeholder="e.g. Fire Suppression System - Kitchen" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Asset Tag / Serial #</label>
              <input name="equipmentId" className="form-input w-full"
                defaultValue={data.equipmentId ?? ''}
                placeholder="Optional identifier" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location *</label>
              <input name="location" required className="form-input w-full"
                defaultValue={data.location ?? ''}
                placeholder="Building / floor / room" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select name="category" required className="form-input w-full" defaultValue={data.category ?? ''}>
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Frequency *</label>
              <select name="frequency" required className="form-input w-full" defaultValue={data.frequency ?? ''}>
                {FREQUENCIES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last Service Date</label>
              <input name="lastServiceDate" type="date" className="form-input w-full"
                defaultValue={data.lastServiceDate?.split('T')[0] ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Service Date *</label>
              <input name="nextServiceDate" type="date" required className="form-input w-full"
                defaultValue={data.nextServiceDate?.split('T')[0] ?? ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Vendor</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vendor Name</label>
              <input name="vendor" className="form-input w-full" defaultValue={data.vendor ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contact Phone</label>
              <input name="contactPhone" type="tel" className="form-input w-full" defaultValue={data.contactPhone ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" defaultValue={data.notes ?? ''} />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/eoc/equipment/${id}`} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-accent/50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
