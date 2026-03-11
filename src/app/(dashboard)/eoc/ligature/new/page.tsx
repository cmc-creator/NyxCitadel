'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const RISK_LEVELS = ['IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW'] as const;

export default function NewLigatureItemPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const body = {
      location:       fd.get('location'),
      unit:           fd.get('unit') || null,
      itemDescription: fd.get('itemDescription'),
      riskLevel:      fd.get('riskLevel'),
      identifiedDate: fd.get('identifiedDate'),
      identifiedBy:   fd.get('identifiedBy'),
      mitigationPlan: fd.get('mitigationPlan') || null,
      targetDate:     fd.get('targetDate') || null,
      notes:          fd.get('notes') || null,
    };

    try {
      const res = await fetch('/api/eoc/ligature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push('/eoc/ligature');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to save. Please try again.');
        setSaving(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/eoc/ligature"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Ligature Risk
        </Link>
        <h1 className="text-xl font-bold text-slate-900">New Ligature Risk Item</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Location */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              name="location"
              required
              placeholder="e.g. Room 118 – Bathroom"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
            <input
              name="unit"
              placeholder="e.g. Acute Adult"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Risk Level <span className="text-red-500">*</span>
            </label>
            <select
              name="riskLevel"
              required
              defaultValue=""
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="" disabled>Select risk level…</option>
              {RISK_LEVELS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Item Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Item Description <span className="text-red-500">*</span>
            </label>
            <input
              name="itemDescription"
              required
              placeholder="e.g. Shower curtain rod – standard (not breakaway)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Identified Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Identified Date <span className="text-red-500">*</span>
            </label>
            <input
              name="identifiedDate"
              type="date"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Identified By */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Identified By <span className="text-red-500">*</span>
            </label>
            <input
              name="identifiedBy"
              required
              placeholder="e.g. Maria Santos RN"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Target Resolution Date</label>
            <input
              name="targetDate"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Mitigation Plan */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Mitigation Plan</label>
            <textarea
              name="mitigationPlan"
              rows={3}
              placeholder="Describe the mitigation plan…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Additional notes…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Link
            href="/eoc/ligature"
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
