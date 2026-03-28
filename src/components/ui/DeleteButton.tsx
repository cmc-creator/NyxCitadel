'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export function DeleteButton({
  apiPath,
  redirectPath,
  label,
}: {
  apiPath: string;
  redirectPath: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(`Delete this ${label}? This action cannot be undone.`);
    if (!ok || busy) return;

    setBusy(true);
    try {
      const response = await fetch(apiPath, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Delete failed.');
      }
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      window.alert((error as Error).message || 'Delete failed.');
      setBusy(false);
      return;
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-medium disabled:opacity-60"
    >
      <Trash2 className="w-4 h-4" />
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  );
}
