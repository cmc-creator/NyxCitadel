'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  updateId: string;
  initialAcked: boolean;
  ackedAt: string | null;
}

export function AckButton({ updateId, initialAcked, ackedAt }: Props) {
  const [acked, setAcked]   = useState(initialAcked);
  const [date, setDate]     = useState(ackedAt);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function toggle() {
    setLoading(true);
    setError('');
    try {
      if (acked) {
        const res = await fetch(`/api/regulatory-updates/${updateId}/ack`, { method: 'DELETE' });
        if (res.ok) { setAcked(false); setDate(null); }
        else setError('Could not remove acknowledgment.');
      } else {
        const res = await fetch(`/api/regulatory-updates/${updateId}/ack`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setAcked(true);
          setDate(data.ackedAt ?? new Date().toISOString());
        } else {
          setError('Could not save acknowledgment.');
        }
      }
    } catch {
      setError('Network error - please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <button
        onClick={toggle}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
          acked
            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-700/40 hover:bg-emerald-950/60'
            : 'bg-teal-600 hover:bg-teal-500 text-white'
        )}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : acked
          ? <CheckCircle2 className="w-4 h-4" />
          : <Clock className="w-4 h-4" />
        }
        {acked ? 'Acknowledged' : 'Mark as Reviewed & Acknowledged'}
      </button>

      {acked && date && (
        <span className="text-xs text-muted-foreground/70">
          You acknowledged this on {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
