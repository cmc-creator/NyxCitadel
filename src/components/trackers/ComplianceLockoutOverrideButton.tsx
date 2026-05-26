'use client';

import { useState } from 'react';
import { ShieldOff, Check, X } from 'lucide-react';

interface Props {
  userId: string;
  userName: string;
  onSuccess: () => void;
}

export function ComplianceLockoutOverrideButton({ userId, userName, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (note.trim().length < 10) {
      setError('Justification must be at least 10 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/training/compliance-lockout', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, overrideNote: note.trim() }),
      });
      if (res.ok) {
        setOpen(false);
        setNote('');
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Override failed.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        <ShieldOff className="w-3.5 h-3.5" />
        Override Lockout
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 min-w-[260px]">
      <p className="text-xs font-medium text-foreground/80">Override lockout for {userName}</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Enter justification (required, min 10 chars)..."
        rows={2}
        className="form-input w-full text-xs"
        autoFocus
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          <Check className="w-3 h-3" />
          {submitting ? 'Saving...' : 'Confirm Override'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setNote(''); setError(''); }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </form>
  );
}
