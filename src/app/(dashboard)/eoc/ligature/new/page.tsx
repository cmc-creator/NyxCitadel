'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const RISK_LEVELS = ['IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW'] as const;

export default function NewLigatureItemPage() {
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
      identifiedDate:  (f.elements.namedItem('identifiedDate')  as HTMLInputElement).value,
      identifiedBy:    (f.elements.namedItem('identifiedBy')    as HTMLInputElement).value,
      mitigationPlan:  (f.elements.namedItem('mitigationPlan')  as HTMLTextAreaElement).value || null,
      targetDate:      (f.elements.namedItem('targetDate')      as HTMLInputElement).value || null,
      notes:           (f.elements.namedItem('notes')           as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/eoc/ligature', {
      method: 'POST',
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
        <Link href="/eoc/ligature" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-400 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Ligature Risk
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          Add Ligature Risk Item
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">TJC EC.02.06.01 — Document identified ligature point with risk level and mitigation plan.</p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-700/40 text-red-300 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Item Details</h2>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Item Description *</label>
            <input
              name="itemDescription"
              required
              className="form-input w-full"
              placeholder="e.g. Towel bar – exposed J-hook style, not ligature-resistant"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Location *</label>
              <input name="location" required className="form-input w-full" placeholder="e.g. Room 118 – Bathroom" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Unit / Zone</label>
              <input name="unit" className="form-input w-full" placeholder="e.g. Acute Adult Unit" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Risk Level *</label>
            <select name="riskLevel" required className="form-input w-full">
              <option value="">Select…</option>
              {RISK_LEVELS.map(r => (
                <option key={r} value={r}>
                  {r === 'IMMEDIATE' ? 'IMMEDIATE — Must correct before patient occupancy' :
                   r === 'HIGH'      ? 'HIGH — Mitigation plan within 72h, correct within 30-45d' :
                   r === 'MEDIUM'    ? 'MEDIUM — Correct within 60-90 days' :
                                       'LOW — Correct within 6 months or accept with sign-off'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Identification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Identified Date *</label>
              <input name="identifiedDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Identified By *</label>
              <input name="identifiedBy" required className="form-input w-full" placeholder="Name / Role" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Target Resolution Date</label>
            <input name="targetDate" type="date" className="form-input w-full" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Mitigation</h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Mitigation Plan</label>
            <textarea
              name="mitigationPlan"
              rows={3}
              className="form-input w-full"
              placeholder="Describe the planned corrective action…"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" placeholder="Additional context, vendor contacts, interim controls…" />
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
            {saving ? 'Saving…' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
