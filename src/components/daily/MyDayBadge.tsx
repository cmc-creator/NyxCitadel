'use client';

import { useEffect, useState } from 'react';

export function MyDayBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/my-day/count')
      .then(r => r.json())
      .then((data: { overdue: number }) => setCount(data.overdue))
      .catch(() => setCount(null));
  }, []);

  if (!count) return null;

  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
}
