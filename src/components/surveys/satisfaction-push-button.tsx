'use client';

import { useState } from 'react';
import { TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  surveyId: string;
  existingScore: number | null;
  conductedDate: Date | null;
}

export function SatisfactionPushButton({ surveyId, existingScore, conductedDate }: Props) {
  const [score, setScore] = useState(existingScore != null ? String(existingScore) : '');
  const [open, setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  async function handlePush() {
    const num = parseFloat(score);
    if (isNaN(num) || num < 0 || num > 100) return;
    setSaving(true);
    const res = await fetch(`/api/surveys/${surveyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ satisfactionScore: num, pushToQapi: true }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setOpen(false);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const monthLabel = conductedDate
    ? new Date(conductedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  if (saved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Pushed to QAPI
      </span>
    );
  }

  if (existingScore != null && !open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-0.5 rounded-full transition-colors">
        <TrendingUp className="w-3 h-3" /> {existingScore}% satisfaction
      </button>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600 hover:bg-purple-50 px-2 py-0.5 rounded-full border border-slate-200 hover:border-purple-200 transition-colors">
        <TrendingUp className="w-3 h-3" /> Log satisfaction
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
        <input
          type="number" min={0} max={100} step={0.1}
          value={score}
          onChange={e => setScore(e.target.value)}
          placeholder="Score %"
          className="w-16 text-xs border-none outline-none bg-transparent"
          autoFocus
        />
        <span className="text-xs text-slate-400">%</span>
      </div>
      <button onClick={handlePush} disabled={saving || !score}
        className="inline-flex items-center gap-1 text-xs text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-2 py-1 rounded-lg transition-colors">
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
        {monthLabel ? `→ QAPI ${monthLabel}` : '→ QAPI'}
      </button>
      <button onClick={() => setOpen(false)}
        className="text-xs text-slate-400 hover:text-slate-600 px-1">✕</button>
    </div>
  );
}
