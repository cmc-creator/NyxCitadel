import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, CheckCircle2, AlertTriangle, Clock, XCircle, Minus } from 'lucide-react';
import { addDays, isPast, isWithinInterval } from 'date-fns';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Staff Competency Matrix' };

const REQUIRED_CATEGORIES = [
  'ORIENTATION',
  'ANNUAL_MANDATORY',
  'CPR_BLS',
  'CPI_DE_ESCALATION',
  'SUICIDE_RISK',
  'RESTRAINT_SECLUSION',
  'FIRE_SAFETY',
  'INFECTION_CONTROL',
  'HIPAA_PRIVACY',
  'MEDICATION_MANAGEMENT',
  'EMERGENCY_MANAGEMENT',
];

const CAT_LABEL: Record<string, string> = {
  ORIENTATION:           'Orientation',
  ANNUAL_MANDATORY:      'Annual Mandatory',
  CPR_BLS:               'CPR/BLS',
  CPI_DE_ESCALATION:     'CPI/De-Esc.',
  SUICIDE_RISK:          'Suicide Risk',
  RESTRAINT_SECLUSION:   'R&S',
  FIRE_SAFETY:           'Fire Safety',
  INFECTION_CONTROL:     'Infection Ctrl',
  HIPAA_PRIVACY:         'HIPAA',
  MEDICATION_MANAGEMENT: 'Med Mgmt',
  EMERGENCY_MANAGEMENT:  'EM',
};

type CellStatus = 'ok' | 'expiring' | 'expired' | 'missing' | 'exempt';

const CELL_CONFIG: Record<CellStatus, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  ok:       { bg: 'bg-emerald-950/40 border-emerald-700/30',  text: 'text-emerald-400', icon: CheckCircle2, label: 'Current'  },
  expiring: { bg: 'bg-amber-950/40 border-amber-700/30',      text: 'text-amber-400',   icon: Clock,        label: 'Expiring' },
  expired:  { bg: 'bg-red-950/40 border-red-700/30',          text: 'text-red-400',     icon: XCircle,      label: 'Expired'  },
  missing:  { bg: 'bg-muted/30 border-border/50',             text: 'text-muted-foreground/40', icon: Minus, label: 'Missing' },
  exempt:   { bg: 'bg-slate-950/30 border-slate-700/30',      text: 'text-slate-500',   icon: Minus,        label: 'Exempt'   },
};

