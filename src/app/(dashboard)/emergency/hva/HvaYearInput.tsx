'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function HvaYearInput() {
  const router = useRouter();
  const [year, setYear] = useState('');

  const go = () => {
    const y = parseInt(year, 10);
    if (y >= 2000 && y <= 2099) router.push(`/emergency/hva/${y}/edit`);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={year}
        onChange={e => setYear(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && go()}
        placeholder="YYYY"
        min={2000} max={2099}
        className="w-24 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
      />
      <button
        onClick={go}
        disabled={!year || parseInt(year) < 2000 || parseInt(year) > 2099}
        className="inline-flex items-center gap-1 text-sm border border-amber-400 text-amber-700 bg-amber-950/20 hover:bg-amber-100 disabled:opacity-40 px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />Open / Start
      </button>
    </div>
  );
}