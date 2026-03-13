'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  /** Full API path, e.g. /api/compliance/abc123 */
  apiPath: string;
  /** Where to redirect after successful deletion */
  redirectPath: string;
  /** Label for what's being deleted, used in confirm dialog */
  label?: string;
  /** Optional additional CSS classes for the button */
  className?: string;
}

export function DeleteButton({ apiPath, redirectPath, label = 'record', className }: DeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    if (!confirm(`Delete this ${label}? This action cannot be undone.`)) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(apiPath, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        router.push(redirectPath);
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? 'Failed to delete.');
        setDeleting(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setDeleting(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="text-xs text-red-600 mb-1">{error}</p>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={className ?? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors border border-red-200 disabled:opacity-50'}
      >
        <Trash2 className="w-3.5 h-3.5" />
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  );
}

export default DeleteButton;
