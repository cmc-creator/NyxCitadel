'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function RegulatoryUpdatesBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const res = await fetch('/api/regulatory-updates/unread-count', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCount(data.count ?? 0);
      } catch {
        // silently ignore - badge just won't show
      }
    }

    fetchCount();
    const id = setInterval(fetchCount, 5 * 60 * 1000); // refresh every 5 min
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (!count) return null;

  return (
    <span
      className={cn(
        'ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center',
        'bg-red-500 text-white'
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
