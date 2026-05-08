'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart2, TrendingUp, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { MetricTrendChart } from '@/components/quality/qapi-charts';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function daysInMonth(m: number, y: number) {
  return new Date(y, m, 0).getDate();
}

interface Indicator {
  key: string;
  label: string;
  category: string;
  unit: string;
  target?: number;
  ref: string;
  color: string;
  calcType: 'per1kDays' | 'per1kDoses' | 'rawCount' | 'pct' | 'direct';
  numeratorLabel: string;
  denominatorLabel?: string;
  higherIsBetter?: boolean;
  autoFromIR?: boolean;
}

const INDICATORS: Indicator[] = [
  { key: 'restraint_rate',      label: 'Restraint Use Rate',     category: 'RESTRAINT_SECLUSION',  unit: 'per 1k pt-days', target: 5.0,  ref: 'HBIPS-2 / JC PC.03.05.01', color: '#7c3aed', calcType: 'per1kDays',  numeratorLabel: 'Total restraint hours' },
  { key: 'seclusion_rate',      label: 'Seclusion Use Rate',     category: 'RESTRAINT_SECLUSION',  unit: 'per 1k pt-days', target: 2.0,  ref: 'HBIPS-3',                   color: '#9333ea', calcType: 'per1kDays',  numeratorLabel: 'Total seclusion hours' },
  { key: 'fall_rate',           label: 'Patient Fall Rate',      category: 'PATIENT_SAFETY',       unit: 'per 1k pt-days', target: 2.0,  ref: 'NDNQI / NPSG.09.02.01',     color: '#ea580c', calcType: 'per1kDays',  numeratorLabel: 'Total falls (any)' },
  { key: 'fall_with_injury_rate', label: 'Falls with Injury',    category: 'PATIENT_SAFETY',       unit: 'per 1k pt-days', target: 0.5,  ref: 'CMS / NDNQI',               color: '#dc2626', calcType: 'per1kDays',  numeratorLabel: 'Falls causing injury' },
  { key: 'hai_rate',            label: 'HAI Rate',               category: 'INFECTION_PREVENTION', unit: 'per 1k pt-days', target: 0.5,  ref: 'CDC NHSN / NPSG.07',        color: '#0e7490', calcType: 'per1kDays',  numeratorLabel: 'Healthcare-assoc. infections' },
  { key: 'medication_error_rate', label: 'Medication Error Rate',category: 'MEDICATION_SAFETY',   unit: 'per 1k doses',   target: 1.0,  ref: 'JC MM.09.01.01 / CMS',      color: '#d97706', calcType: 'per1kDoses', numeratorLabel: 'Medication errors (incl. near-miss)' },
  { key: 'elopement_count',     label: 'Elopements',             category: 'PATIENT_SAFETY',       unit: 'count',          target: 0,    ref: 'AZ ADHS R9-10-211',         color: '#b91c1c', calcType: 'rawCount',   numeratorLabel: 'Elopements', autoFromIR: true },
  { key: 'patient_satisfaction', label: 'Patient Satisfaction', category: 'PATIENT_EXPERIENCE',   unit: '%',              target: 85,   ref: 'CMS HCAHPS / HBIPS-7',      color: '#16a34a', calcType: 'pct', numeratorLabel: 'Patients rating care positively', denominatorLabel: 'Total patients surveyed', higherIsBetter: true },
  { key: '30day_readmission_rate', label: '30-Day Readmission', category: 'CLINICAL_CARE',         unit: '%',              target: 15,   ref: 'CMS / HBIPS-6',             color: '#0369a1', calcType: 'pct', numeratorLabel: 'Patients readmitted ≤30d', denominatorLabel: 'Total discharges' },
  { key: 'census_utilization',  label: 'Occupancy Rate',         category: 'THROUGHPUT',           unit: '%',              ref: 'Operations',                             color: '#475569', calcType: 'pct', numeratorLabel: 'Total patient-days (census)', denominatorLabel: 'Licensed bed-days', higherIsBetter: true },
  { key: 'avg_los',             label: 'Avg Length of Stay',     category: 'THROUGHPUT',           unit: 'days',           ref: 'CMS / Utilization',                      color: '#6d28d9', calcType: 'direct', numeratorLabel: 'Average days (admission → discharge)' },
  { key: 'staff_turnover',      label: 'Staff Turnover Rate',    category: 'WORKFORCE',            unit: '%',              ref: 'HR',                                     color: '#854d0e', calcType: 'direct', numeratorLabel: 'Turnover % (separations ÷ avg headcount × 100)' },
];

