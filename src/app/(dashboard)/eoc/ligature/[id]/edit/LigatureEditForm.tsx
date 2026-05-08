'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const RISK_LEVELS = ['IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW'] as const;
const STATUSES = ['OPEN', 'IN_MITIGATION', 'MITIGATED', 'RESOLVED', 'ACCEPTED_RISK'] as const;

interface LigatureItem {
  id: string;
  itemNumber: string;
  location: string;
  unit: string | null;
  itemDescription: string;
  riskLevel: string;
  status: string;
  identifiedDate: string;
  identifiedBy: string;
  mitigationPlan: string | null;
  targetDate: string | null;
  resolvedDate: string | null;
  resolvedBy: string | null;
  verifiedBy: string | null;
  notes: string | null;
}

function toDateInput(iso: string | null) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function LigatureEditForm({ item }: { item: LigatureItem }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const f = e.currentTarget;

    const data = {
      location:        (f.elements.namedItem('location')        as HTMLInputElement).value,
      unit:            (f.elements.namedItem('unit')            as HTMLInputElement).value || null,
      itemDescription: (f.elements.namedItem('itemDescription') as HTMLInputElement).value,
      riskLevel:       (f.elements.namedItem('riskLevel')       as HTMLSelectElement).value,
      status:          (f.elements.namedItem('status')          as HTMLSelectElement).value,
      identifiedDate:  (f.elements.namedItem('identifiedDate')  as HTMLInputElement).value,
      identifiedBy:    (f.elements.namedItem('identifiedBy')    as HTMLInputElement).value,
      mitigationPlan:  (f.elements.namedItem('mitigationPlan')  as HTMLTextAreaElement).value || null,
      targetDate:      (f.elements.namedItem('targetDate')      as HTMLInputElement).value || null,
      resolvedDate:    (f.elements.namedItem('resolvedDate')    as HTMLInputElement).value || null,
      resolvedBy:      (f.elements.namedItem('resolvedBy')      as HTMLInputElement).value || null,
      verifiedBy:      (f.elements.namedItem('verifiedBy')      as HTMLInputElement).value || null,
      notes:           (f.elements.namedItem('notes')           as HTMLTextAreaElement).value || null,
    };

    const res = await fetch(`/api/eoc/ligature/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/eoc/ligature');
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? 'Failed to save.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/eoc/ligature" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-400 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Ligature Risk
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          Edit Ligature Risk Item
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-0.5">{item.itemNumber}</p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-700/40 text-red-300 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Item Details</h2>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Item Description *</label>
            <input name="itemDescription" required className="form-input w-full" defaultValue={item.itemDescription} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Location *</label>
              <input name="location" required className="form-input w-full" defaultValue={item.location} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Unit / Zone</label>
              <input name="unit" className="form-input w-full" defaultValue={item.unit ?? ''} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Risk Level *</label>
              <select name="riskLevel" required className="form-input w-full" defaultValue={item.riskLevel}>
                {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status *</label>
              <select name="status" required className="form-input w-full" defaultValue={item.status}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Identification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Identified Date *</label>
              <input name="identifiedDate" type="date" required className="form-input w-full" defaultValue={toDateInput(item.identifiedDate)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Identified By *</label>
              <input name="identifiedBy" required className="form-input w-full" defaultValue={item.identifiedBy} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Target Resolution Date</label>
            <input name="targetDate" type="date" className="form-input w-full" defaultValue={toDateInput(item.targetDate)} />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Mitigation & Resolution</h2>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Mitigation Plan</label>
            <textarea name="mitigationPlan" rows={3} className="form-input w-full" defaultValue={item.mitigationPlan ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Resolved Date</label>
              <input name="resolvedDate" type="date" className="form-input w-full" defaultValue={toDateInput(item.resolvedDate)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Resolved By</label>
              <input name="resolvedBy" className="form-input w-full" defaultValue={item.resolvedBy ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Verified By</label>
            <input name="verifiedBy" className="form-input w-full" defaultValue={item.verifiedBy ?? ''} placeholder="Name of verifier (post-resolution)" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" defaultValue={item.notes ?? ''} />
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <Link href="/eoc/ligature" className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-foreground">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
