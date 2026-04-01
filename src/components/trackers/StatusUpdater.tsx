'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface Props {
  apiPath: string;         // e.g. "/api/incidents/clxxx"
  currentStatus: string;
  options: StatusOption[];
  extraFields?: Record<string, string | boolean | null>; // extra PATCH body fields
  label?: string;
  onSuccess?: () => void;
}

export default function StatusUpdater({
  apiPath, currentStatus, options, extraFields, label = 'Status', onSuccess,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = options.find(o => o.value === currentStatus);
  const dirty = selected !== currentStatus;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selected, ...extraFields }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSuccess?.();
        startTransition(() => router.refresh());
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-slate-500 uppercase">{label}</span>
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${current?.color ?? 'bg-slate-100 text-slate-600'}`}>
        {current?.label ?? currentStatus}
      </span>
      <select
        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400"
        value={selected}
        onChange={e => setSelected(e.target.value)}
        disabled={saving || isPending}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving || isPending}
          className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Update'}
        </button>
      )}
      {saved && <span className="text-xs text-green-600 font-medium">✓ Saved</span>}
    </div>
  );
}