function calcRate(ind: Indicator, num: number, den: number, ptDays: number, doses: number): number | null {
  if (ind.calcType === 'per1kDays')  return ptDays  ? (num / ptDays)  * 1000 : null;
  if (ind.calcType === 'per1kDoses') return doses   ? (num / doses)   * 1000 : null;
  if (ind.calcType === 'rawCount')   return isNaN(num) ? null : num;
  if (ind.calcType === 'pct')        return den     ? (num / den)     * 100  : null;
  if (ind.calcType === 'direct')     return isNaN(num) ? null : num;
  return null;
}

function StatusBadge({ value, target, higherIsBetter }: { value: number; target?: number; higherIsBetter?: boolean }) {
  if (target === undefined) return null;
  const better = higherIsBetter ? value >= target : value <= target;
  const borderline = !better && (higherIsBetter ? value >= target * 0.9 : value <= target * 1.2);
  if (better)     return <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">✓ On target</span>;
  if (borderline) return <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">⚠ Near target</span>;
  return <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">↑ Off target</span>;
}

interface StoredMetric {
  id: string; metricKey: string; month: number; year: number;
  value: number; target?: number; unit?: string; numerator?: number; denominator?: number;
}

type Entries = Record<string, { num: string; den: string }>;

export default function QapiMetricsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [patientDays, setPatientDays] = useState('');
  const [doses, setDoses] = useState('');
  const [entries, setEntries] = useState<Entries>({});
  const [metrics, setMetrics] = useState<StoredMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAll, setSavedAll] = useState(false);
  const [autoElopements, setAutoElopements] = useState<number | null>(null);
  const [expandedTrend, setExpandedTrend] = useState<string | null>(null);
  const [facilityBeds, setFacilityBeds] = useState<number>(60);

  // Load facility bed count dynamically
  useEffect(() => {
    fetch('/api/facility')
      .then(r => r.json())
      .then(data => { if (data.bedCount) setFacilityBeds(data.bedCount); })
      .catch(() => {/* use default */});
  }, []);

  const BEDS = facilityBeds;
  const suggestedDays = BEDS * daysInMonth(month, year);

  const loadMetrics = useCallback(() => {
    setLoading(true);
    fetch(`/api/qapi/metrics?year=${year}`)
      .then(r => r.json())
      .then((data: StoredMetric[]) => {
        if (!Array.isArray(data)) return;
        setMetrics(data);
        const thisMonth = data.filter(d => d.month === month && d.year === year);
        const prefilled: Entries = {};
        for (const m of thisMonth) {
          prefilled[m.metricKey] = {
            num: m.numerator != null ? String(m.numerator) : String(m.value),
            den: m.denominator != null ? String(m.denominator) : '',
          };
        }
        const ptDaysSrc = thisMonth.find(m => {
          const ind = INDICATORS.find(i => i.key === m.metricKey);
          return ind?.calcType === 'per1kDays' && m.denominator;
        });
        if (ptDaysSrc?.denominator) setPatientDays(String(ptDaysSrc.denominator));
        setEntries(prev => ({ ...prefilled, ...prev }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [year, month]);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  useEffect(() => {
    const start = new Date(year, month - 1, 1).toISOString();
    const end   = new Date(year, month, 0, 23, 59, 59).toISOString();
    fetch(`/api/incident-reports?type=ELOPEMENT&from=${start}&to=${end}`)
      .then(r => r.json())
      .then((data: unknown[]) => { if (Array.isArray(data)) setAutoElopements(data.length); })
      .catch(() => setAutoElopements(null));
  }, [month, year]);

  const ptDaysNum = parseFloat(patientDays) || 0;
  const dosesNum  = parseFloat(doses) || 0;

  function setNum(key: string, val: string) {
    setEntries(e => ({ ...e, [key]: { num: val, den: e[key]?.den ?? '' } }));
  }
  function setDen(key: string, val: string) {
    setEntries(e => ({ ...e, [key]: { num: e[key]?.num ?? '', den: val } }));
  }

  function getCalcValue(ind: Indicator): number | null {
    const numRaw = parseFloat(entries[ind.key]?.num ?? '');
    const num = ind.autoFromIR && autoElopements !== null && !entries[ind.key]?.num ? autoElopements : numRaw;
    if (isNaN(num)) return null;
    const den = ind.calcType === 'pct' ? parseFloat(entries[ind.key]?.den ?? '') : 0;
    return calcRate(ind, num, den, ptDaysNum, dosesNum);
  }

  function buildTrendData(key: string) {
    return metrics
      .filter(m => m.metricKey === key)
      .sort((a, b) => a.month - b.month)
      .map(m => ({ month: m.month, year: m.year, value: m.value, target: m.target ?? undefined }));
  }

  async function saveAll() {
    setSaving(true);
    const batch = INDICATORS.map(ind => {
      const value = getCalcValue(ind);
      if (value === null) return null;
      const numRaw = parseFloat(entries[ind.key]?.num ?? '');
      const num = ind.autoFromIR && autoElopements !== null && !entries[ind.key]?.num ? autoElopements : numRaw;
      const den = ind.calcType === 'pct'       ? parseFloat(entries[ind.key]?.den ?? '') || null
                : ind.calcType === 'per1kDays'  ? ptDaysNum || null
                : ind.calcType === 'per1kDoses' ? dosesNum  || null
                : null;
      return { metricKey: ind.key, metricName: ind.label, category: ind.category, month, year,
               value: Math.round(value * 100) / 100, target: ind.target, unit: ind.unit,
               numerator: isNaN(num) ? undefined : num, denominator: den ?? undefined };
    }).filter(Boolean);

    if (batch.length > 0) {
      await fetch('/api/qapi/metrics/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: batch }),
      });
    }
    setSaving(false);
    setSavedAll(true);
    setTimeout(() => setSavedAll(false), 3000);
    loadMetrics();
  }

  const readyCount = INDICATORS.filter(i => getCalcValue(i) !== null).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-teal-600" />
            QAPI Metrics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Enter raw counts - rates calculate automatically · CMS 42 CFR 482.21</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="form-input text-sm py-1.5">
            {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="form-input text-sm py-1.5">
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Step 1: Context */}
      <div className="bg-teal-950/20 border border-teal-800/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-600" />
          <h2 className="font-semibold text-teal-900 text-sm">Step 1 - Enter monthly context (shared denominators)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-teal-800 mb-1">
              Total Patient-Days <span className="font-normal text-teal-400">(used for restraint, seclusion, fall, HAI rates)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number" min={0}
                value={patientDays}
                onChange={e => setPatientDays(e.target.value)}
                placeholder={`Suggested: ${suggestedDays} (${BEDS} beds × ${daysInMonth(month, year)} days)`}
                className="form-input flex-1 text-sm"
              />
              {!patientDays && (
                <button type="button" onClick={() => setPatientDays(String(suggestedDays))}
                  className="text-xs text-teal-700 bg-teal-100 hover:bg-teal-200 px-2 py-1 rounded-lg whitespace-nowrap transition-colors">
                  Use {suggestedDays}
                </button>
              )}
            </div>
            {ptDaysNum > 0 && (
              <p className="text-xs text-teal-600 mt-1">Avg census: <strong>{(ptDaysNum / daysInMonth(month, year)).toFixed(1)}</strong> beds/day</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-teal-800 mb-1">
              Total Medication Doses <span className="font-normal text-teal-400">(for medication error rate)</span>
            </label>
            <input
              type="number" min={0}
              value={doses}
              onChange={e => setDoses(e.target.value)}
              placeholder="Total doses administered this month"
              className="form-input w-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* Auto-pull banner */}
      {autoElopements !== null && (
        <div className="bg-amber-950/20 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Zap className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Auto-pulled from IR/IAD tracker:</strong> {autoElopements} elopement{autoElopements !== 1 ? 's' : ''} in {MONTH_NAMES[month - 1]} {year} - pre-filled below.
          </p>
        </div>
      )}

      {/* Step 2: Metrics grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground text-sm">Step 2 - Enter raw counts below</h2>
          <span className="text-xs text-muted-foreground/70">Calculated rates appear instantly</span>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border/30">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground/70 text-sm">Loading…</div>
          ) : (
            INDICATORS.map(ind => {
              const calcVal = getCalcValue(ind);
              const isAutoEl = ind.autoFromIR && autoElopements !== null && !entries[ind.key]?.num;
              const trendData = buildTrendData(ind.key);
              const isExpanded = expandedTrend === ind.key;

              return (
                <div key={ind.key}>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center">
                    {/* Label */}
                    <div className="px-4 py-3 flex items-center gap-3 min-w-0">
                      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: ind.color }} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{ind.label}</span>
                          <span className="text-xs font-mono text-muted-foreground/70">{ind.ref}</span>
                        </div>
                        <div className="text-xs text-muted-foreground/70 mt-0.5">
                          {ind.numeratorLabel}
                          {ind.calcType === 'per1kDays'  && <span className="text-teal-400"> ÷ patient-days × 1k</span>}
                          {ind.calcType === 'per1kDoses' && <span className="text-orange-400"> ÷ doses × 1k</span>}
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="px-4 py-3 flex items-center gap-2">
                      {isAutoEl ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-amber-600">{autoElopements}</span>
                          <span className="text-xs bg-amber-950/20 text-amber-600 px-2 py-1 rounded-lg">auto</span>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs text-muted-foreground/70 mb-0.5">
                              {ind.calcType === 'direct' ? 'Value' : 'Count'}
                            </label>
                            <input
                              type="number" min={0} step="0.01"
                              value={entries[ind.key]?.num ?? ''}
                              onChange={e => setNum(ind.key, e.target.value)}
                              placeholder="0"
                              className="form-input w-24 text-sm text-right"
                            />
                          </div>
                          {ind.calcType === 'pct' && (
                            <div>
                              <label className="block text-xs text-muted-foreground/70 mb-0.5">{ind.denominatorLabel ?? 'Total'}</label>
                              <input
                                type="number" min={0} step="0.01"
                                value={entries[ind.key]?.den ?? ''}
                                onChange={e => setDen(ind.key, e.target.value)}
                                placeholder="0"
                                className="form-input w-24 text-sm text-right"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Calculated result */}
                    <div className="px-4 py-3 min-w-[160px] flex items-center justify-end">
                      {calcVal !== null ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-foreground">
                              {Number.isInteger(calcVal) ? calcVal : calcVal.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground/70">{ind.unit}</span>
                          </div>
                          {ind.target !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground/70">Target: {ind.target}</span>
                              <StatusBadge value={calcVal} target={ind.target} higherIsBetter={ind.higherIsBetter} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">
                          {ind.calcType === 'per1kDays'  && !ptDaysNum ? 'enter pt-days ↑' :
                           ind.calcType === 'per1kDoses' && !dosesNum  ? 'enter doses ↑' : '-'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Trend row */}
                  {trendData.length > 0 && (
                    <div className="border-t border-border/20">
                      <button
                        type="button"
                        onClick={() => setExpandedTrend(isExpanded ? null : ind.key)}
                        className="w-full flex items-center gap-1.5 px-4 py-1.5 text-xs text-muted-foreground/70 hover:text-teal-600 hover:bg-teal-950/20 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        <TrendingUp className="w-3 h-3" />
                        {trendData.length} month{trendData.length !== 1 ? 's' : ''} of data - {isExpanded ? 'hide' : 'view'} trend
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <MetricTrendChart data={trendData} unit={ind.unit} target={ind.target} color={ind.color} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4">
        <div className="bg-card border border-border rounded-xl shadow-lg px-5 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {readyCount > 0
              ? <><strong>{readyCount}</strong> metric{readyCount !== 1 ? 's' : ''} ready to save for <strong>{MONTH_NAMES[month - 1]} {year}</strong></>
              : 'Enter counts above to calculate metrics.'}
          </p>
          <button
            onClick={saveAll}
            disabled={saving || readyCount === 0}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow"
          >
            {saving ? 'Saving…' : savedAll ? '✓ All Saved!' : 'Save All Metrics'}
          </button>
        </div>
      </div>
    </div>
  );
}
