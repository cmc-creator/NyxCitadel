'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TrendData {
  incidents: { month: string; count: number }[];
  grievances: { month: string; opened: number; closed: number }[];
  caps: { month: string; opened: number; completed: number }[];
}

const tooltipStyle = { fontSize: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0' };
const axisStyle = { fontSize: 10, fill: '#94a3b8' };

export function TrendCharts() {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/trends')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const hasAnyData =
    data.incidents.some(d => d.count > 0) ||
    data.grievances.some(d => d.opened > 0 || d.closed > 0) ||
    data.caps.some(d => d.opened > 0 || d.completed > 0);

  if (!hasAnyData) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-4 h-4 text-teal-400" />
        <h3 className="text-sm font-semibold text-foreground">6-Month Activity Trends</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Incidents */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Incidents Filed</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data.incidents} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={axisStyle} />
              <YAxis tick={axisStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#f97316" radius={[3, 3, 0, 0]} name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grievances */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Grievances</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data.grievances} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={axisStyle} />
              <YAxis tick={axisStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="opened" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Opened" />
              <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Closed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CAPs */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Corrective Actions</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data.caps} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={axisStyle} />
              <YAxis tick={axisStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="opened" fill="#818cf8" radius={[3, 3, 0, 0]} name="Opened" />
              <Bar dataKey="completed" fill="#34d399" radius={[3, 3, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
