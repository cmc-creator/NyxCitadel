'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteAttachmentButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function doDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/attachments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.refresh();
    } catch {
      setBusy(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={doDelete}
          disabled={busy}
          className="text-[11px] font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {busy ? 'Deleting…' : 'Confirm'}
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-[11px] text-slate-400 hover:text-slate-600"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Remove attachment"
      className="text-slate-300 hover:text-red-500 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
