'use client';

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export interface MetricPoint {
  month: number;
  year: number;
  value: number;
  target?: number | null;
}

export function MetricTrendChart({
  data,
  unit,
  target,
  color = '#7c3aed',
}: {
  data: MetricPoint[];
  unit?: string;
  target?: number;
  color?: string;
}) {
  const chartData = data.map(d => ({
    name: `${MONTH_ABBR[d.month - 1]} '${String(d.year).slice(2)}`,
    value: d.value,
    target: d.target ?? target,
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          formatter={(v: number) => [`${v}${unit ? ' ' + unit : ''}`, 'Value']}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        {(target !== undefined || data.some(d => d.target)) && (
          <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Target" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function IncidentBarChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
        <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MultiMetricLineChart({
  data,
  metrics,
}: {
  data: Array<{ name: string; [key: string]: number | string }>;
  metrics: Array<{ key: string; label: string; color: string }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        {metrics.map(m => (
          <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
