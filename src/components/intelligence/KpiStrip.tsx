'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, ClipboardList, Shield, Activity,
  TrendingUp, CalendarClock, SlidersHorizontal, X,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  AlertTriangle, ClipboardList, Shield, Activity, TrendingUp, CalendarClock,
};

export interface KpiStatSerialized {
  id: string;
  label: string;
  value: number;
  iconKey: string;
  color: string;
  href: string;
}

const STORAGE_KEY = 'nyx:kpi-visibility';

export function KpiStrip({ stats }: { stats: KpiStatSerialized[] }) {
  const [customizing, setCustomizing] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setVisible(JSON.parse(stored)); } catch { /* use defaults */ }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
  }, [visible, mounted]);

  function isVisible(id: string) {
    return visible[id] !== false;
  }

  function toggle(id: string) {
    setVisible(prev => ({ ...prev, [id]: !isVisible(id) }));
  }

  const visibleStats = stats.filter(s => isVisible(s.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">KPI Snapshot</p>
        <button
          onClick={() => setCustomizing(c => !c)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Customize
        </button>
      </div>

      {customizing && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Visible KPIs</p>
            <button onClick={() => setCustomizing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {stats.map(s => (
              <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isVisible(s.id)}
                  onChange={() => toggle(s.id)}
                  className="rounded border-border accent-teal-500"
                />
                <span className="text-muted-foreground">{s.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {visibleStats.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {visibleStats.map(({ id, label, value, iconKey, color, href }) => {
            const Icon = ICON_MAP[iconKey] ?? AlertTriangle;
            return (
              <Link
                key={id}
                href={href}
                className="bg-card border border-border rounded-xl px-4 py-3 hover:border-teal-500 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-foreground group-hover:text-teal-400 leading-none">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">No KPIs selected. Use Customize to add some.</p>
      )}
    </div>
  );
}
