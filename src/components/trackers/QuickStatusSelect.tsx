'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Option {
  value: string;
  label: string;
  color: string;
}

export function QuickStatusSelect({
  apiPath,
  currentStatus,
  options,
}: {
  apiPath: string;
  currentStatus: string;
  options: Option[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = options.find((o) => o.value === status);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          router.refresh();
        }, 1200);
      } else {
        setStatus(currentStatus);
      }
    } catch {
      setStatus(currentStatus);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative inline-block"
    >
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className={`text-xs font-medium px-2 py-0.5 rounded cursor-pointer border-0 outline-none ${current?.color ?? 'bg-muted/30 text-muted-foreground'} disabled:opacity-60`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {saved && (
        <span className="absolute -top-4 left-0 text-xs text-emerald-600 font-medium whitespace-nowrap">
          &#10003; Saved
        </span>
      )}
    </div>
  );
}
