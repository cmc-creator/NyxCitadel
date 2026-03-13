import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  Wrench,
  ClipboardList,
  Flame,
  Zap,
  Lock,
  Wind,
  ActivitySquare,
  ChevronRight,
  CircleAlert,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Penalise score for each open deficiency by severity; subtract 10pts per overdue equipment PM. */
function calcScore(defs: any[], overdueEquip: number): number {
  let score = 100;
  for (const d of defs) {
    switch (d.severity) {
      case 'IMMEDIATE_JEOPARDY': score -= 25; break;
      case 'HIGH':               score -= 12; break;
      case 'MEDIUM':             score -= 6;  break;
      case 'LOW':                score -= 3;  break;
      default:                   score -= 1;
    }
  }
  score -= overdueEquip * 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreBar(s: number) {
  return s >= 85 ? 'bg-emerald-500' : s >= 70 ? 'bg-amber-500' : 'bg-red-500';
}

const severityBadge: Record<string, string> = {
  IMMEDIATE_JEOPARDY: 'bg-red-950/60 text-red-300 border border-red-600/40',
  HIGH: 'bg-orange-950/60 text-orange-300 border border-orange-600/40',
  MEDIUM: 'bg-amber-950/60 text-amber-300 border border-amber-600/40',
  LOW: 'bg-slate-700/60 text-slate-300 border border-slate-600/40',
  OBSERVATION: 'bg-slate-800/60 text-slate-400 border border-slate-600/40',
};

const statusBadge: Record<string, string> = {
  OPEN: 'bg-red-950/40 text-red-400',
  IN_PROGRESS: 'bg-amber-950/40 text-amber-400',
  RESOLVED: 'bg-emerald-950/40 text-emerald-400',
  VERIFIED: 'bg-sky-950/40 text-sky-400',
};

const pmStatusBadge: Record<string, string> = {
  OVERDUE: 'bg-red-950/40 text-red-400',
  DUE_SOON: 'bg-amber-950/40 text-amber-400',
  UPCOMING: 'bg-sky-950/40 text-sky-400',
  IN_PROGRESS: 'bg-purple-950/40 text-purple-400',
  COMPLETED: 'bg-emerald-950/40 text-emerald-400',
};

const modules = [
  {
    href: '/eoc/ligature',
    icon: CircleAlert,
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-700/40',
    label: 'Ligature Risk',
    desc: 'Room-by-room anchor point tracking and mitigation plans',
    badge: 'TJC EC.02.06.01',
    badgeColor: 'bg-amber-950/60 text-amber-300 border border-amber-700/40',
  },
  {
    href: '/eoc/rounds',
    icon: ClipboardList,
    color: 'text-sky-400',
    bg: 'bg-sky-950/40',
    border: 'border-sky-700/40',
    label: 'Safety Rounds',
    desc: 'Scheduled life safety and environment rounds with findings log',
    badge: 'Monthly',
    badgeColor: 'bg-sky-950/60 text-sky-300 border border-sky-700/40',
  },
  {
    href: '/eoc/deficiencies',
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-950/40',
    border: 'border-red-700/40',
    label: 'Deficiency Tracker',
    desc: 'Log, assign, and resolve all environment-of-care findings',
    badge: 'View Open',
    badgeColor: 'bg-red-950/60 text-red-300 border border-red-700/40',
  },
  {
    href: '/eoc/equipment',
    icon: Wrench,
    color: 'text-purple-400',
    bg: 'bg-purple-950/40',
    border: 'border-purple-700/40',
    label: 'Equipment PM',
    desc: 'Preventive maintenance schedules for fire, HVAC, utilities',
    badge: 'View Schedule',
    badgeColor: 'bg-purple-950/60 text-purple-300 border border-purple-700/40',
  },
];

export default async function EocOverviewPage() {
  const session = await auth();
  const facilityId = session?.user?.facilityId ?? '';
  const now = new Date();

  const [
    openDefs,
    immediateDefs,
    ligatureOpen,
    pmDue,
    lastRound,
    recentDefs,
    upcomingPm,
  ] = await Promise.all([
    prisma.eocDeficiency.count({
      where: { facilityId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    }),
    prisma.eocDeficiency.count({
      where: {
        facilityId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        severity: { in: ['IMMEDIATE_JEOPARDY', 'HIGH'] },
      },
    }),
    prisma.ligatureRiskItem.count({
      where: { facilityId, status: { in: ['OPEN', 'IN_MITIGATION'] } },
    }),
    prisma.equipmentPm.count({
      where: { facilityId, status: { in: ['OVERDUE', 'DUE_SOON'] } },
    }),
    prisma.eocRound.findFirst({
      where: { facilityId },
      orderBy: { conductedDate: 'desc' },
    }),
    prisma.eocDeficiency.findMany({
      where: { facilityId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        defNumber: true,
        location: true,
        severity: true,
        status: true,
        dueDate: true,
        assignedTo: true,
        description: true,
        createdAt: true,
      },
    }),
    prisma.equipmentPm.findMany({
      where: { facilityId, status: { in: ['OVERDUE', 'DUE_SOON', 'UPCOMING'] } },
      orderBy: { nextServiceDate: 'asc' },
      take: 5,
      select: {
        id: true,
        equipmentName: true,
        location: true,
        status: true,
        nextServiceDate: true,
        vendor: true,
        category: true,
      },
    }),
  ]);

  const daysSinceRound = lastRound
    ? Math.floor((now.getTime() - new Date(lastRound.conductedDate).getTime()) / 86_400_000)
    : null;

  // ── Program health: live DB queries ─────────────────────────────────────────
  const [
    fireDefs, utilDefs, secDefs, ligDefs,
    fireEquipOvd, hvacEquipOvd, utilEquipOvd, secEquipOvd,
    ligatureTotal, roundsLast90,
  ] = await Promise.all([
    prisma.eocDeficiency.findMany({
      where: { facilityId, category: 'FIRE_SAFETY', status: { in: ['OPEN', 'IN_PROGRESS'] } },
      select: { severity: true },
    }),
    prisma.eocDeficiency.findMany({
      where: { facilityId, category: 'UTILITIES', status: { in: ['OPEN', 'IN_PROGRESS'] } },
      select: { severity: true },
    }),
    prisma.eocDeficiency.findMany({
      where: { facilityId, category: 'SECURITY', status: { in: ['OPEN', 'IN_PROGRESS'] } },
      select: { severity: true },
    }),
    prisma.eocDeficiency.findMany({
      where: { facilityId, category: 'LIGATURE_RISK', status: { in: ['OPEN', 'IN_PROGRESS'] } },
      select: { severity: true },
    }),
    prisma.equipmentPm.count({
      where: { facilityId, category: { in: ['FIRE_SUPPRESSION', 'FIRE_ALARM'] as any }, status: 'OVERDUE' },
    }),
    prisma.equipmentPm.count({
      where: { facilityId, category: 'HVAC' as any, status: 'OVERDUE' },
    }),
    prisma.equipmentPm.count({
      where: { facilityId, category: { in: ['GENERATOR', 'ELECTRICAL', 'PLUMBING', 'MEDICAL_GAS', 'ELEVATOR'] as any }, status: 'OVERDUE' },
    }),
    prisma.equipmentPm.count({
      where: { facilityId, category: 'SECURITY_SYSTEM' as any, status: 'OVERDUE' },
    }),
    prisma.ligatureRiskItem.count({ where: { facilityId } }),
    prisma.eocRound.count({
      where: {
        facilityId,
        conductedDate: { gte: new Date(now.getTime() - 90 * 86_400_000) },
        status: { in: ['COMPLETED', 'REVIEWED', 'APPROVED'] },
      },
    }),
  ]);

  const fireSc  = calcScore(fireDefs, fireEquipOvd);
  const roundSc = roundsLast90 >= 3 ? 100 : roundsLast90 === 2 ? 82 : roundsLast90 === 1 ? 58 : 20;
  const utilSc  = calcScore(utilDefs, utilEquipOvd);
  const secSc   = calcScore(secDefs, secEquipOvd);
  const ligSc   = ligatureTotal === 0 ? 100 : Math.max(0, Math.round((1 - ligatureOpen / ligatureTotal) * 100));
  const hvacSc  = calcScore([], hvacEquipOvd);

  const eocProgramStatus = [
    { label: 'Fire Safety',          icon: Flame,          score: fireSc,  color: scoreBar(fireSc) },
    { label: 'Life Safety Rounds',   icon: ActivitySquare, score: roundSc, color: scoreBar(roundSc) },
    { label: 'Utilities Management', icon: Zap,            score: utilSc,  color: scoreBar(utilSc) },
    { label: 'Security Program',     icon: Lock,           score: secSc,   color: scoreBar(secSc) },
    { label: 'Ligature Risk',        icon: CircleAlert,    score: ligSc,   color: scoreBar(ligSc) },
    { label: 'HVAC / Air Quality',   icon: Wind,           score: hvacSc,  color: scoreBar(hvacSc) },
  ];
  const overallScore = Math.round(eocProgramStatus.reduce((a, p) => a + p.score, 0) / eocProgramStatus.length);
  const lowestCat    = eocProgramStatus.reduce((a, b) => (b.score < a.score ? b : a), eocProgramStatus[0]);
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Environment of Care</h1>
          <p className="text-sm text-slate-400 mt-1">
            Life safety, ligature risk, physical environment, and equipment maintenance
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/eoc/rounds/new"
            className="px-3 py-1.5 text-sm rounded-md bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
          >
            + New Round
          </Link>
          <Link
            href="/eoc/deficiencies/new"
            className="px-3 py-1.5 text-sm rounded-md bg-card border border-border hover:border-red-500/50 text-foreground font-medium transition-colors"
          >
            Log Deficiency
          </Link>
        </div>
      </div>

      {/* TJC banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-950/30 border border-amber-700/40">
        <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-semibold text-amber-300">Joint Commission Environment of Care standards</span>
          <span className="text-amber-300/80"> — EC.01 through EC.04, LS chapters. Next full EOC survey window: </span>
          <span className="font-semibold text-amber-300">May 2026 (estimated).</span>
          <span className="text-amber-300/80"> Ligature risk findings require time-limited plans of correction within 45 days.</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/eoc/deficiencies"
          className="p-4 rounded-xl border border-red-700/40 bg-red-950/40 hover:brightness-110 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Open Deficiencies</p>
              <p className="text-3xl font-bold text-red-400">{openDefs}</p>
              <p className="text-xs text-slate-500 mt-1">{immediateDefs} immediate / high severity</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-400 opacity-80" />
          </div>
        </Link>

        <Link
          href="/eoc/ligature"
          className="p-4 rounded-xl border border-amber-700/40 bg-amber-950/40 hover:brightness-110 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Ligature Items Open</p>
              <p className="text-3xl font-bold text-amber-400">{ligatureOpen}</p>
              <p className="text-xs text-slate-500 mt-1">open or in mitigation</p>
            </div>
            <CircleAlert className="w-5 h-5 text-amber-400 opacity-80" />
          </div>
        </Link>

        <Link
          href="/eoc/equipment"
          className="p-4 rounded-xl border border-orange-700/40 bg-orange-950/40 hover:brightness-110 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Equipment PM Due</p>
              <p className="text-3xl font-bold text-orange-400">{pmDue}</p>
              <p className="text-xs text-slate-500 mt-1">overdue or due soon</p>
            </div>
            <Wrench className="w-5 h-5 text-orange-400 opacity-80" />
          </div>
        </Link>

        <Link
          href="/eoc/rounds"
          className="p-4 rounded-xl border border-emerald-700/40 bg-emerald-950/40 hover:brightness-110 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Days Since Last Round</p>
              <p className="text-3xl font-bold text-emerald-400">
                {daysSinceRound !== null ? daysSinceRound : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {lastRound ? `Last: ${new Date(lastRound.conductedDate).toLocaleDateString()}` : 'No rounds recorded'}
              </p>
            </div>
            <ClipboardList className="w-5 h-5 text-emerald-400 opacity-80" />
          </div>
        </Link>
      </div>

      {/* Module cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">EOC Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="p-4 rounded-xl bg-card border border-border hover:border-slate-500/50 transition-all group flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${m.bg} border ${m.border}`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{m.label}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.desc}</p>
              </div>
              <span className={`self-start text-xs px-2 py-0.5 rounded-full font-medium ${m.badgeColor}`}>
                {m.badge}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom split: program health + recent findings */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* EOC Program Health */}
        <div className="xl:col-span-2 bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">EOC Program Health</h2>
          <div className="space-y-3">
            {eocProgramStatus.map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p.icon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-300">{p.label}</span>
                  </div>
                  <span className={`text-xs font-semibold ${p.score >= 85 ? 'text-emerald-400' : p.score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {p.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${p.color}`}
                    style={{ width: `${p.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Overall EOC Score</span>
              <span className={`text-sm font-bold ${
                overallScore >= 85 ? 'text-emerald-400' : overallScore >= 70 ? 'text-amber-400' : 'text-red-400'
              }`}>{overallScore}%</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {lowestCat.score < 85 ? `${lowestCat.label} is pulling the score down.` : 'All programs performing well.'} Target: 95%
            </p>
          </div>
        </div>

        {/* Recent Deficiencies */}
        <div className="xl:col-span-3 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Deficiencies</h2>
            <Link href="/eoc/deficiencies" className="text-xs text-purple-400 hover:text-purple-300">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentDefs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No open deficiencies — great work!</p>
            ) : (
              recentDefs.map((d) => {
                const daysOpen = Math.floor(
                  (now.getTime() - new Date(d.createdAt).getTime()) / 86_400_000
                );
                return (
                  <div
                    key={d.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-slate-900/60 border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-500">{d.defNumber}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${severityBadge[d.severity] ?? ''}`}>
                          {d.severity.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-0.5 truncate">{d.description}</p>
                      <p className="text-xs text-slate-500">{d.location}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[d.status] ?? ''}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-600">{daysOpen}d open</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Equipment PM */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Upcoming Equipment PM</h2>
          <Link href="/eoc/equipment" className="text-xs text-purple-400 hover:text-purple-300">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-border/50">
                <th className="text-left pb-2 font-medium">Equipment</th>
                <th className="text-left pb-2 font-medium">Category</th>
                <th className="text-left pb-2 font-medium">Due Date</th>
                <th className="text-left pb-2 font-medium">Vendor</th>
                <th className="text-left pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {upcomingPm.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-slate-500">
                    No upcoming PM items
                  </td>
                </tr>
              ) : (
                upcomingPm.map((e) => (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-4">
                      <p className="text-foreground font-medium text-xs">{e.equipmentName}</p>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs text-slate-400">{e.category.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`text-xs font-medium ${
                          e.status === 'OVERDUE'
                            ? 'text-red-400'
                            : e.status === 'DUE_SOON'
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {new Date(e.nextServiceDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs text-slate-500">{e.vendor ?? '—'}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pmStatusBadge[e.status] ?? ''}`}>
                        {e.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulatory refs footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { std: 'EC.01.01.01', desc: 'EOC Program Management' },
          { std: 'EC.02.06.01', desc: 'Psychiatric Ligature Risk' },
          { std: 'LS.02.01.20', desc: 'Life Safety Code' },
          { std: 'EC.02.05.01', desc: 'Utilities Management' },
        ].map((r) => (
          <div key={r.std} className="p-3 rounded-lg bg-slate-900/40 border border-border/50">
            <p className="text-xs font-mono font-semibold text-purple-400">{r.std}</p>
            <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
