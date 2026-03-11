import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { CircleAlert, Info, CheckCircle2, Clock, ShieldOff, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

const RISK_BADGE: Record<string, string> = {
  IMMEDIATE: 'bg-red-100 text-red-800 border border-red-300',
  HIGH:      'bg-orange-100 text-orange-800 border border-orange-300',
  MEDIUM:    'bg-amber-100 text-amber-800 border border-amber-300',
  LOW:       'bg-slate-100 text-slate-600 border border-slate-300',
};

const STATUS_BADGE: Record<string, string> = {
  OPEN:          'bg-red-100 text-red-700',
  IN_MITIGATION: 'bg-amber-100 text-amber-700',
  MITIGATED:     'bg-sky-100 text-sky-700',
  RESOLVED:      'bg-emerald-100 text-emerald-700',
  ACCEPTED_RISK: 'bg-slate-100 text-slate-600',
};

const STATUS_ICON: Record<string, React.ElementType> = {
  OPEN:          CircleAlert,
  IN_MITIGATION: Clock,
  MITIGATED:     CheckCircle2,
  RESOLVED:      CheckCircle2,
  ACCEPTED_RISK: ShieldOff,
};

export default async function LigaturePage() {
  const session = await auth();
  if (!session) redirect('/login');

  const items = await prisma.ligatureRiskItem.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: [{ riskLevel: 'asc' }, { identifiedDate: 'desc' }],
  });

  const immediate = items.filter(i => i.riskLevel === 'IMMEDIATE').length;
  const high      = items.filter(i => i.riskLevel === 'HIGH').length;
  const medium    = items.filter(i => i.riskLevel === 'MEDIUM').length;
  const low       = items.filter(i => i.riskLevel === 'LOW').length;
  const active    = items.filter(i => ['OPEN', 'IN_MITIGATION'].includes(i.status)).length;
  const resolved  = items.filter(i => ['RESOLVED', 'MITIGATED', 'ACCEPTED_RISK'].includes(i.status)).length;

  const summaryStats = [
    { label: 'IMMEDIATE',    value: immediate, color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
    { label: 'HIGH',         value: high,      color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200' },
    { label: 'MEDIUM',       value: medium,    color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
    { label: 'LOW',          value: low,       color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200' },
    { label: 'OPEN / ACTIVE',value: active,    color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
    { label: 'RESOLVED',     value: resolved,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/eoc" className="text-slate-500 hover:text-slate-800 transition">
              Environment of Care
            </Link>
            <span className="text-slate-400">&rsaquo;</span>
            <span className="font-medium text-slate-800">Ligature Risk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Ligature Risk Assessment</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            TJC EC.02.06.01 &ndash; Psychiatric Environment Ligature Point Tracking
          </p>
        </div>
        <a
          href="/eoc/ligature/new"
          className="px-3 py-1.5 text-sm rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
        >
          + New Item
        </a>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">TJC EC.02.06.01</span> requires psychiatric facilities to conduct a
          comprehensive ligature risk assessment and implement time-limited plans of correction for all identified
          risks. IMMEDIATE risks must be corrected before patient occupancy. HIGH risks require a written mitigation
          plan within 72&nbsp;hours and correction within 30&ndash;45&nbsp;days. All accepted risks require Medical
          Director / Administrator sign-off with documented rationale.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {summaryStats.map(s => (
          <div key={s.label} className={`p-3 rounded-xl border text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Item list */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShieldAlert className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No ligature risk items recorded</p>
          <p className="text-sm text-slate-400 mt-1">
            Click <strong>+ New Item</strong> to add the first entry.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const Icon = STATUS_ICON[item.status] ?? CircleAlert;
            return (
              <Link
                key={item.id}
                href={`/eoc/ligature/${item.id}`}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors group"
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    item.status === 'RESOLVED' || item.status === 'MITIGATED'
                      ? 'text-emerald-500'
                      : item.status === 'ACCEPTED_RISK'
                      ? 'text-slate-400'
                      : item.riskLevel === 'IMMEDIATE'
                      ? 'text-red-500'
                      : item.riskLevel === 'HIGH'
                      ? 'text-orange-500'
                      : 'text-amber-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-400">{item.itemNumber}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                        RISK_BADGE[item.riskLevel] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.riskLevel}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_BADGE[item.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    {item.unit && <span className="text-xs text-slate-400">{item.unit}</span>}
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-1">{item.itemDescription}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                  {item.targetDate && (
                    <span className="text-xs text-slate-400">
                      Target: {formatDate(item.targetDate)}
                    </span>
                  )}
                  <span className="text-xs text-slate-300 group-hover:text-slate-500 transition-colors">
                    &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}