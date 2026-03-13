'use client';

import { useState } from 'react';
import { CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DemoRequestActions({ id, reviewed }: { id: string; reviewed: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    await fetch('/api/admin/demo-requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reviewed: !reviewed }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-60 ${
        reviewed
          ? 'bg-slate-800 text-slate-400 hover:text-white border border-border'
          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : reviewed ? (
        <><RotateCcw className="w-3.5 h-3.5" /> Mark Pending</>
      ) : (
        <><CheckCircle2 className="w-3.5 h-3.5" /> Mark Reviewed</>
      )}
    </button>
  );
}
