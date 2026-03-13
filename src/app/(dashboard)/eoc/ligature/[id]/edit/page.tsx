'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

const RISK_LEVELS = ['IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW'] as const;
const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_MITIGATION', label: 'In Mitigation' },
  { value: 'MITIGATED', label: 'Mitigated' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'ACCEPTED_RISK', label: 'Accepted Risk' },
] as const;

type LigatureItem = {
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
};

function toDateInput(val: string | null | undefined): string {
  if (!val) return '';
  return val.slice(0, 10);
}

export default function EditLigatureItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<LigatureItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/eoc/ligature/${id}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load item.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const body = {
      location:        fd.get('location'),
      unit:            fd.get('unit') || null,
      itemDescription: fd.get('itemDescription'),
      riskLevel:       fd.get('riskLevel'),
      status:          fd.get('status'),
      identifiedDate:  fd.get('identifiedDate'),
      identifiedBy:    fd.get('identifiedBy'),
      mitigationPlan:  fd.get('mitigationPlan') || null,
      targetDate:      fd.get('targetDate') || null,
      resolvedDate:    fd.get('resolvedDate') || null,
      resolvedBy:      fd.get('resolvedBy') || null,
      verifiedBy:      fd.get('verifiedBy') || null,
      notes:           fd.get('notes') || null,
    };

    try {
      const res = await fetch(`/api/eoc/ligature/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push(`/eoc/ligature/${id}`);
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Failed to save. Please try again.');
        setSaving(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-sm text-slate-500">Loading…</div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-sm text-red-600">
        {error || 'Item not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href={`/eoc/ligature/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Item
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Edit Ligature Risk Item</h1>
          <DeleteButton
            apiPath={`/api/eoc/ligature/${id}`}
            redirectPath="/eoc/ligature"
            label="ligature item"
          />
        </div>
      </div>

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
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
              defaultValue={data.location}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
            <input
              name="unit"
              defaultValue={data.unit ?? ''}
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
              defaultValue={data.riskLevel}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {RISK_LEVELS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              required
              defaultValue={data.status}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
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
              defaultValue={data.itemDescription}
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
              defaultValue={toDateInput(data.identifiedDate)}
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
              defaultValue={data.identifiedBy}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Target Resolution Date</label>
            <input
              name="targetDate"
              type="date"
              defaultValue={toDateInput(data.targetDate)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Resolved Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Resolved Date</label>
            <input
              name="resolvedDate"
              type="date"
              defaultValue={toDateInput(data.resolvedDate)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Resolved By */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Resolved By</label>
            <input
              name="resolvedBy"
              defaultValue={data.resolvedBy ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Verified By */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Verified By</label>
            <input
              name="verifiedBy"
              defaultValue={data.verifiedBy ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Mitigation Plan */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Mitigation Plan</label>
            <textarea
              name="mitigationPlan"
              rows={3}
              defaultValue={data.mitigationPlan ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={data.notes ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Link
            href={`/eoc/ligature/${id}`}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
