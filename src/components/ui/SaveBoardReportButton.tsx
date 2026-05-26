'use client';

import { useState } from 'react';
import { Archive } from 'lucide-react';

interface Props {
  title: string;
  reportMonth: number;
  reportYear: number;
  content: Record<string, unknown>;
}

export function SaveBoardReportButton({ title, reportMonth, reportYear, content }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/board-report/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, reportMonth, reportYear, content }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Failed to save');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-lg transition no-print"
      >
        <Archive className="w-4 h-4" />
        {saved ? 'Saved to Archive' : saving ? 'Saving...' : 'Save to Archive'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