export default async function CompetencyMatrixPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const now = new Date();
  const in30 = addDays(now, 30);
  const facilityId = session.user.facilityId;

  const records = await prisma.trainingRecord.findMany({
    where: { facilityId, category: { in: REQUIRED_CATEGORIES as never[] } },
    orderBy: [{ staffName: 'asc' }, { category: 'asc' }, { completedDate: 'desc' }],
    select: {
      id: true, staffName: true, department: true, jobTitle: true,
      category: true, status: true, expiryDate: true, completedDate: true,
    },
  });

  // Build staff list (unique staff, sorted by name)
  const staffMap = new Map<string, { name: string; department: string | null; jobTitle: string | null }>();
  for (const r of records) {
    if (!staffMap.has(r.staffName)) {
      staffMap.set(r.staffName, { name: r.staffName, department: r.department, jobTitle: r.jobTitle });
    }
  }
  const staffList = Array.from(staffMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Build lookup: staffName + category -> best record
  // Best = COMPLETED with latest completedDate, or EXEMPT, or PENDING
  type RecordRow = typeof records[0];
  const lookup = new Map<string, RecordRow>();
  for (const r of records) {
    const key = `${r.staffName}::${r.category}`;
    const existing = lookup.get(key);
    if (!existing) { lookup.set(key, r); continue; }
    // Prefer COMPLETED over others; then latest
    if (r.status === 'COMPLETED' && existing.status !== 'COMPLETED') { lookup.set(key, r); continue; }
    if (r.status === 'EXEMPT' && existing.status !== 'COMPLETED') { lookup.set(key, r); continue; }
    if (r.completedDate && existing.completedDate && r.completedDate > existing.completedDate) { lookup.set(key, r); }
  }

  function getCellStatus(staffName: string, category: string): CellStatus {
    const r = lookup.get(`${staffName}::${category}`);
    if (!r) return 'missing';
    if (r.status === 'EXEMPT') return 'exempt';
    if (r.expiryDate && isPast(r.expiryDate)) return 'expired';
    if (r.expiryDate && isWithinInterval(r.expiryDate, { start: now, end: in30 })) return 'expiring';
    if (r.status === 'COMPLETED') return 'ok';
    return 'missing';
  }

  // Overall stats
  let totalCells = 0; let okCells = 0; let expiredCells = 0; let expiringCells = 0;
  for (const s of staffList) {
    for (const cat of REQUIRED_CATEGORIES) {
      const st = getCellStatus(s.name, cat);
      totalCells++;
      if (st === 'ok') okCells++;
      if (st === 'expired') expiredCells++;
      if (st === 'expiring') expiringCells++;
    }
  }
  const compliancePct = totalCells > 0 ? Math.round((okCells / totalCells) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/trackers/training" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Training Tracker
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-teal-600" />
            Staff Competency Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Required training compliance across all staff &mdash; {staffList.length} staff, {REQUIRED_CATEGORIES.length} categories
          </p>
        </div>
        <Link
          href="/trackers/training/new"
          className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          Log Training
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className={`text-3xl font-bold ${compliancePct >= 90 ? 'text-emerald-400' : compliancePct >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
            {compliancePct}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Overall Compliance</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{okCells}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Current</p>
        </div>
        <div className={`rounded-xl border p-4 text-center ${expiringCells > 0 ? 'bg-amber-950/20 border-amber-700/30' : 'bg-card border-border'}`}>
          <p className={`text-3xl font-bold ${expiringCells > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>{expiringCells}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Expiring (30d)</p>
        </div>
        <div className={`rounded-xl border p-4 text-center ${expiredCells > 0 ? 'bg-red-950/20 border-red-700/30' : 'bg-card border-border'}`}>
          <p className={`text-3xl font-bold ${expiredCells > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>{expiredCells}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Expired / Missing</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center">
        {(Object.entries(CELL_CONFIG) as [CellStatus, typeof CELL_CONFIG[CellStatus]][]).map(([st, cfg]) => (
          <div key={st} className="flex items-center gap-1.5">
            <cfg.icon className={`w-3.5 h-3.5 ${cfg.text}`} />
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>

      {staffList.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No training records found.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Add training records to see the competency matrix.</p>
          <Link href="/trackers/training/new" className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg mt-4">
            Log First Training Record
          </Link>
        </div>
      ) : (
        /* Matrix table — horizontally scrollable */
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="text-xs min-w-max w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground sticky left-0 bg-card z-10 min-w-[180px]">
                  Staff Member
                </th>
                <th className="text-left px-3 py-3 font-semibold text-muted-foreground min-w-[80px]">Dept</th>
                {REQUIRED_CATEGORIES.map(cat => (
                  <th key={cat} className="px-2 py-3 font-semibold text-muted-foreground text-center min-w-[70px] max-w-[70px]">
                    <span className="block truncate">{CAT_LABEL[cat] ?? cat.replace(/_/g, ' ')}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {staffList.map(staff => {
                const staffStatuses = REQUIRED_CATEGORIES.map(cat => getCellStatus(staff.name, cat));
                const hasIssue = staffStatuses.some(s => s === 'expired' || s === 'missing');
                const hasWarning = staffStatuses.some(s => s === 'expiring');

                return (
                  <tr key={staff.name} className={`hover:bg-muted/20 transition-colors ${hasIssue ? 'bg-red-950/10' : hasWarning ? 'bg-amber-950/10' : ''}`}>
                    <td className="px-4 py-2.5 sticky left-0 bg-inherit z-10">
                      <div className="flex items-center gap-2">
                        {hasIssue && <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                        {!hasIssue && hasWarning && <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        <div>
                          <p className="font-medium text-foreground/90">{staff.name}</p>
                          {staff.jobTitle && <p className="text-muted-foreground/60 text-[10px]">{staff.jobTitle}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground/70">{staff.department ?? '—'}</td>
                    {REQUIRED_CATEGORIES.map(cat => {
                      const st = getCellStatus(staff.name, cat);
                      const cfg = CELL_CONFIG[st];
                      const record = lookup.get(`${staff.name}::${cat}`);
                      const href = record ? `/trackers/training/${record.id}` : `/trackers/training/new`;
                      return (
                        <td key={cat} className="px-2 py-2 text-center">
                          <Link
                            href={href}
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-opacity hover:opacity-70 ${cfg.bg}`}
                            title={`${staff.name} \u2014 ${CAT_LABEL[cat]}: ${cfg.label}`}
                          >
                            <cfg.icon className={`w-4 h-4 ${cfg.text}`} />
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
