'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Save, TrendingUp, Info } from 'lucide-react';
import { MetricTrendChart } from '@/components/quality/qapi-charts';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface INDICATOR {
  key: string;
  label: string;
  category: string;
  unit: string;
  target?: number;
  description: string;
  ref: string;
  color: string;
}

const INDICATORS: INDICATOR[] = [
  { key: 'restraint_rate', label: 'Restraint Use Rate', category: 'RESTRAINT_SECLUSION', unit: 'per 1k pt-days', target: 5.0, description: 'Total restraint hours per 1,000 patient-days. Numerator: total restraint hours. Denominator: total patient-days ÷ 1,000.', ref: 'HBIPS-2 / JC PC.03.05.01', color: '#7c3aed' },
  { key: 'seclusion_rate', label: 'Seclusion Use Rate', category: 'RESTRAINT_SECLUSION', unit: 'per 1k pt-days', target: 2.0, description: 'Total seclusion hours per 1,000 patient-days.', ref: 'HBIPS-3', color: '#9333ea' },
  { key: 'fall_rate', label: 'Patient Fall Rate', category: 'PATIENT_SAFETY', unit: 'per 1k pt-days', target: 2.0, description: 'Total falls per 1,000 patient-days. Includes all falls regardless of injury.', ref: 'NDNQI / JC NPSG.09.02.01', color: '#ea580c' },
  { key: 'fall_with_injury_rate', label: 'Falls with Injury Rate', category: 'PATIENT_SAFETY', unit: 'per 1k pt-days', target: 0.5, description: 'Falls resulting in any level of injury per 1,000 patient-days.', ref: 'CMS / NDNQI', color: '#dc2626' },
  { key: 'medication_error_rate', label: 'Medication Error Rate', category: 'MEDICATION_SAFETY', unit: 'per 1k doses', target: 1.0, description: 'Total medication errors (including near-misses) per 1,000 medication doses administered.', ref: 'JC MM.09.01.01 / CMS', color: '#d97706' },
  { key: 'elopement_count', label: 'Elopements', category: 'PATIENT_SAFETY', unit: 'count/month', target: 0, description: 'Total patient elopements (unauthorized absences). Must be reported to AZ ADHS per R9-10-211.', ref: 'AZ ADHS R9-10-211', color: '#b91c1c' },
  { key: 'hai_rate', label: 'HAI Rate', category: 'INFECTION_PREVENTION', unit: 'per 1k pt-days', target: 0.5, description: 'Healthcare-associated infections per 1,000 patient-days. Track via CDC NHSN.', ref: 'CDC NHSN / JC NPSG.07', color: '#0e7490' },
  { key: 'patient_satisfaction', label: 'Patient Satisfaction Score', category: 'PATIENT_EXPERIENCE', unit: '%', target: 85, description: 'Percentage of patients rating care positively. Use standardized survey tool (HCAHPS or equivalent).', ref: 'CMS HCAHPS / HBIPS-7', color: '#16a34a' },
  { key: '30day_readmission_rate', label: '30-Day Readmission Rate', category: 'CLINICAL_CARE', unit: '%', target: 15, description: 'Percentage of patients readmitted to any acute psychiatric facility within 30 days of discharge.', ref: 'CMS / HBIPS-6', color: '#0369a1' },
  { key: 'avg_los', label: 'Average Length of Stay', category: 'THROUGHPUT', unit: 'days', description: 'Average number of days from admission to discharge.', ref: 'CMS / Utilization', color: '#6d28d9' },
  { key: 'staff_turnover', label: 'Staff Turnover Rate', category: 'WORKFORCE', unit: '%', description: 'Annual staff turnover rate. Calculated monthly as (separations / avg headcount) × 100.', ref: 'HR', color: '#854d0e' },
  { key: 'census_utilization', label: 'Census / Occupancy Rate', category: 'THROUGHPUT', unit: '%', description: 'Average daily census ÷ licensed beds × 100.', ref: 'Operations', color: '#475569' },
];

interface StoredMetric {
  id: string;
  metricKey: string;
  month: number;
  year: number;
  value: number;
  target?: number;
  unit?: string;
  numerator?: number;
  denominator?: number;
  notes?: string;
}

