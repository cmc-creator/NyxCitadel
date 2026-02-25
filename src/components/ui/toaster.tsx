'use client';

import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all',
            toast.variant === 'destructive'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-white text-slate-900 border-slate-200'
          )}
        >
          <div className="flex-1 text-sm">
            {toast.title && (
              <p className="font-semibold">{toast.title}</p>
            )}
            {toast.description && (
              <p className={cn('mt-0.5', toast.variant === 'destructive' ? 'text-red-100' : 'text-slate-500')}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className={cn(
              'p-0.5 rounded hover:opacity-70 transition-opacity flex-shrink-0',
              toast.variant === 'destructive' ? 'text-red-100' : 'text-slate-400'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
