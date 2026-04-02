import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Activity, Plus, TrendingUp, AlertTriangle, CheckCircle2,
  ClipboardList, BarChart2, Target,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { QapiOverviewCharts } from './overview-charts';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Quality / QAPI' };

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default async function QualityPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  // Fetch stats in parallel
  const [
    incidentsByType,
    openCaps,
    closedCaps,
    activeProjects,
    recentMetrics,
    recentIncidents6mo,
  ] = await Promise.all([
    // Incident type breakdown (all time)
    prisma.incident.groupBy({
      by: ['incidentType'],
      where: { facilityId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    }),
    prisma.correctiveActionPlan.count({
      where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
    }),
    prisma.correctiveActionPlan.count({
      where: { facilityId, status: { in: ['COMPLETED', 'VERIFIED'] } },
    }),
    prisma.qapiProject.count({
      where: { facilityId, status: { in: ['ACTIVE', 'MONITORING'] } },
    }),
    // Get metrics for this year
    prisma.qapiMetric.findMany({
      where: { facilityId, year: thisYear },
      orderBy: [{ metricKey: 'asc' }, { month: 'asc' }],
    }),
    // Incidents last 6 months
    prisma.incident.findMany({
      where: {
        facilityId,
        dateOccurred: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
      select: { dateOccurred: true, severity: true, incidentType: true },
    }),
  ]);

  // Build monthly incident counts for last 6 months
  const months6: string[] = [];
  const monthlyIncidentCounts: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months6.push(MONTH_ABBR[d.getMonth()]);
    const count = recentIncidents6mo.filter(inc => {
      const id = new Date(inc.dateOccurred);
      return id.getFullYear() === d.getFullYear() && id.getMonth() === d.getMonth();
    }).length;
    monthlyIncidentCounts.push(count);
  }

  const incidentChartData = months6.map((name, i) => ({
    name,
    count: monthlyIncidentCounts[i],
  }));

  // Cap completion rate
  const totalCaps = openCaps + closedCaps;
  const capCompletionPct = totalCaps > 0 ? Math.round((closedCaps / totalCaps) * 100) : 0;

  // Incident type chart data
  const incidentTypeData = incidentsByType.map(i => ({
    name: i.incidentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 20),
    count: i._count.id,
  }));

  // Key metrics for display (latest available data point)
  const keyMetricKeys = ['restraint_rate', 'fall_rate', 'medication_error_rate', 'patient_satisfaction'];
  const latestMetrics = keyMetricKeys.map(key => {
    const metricData = recentMetrics.filter(m => m.metricKey === key).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return metricData[0] ?? null;
  });

  const metricLabels: Record<string, { label: string; unit: string; target?: number; color: string }> = {
    restraint_rate: { label: 'Restraint Rate', unit: 'per 1k pt-days', target: 5.0, color: 'purple' },
    fall_rate: { label: 'Patient Fall Rate', unit: 'per 1k pt-days', target: 2.0, color: 'orange' },
    medication_error_rate: { label: 'Medication Error Rate', unit: 'per 1k doses', target: 1.0, color: 'red' },
    patient_satisfaction: { label: 'Patient Satisfaction', unit: '%', target: 85, color: 'green' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            Quality / QAPI
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            CMS 42 CFR 482.21 · JC PI.01.01.01 · Quality Assessment & Performance Improvement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/quality/metrics" className="inline-flex items-center gap-1.5 text-sm text-slate-600 border border-border px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <BarChart2 className="w-4 h-4" /> Enter Metrics
          </Link>
          <Link href="/quality/projects/new" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New QAPI Project
          </Link>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Open CAPs</p>
          <p className="text-3xl font-bold mt-1 text-orange-600">{openCaps}</p>
          <Link href="/trackers/caps" className="text-xs text-muted-foreground/70 hover:text-teal-600">View CAPs →</Link>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">CAP Completion</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{capCompletionPct}%</p>
          <p className="text-xs text-muted-foreground/70">{closedCaps} of {totalCaps} closed</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active QAPI Projects</p>
          <p className="text-3xl font-bold mt-1 text-teal-600">{activeProjects}</p>
          <Link href="/quality/projects" className="text-xs text-muted-foreground/70 hover:text-teal-600">View projects →</Link>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Incidents (This Month)</p>
          <p className="text-3xl font-bold mt-1 text-red-600">{monthlyIncidentCounts[5]}</p>
          <Link href="/trackers/incidents" className="text-xs text-muted-foreground/70 hover:text-teal-600">View incidents →</Link>
        </div>
      </div>

      {/* Key indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {keyMetricKeys.map((key, i) => {
          const m = latestMetrics[i];
          const info = metricLabels[key];
          const isGood = m && info.target
            ? key === 'patient_satisfaction' ? m.value >= info.target : m.value <= info.target
            : null;
          return (
            <div key={key} className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-slate-500">{info.label}</p>
              {m ? (
                <>
                  <p className={`text-2xl font-bold mt-1 ${isGood === true ? 'text-green-600' : isGood === false ? 'text-red-600' : 'text-foreground/80'}`}>
                    {m.value}{key === 'patient_satisfaction' ? '%' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground/70">{MONTH_ABBR[m.month - 1]} {m.year} · Target: {info.target}{info.unit.includes('%') ? '%' : ''}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground/70 mt-2">No data yet</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <QapiOverviewCharts
        incidentChartData={incidentChartData}
        incidentTypeData={incidentTypeData}
      />

      {/* Required QAPI indicators checklist */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            Standard HBIPS Quality Indicators
          </h2>
          <Link href="/quality/metrics" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            Enter data →
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { key: 'restraint_rate', label: 'Restraint Use Rate', ref: 'HBIPS-2 / JC PC.03.05.01', unit: 'per 1k pt-days', required: true },
            { key: 'seclusion_rate', label: 'Seclusion Use Rate', ref: 'HBIPS-3', unit: 'per 1k pt-days', required: true },
            { key: 'fall_rate', label: 'Patient Fall Rate', ref: 'NDNQI / JC NPSG.09.02.01', unit: 'per 1k pt-days', required: true },
            { key: 'fall_with_injury_rate', label: 'Falls with Injury Rate', ref: 'CMS', unit: 'per 1k pt-days', required: true },
            { key: 'medication_error_rate', label: 'Medication Error Rate', ref: 'JC MM / CMS', unit: 'per 1k doses', required: true },
            { key: 'elopement_count', label: 'Elopements', ref: 'AZ ADHS R9-10-211', unit: 'count/month', required: true },
            { key: 'patient_satisfaction', label: 'Patient Satisfaction Score', ref: 'CMS HCAHPS / HBIPS', unit: '%', required: true },
            { key: '30day_readmission_rate', label: '30-Day Readmission Rate', ref: 'CMS', unit: '%', required: true },
            { key: 'avg_los', label: 'Average Length of Stay', ref: 'CMS / Utilization', unit: 'days', required: false },
            { key: 'staff_turnover', label: 'Staff Turnover Rate', ref: 'HR', unit: '%', required: false },
            { key: 'hai_rate', label: 'HAI Rate', ref: 'CDC NHSN / JC NPSG.07', unit: 'per 1k pt-days', required: true },
          ].map(ind => {
            const hasData = recentMetrics.some(m => m.metricKey === ind.key && m.year === thisYear);
            return (
              <div key={ind.key} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                {hasData
                  ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  : <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{ind.label}</p>
                  <p className="text-xs text-muted-foreground/70">{ind.ref} · {ind.unit}</p>
                </div>
                {ind.required && (
                  <span className="text-xs font-medium bg-teal-950/20 text-teal-700 px-2 py-0.5 rounded-full">Required</span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${hasData ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {hasData ? `${thisYear} ✓` : 'No data'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