export default function QapiMetricsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [metrics, setMetrics] = useState<StoredMetric[]>([]);
  const [values, setValues] = useState<Record<string, { value: string; numerator: string; denominator: string; notes: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/qapi/metrics?year=${year}`)
      .then(r => r.json())
      .then(data => {
        setMetrics(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [year]);

  function getStored(key: string, m: number): StoredMetric | undefined {
    return metrics.find(d => d.metricKey === key && d.month === m && d.year === year);
  }

  function getInputValue(key: string): string {
    if (values[key]?.value !== undefined) return values[key].value;
    return getStored(key, month)?.value?.toString() ?? '';
  }

  async function saveMetric(ind: INDICATOR) {
    const val = values[ind.key]?.value ?? getStored(ind.key, month)?.value?.toString() ?? '';
    if (!val) return;
    setSaving(ind.key);
    const body = {
      metricKey: ind.key,
      metricName: ind.label,
      category: ind.category,
      month,
      year,
      value: parseFloat(val),
      target: ind.target,
      unit: ind.unit,
      numerator: values[ind.key]?.numerator ? parseFloat(values[ind.key].numerator) : undefined,
      denominator: values[ind.key]?.denominator ? parseFloat(values[ind.key].denominator) : undefined,
      notes: values[ind.key]?.notes,
    };
    await fetch('/api/qapi/metrics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const updated = await fetch(`/api/qapi/metrics?year=${year}`).then(r => r.json());
    setMetrics(Array.isArray(updated) ? updated : []);
    setSaving(null);
    setSaved(prev => new Set(Array.from(prev).concat(ind.key)));
    setTimeout(() => setSaved(prev => { const s = new Set(Array.from(prev)); s.delete(ind.key); return s; }), 2000);
  }

  function buildTrendData(key: string): Array<{ month: number; year: number; value: number; target?: number }> {
    return metrics
      .filter(m => m.metricKey === key)
      .map(m => ({ month: m.month, year: m.year, value: m.value, target: m.target ?? undefined }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-purple-600" />
            QAPI Metrics Entry
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Monthly quality indicator data — CMS 42 CFR 482.21 / HBIPS</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="form-input text-sm py-1.5">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="form-input text-sm py-1.5">
            {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {INDICATORS.map(ind => {
          const stored = getStored(ind.key, month);
          const trendData = buildTrendData(ind.key);
          const hasTarget = ind.target !== undefined;
          const currentVal = stored?.value;
          const isGood = hasTarget && currentVal !== undefined
            ? (ind.key === 'patient_satisfaction' ? currentVal >= ind.target! : currentVal <= ind.target!)
            : null;

          return (
            <div key={ind.key} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-800">{ind.label}</h3>
                    <span className="text-xs text-slate-400 font-mono">{ind.ref}</span>
                    {isGood === true && <span className="text-xs font-medium bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">✓ At target</span>}
                    {isGood === false && <span className="text-xs font-medium bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">↑ Above target</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    {ind.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-0 divide-x divide-slate-100">
                {/* Entry form */}
                <div className="flex-shrink-0 w-72 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-600">{MONTH_NAMES[month - 1]} {year}</p>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Value ({ind.unit}) {hasTarget && <span className="text-slate-400">Target: {ind.target}</span>}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={getInputValue(ind.key)}
                      onChange={e => setValues(v => ({ ...v, [ind.key]: { ...v[ind.key], value: e.target.value } }))}
                      placeholder={`Enter ${ind.unit}`}
                      className="form-input w-full text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Numerator</label>
                      <input type="number" step="0.01" value={values[ind.key]?.numerator ?? ''} onChange={e => setValues(v => ({ ...v, [ind.key]: { ...v[ind.key], numerator: e.target.value } }))} className="form-input w-full text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Denominator</label>
                      <input type="number" step="0.01" value={values[ind.key]?.denominator ?? ''} onChange={e => setValues(v => ({ ...v, [ind.key]: { ...v[ind.key], denominator: e.target.value } }))} className="form-input w-full text-xs" />
                    </div>
                  </div>

                  <button
                    onClick={() => saveMetric(ind)}
                    disabled={saving === ind.key || !getInputValue(ind.key)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving === ind.key ? 'Saving…' : saved.has(ind.key) ? '✓ Saved!' : 'Save'}
                  </button>
                </div>

                {/* Trend chart */}
                <div className="flex-1 p-4">
                  {trendData.length > 0 ? (
                    <>
                      <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Trend ({year})
                      </p>
                      <MetricTrendChart data={trendData} unit={ind.unit} target={ind.target} color={ind.color} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                      Enter data to see trend chart
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
