import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  LayoutGrid,
  ClipboardList,
  ShieldAlert,
  MessageSquareWarning,
  FileWarning,
  Scale,
  BookOpen,
  GraduationCap,
  CheckSquare,
  HeartPulse,
  Search,
  ChevronRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Trackers' };

export default async function TrackersPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    openCaps,
    openGrievances,
    openIncidents,
    openIrIad,
    openQoc,
    openRca,
    openRisk,
    activeTraining,
    openCompliance,
    totalPolicies,
  ] = await Promise.all([
    prisma.correctiveActionPlan.count({
      where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
    }),
    prisma.grievanceRecord.count({
      where: { facilityId, status: { notIn: ['RESOLVED', 'CLOSED'] } },
    }),
    prisma.incident.count({
      where: { facilityId, status: { not: 'CLOSED' } },
    }),
    prisma.incidentReport.count({
      where: { facilityId, status: { notIn: ['CLOSED'] } },
    }),
    prisma.qocComplaint.count({
      where: { facilityId, status: { not: 'CLOSED' } },
    }),
    prisma.rootCauseAnalysis.count({
      where: { facilityId, status: { not: 'CLOSED' } },
    }),
    prisma.riskAssessment.count({
      where: { facilityId },
    }),
    prisma.trainingRecord.count({
      where: { facilityId, status: { in: ['OVERDUE', 'EXPIRED'] } },
    }),
    prisma.complianceItem.count({
      where: { facilityId, status: { notIn: ['COMPLIANT', 'WAIVED', 'NA'] } },
    }),
    prisma.policy.count({
      where: { facilityId },
    }),
  ]);

  const totalOpen = openCaps + openGrievances + openIncidents + openIrIad + openQoc + openRca;

  const modules = [
    {
      href: '/trackers/caps',
      icon: ClipboardList,
      label: 'Corrective Action Plans',
      desc: 'Track findings, corrective actions, and deadlines',
      color: 'text-amber-400',
      ring: 'ring-amber-800/40',
      bg: 'bg-amber-950/30',
      badge: openCaps,
      badgeColor: openCaps > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-700/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-700/40',
    },
    {
      href: '/trackers/compliance',
      icon: CheckSquare,
      label: 'Compliance Items',
      desc: 'Monitor ongoing compliance obligations',
      color: 'text-teal-400',
      ring: 'ring-teal-800/40',
      bg: 'bg-teal-950/30',
      badge: openCompliance,
      badgeColor: openCompliance > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-700/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-700/40',
    },
    {
      href: '/trackers/grievances',
      icon: MessageSquareWarning,
      label: 'Patient Grievances',
      desc: 'Patient complaints, investigations, and resolution',
      color: 'text-rose-400',
      ring: 'ring-rose-800/40',
      bg: 'bg-rose-950/30',
      badge: openGrievances,
      badgeColor: openGrievances > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-700/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-700/40',
    },
    {
      href: '/trackers/incidents',
      icon: ShieldAlert,
      label: 'Incidents',
      desc: 'Internal safety incidents and near misses',
      color: 'text-orange-400',
      ring: 'ring-orange-800/40',
      bg: 'bg-orange-950/30',
      badge: openIncidents,
      badgeColor: openIncidents > 0 ? 'bg-orange-500/20 text-orange-300 border-orange-700/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-700/40',
    },
    {
      href: '/trackers/ir-iad',
      icon: FileWarning,
      label: 'IR / IAD Reports',
      desc: 'Incident reports and immediate action decisions',
      color: 'text-red-400',
      ring: 'ring-red-800/40',
      bg: 'bg-red-950/30',
      badge: openIrIad,
      badgeColor: openIrIad > 0 ? 'bg-red-500/20 text-red-300 border-red-700/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-700/40',
    },
    {
      href: '/trackers/policies',
      icon: BookOpen,
      label: 'Policy Library',
      desc: `${totalPolicies} policies · approval workflows and versioning`,
      color: 'text-blue-400',
      ring: 'ring-blue-800/40',
      bg: 'bg-blue-950/30',
      badge: null,
      badgeColor: '',
    },
    {
      href: '/trackers/qoc',
      icon: HeartPulse,
      label: 'Quality of Care Complaints',
      desc: 'QoC complaints, investigations, and outcomes',
      color: 'text-purple-400',
      ring: 'ring-purple-800/40',
      bg: 'bg-purple-950/30',
      badge: openQoc,
      badgeColor: openQoc > 0 ? 'bg-purple-500/20 text-purple-300 border-purple-700/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-700/40',
    },
    {
      href: '/trackers/rca',
      icon: Search,
      label: 'Root Cause Analysis',
      desc: 'Formal RCA investigations and action tracking',
      color: 'text-cyan-400',
      ring: 'ring-cyan-800/40',
      bg: 'bg-cyan-950/30',
      badge: openRca,
      badgeColor: openRca > 0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-700/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-700/40',
    },
    {
      href: '/trackers/risk-assessments',
      icon: Scale,
      label: 'Risk Assessments',
      desc: `${openRisk} total assessments · risk scoring and mitigation`,
      color: 'text-indigo-400',
      ring: 'ring-indigo-800/40',
      bg: 'bg-indigo-950/30',
      badge: null,
      badgeColor: '',
    },
    {
      href: '/trackers/training',
      icon: GraduationCap,
      label: 'Staff Training',
      desc: 'Compliance training records and overdue/expired tracking',
      color: 'text-green-400',
      ring: 'ring-green-800/40',
      bg: 'bg-green-950/30',
      badge: activeTraining,
      badgeColor: activeTraining > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-700/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-700/40',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <LayoutGrid className="w-5 h-5 text-teal-400" />
        <h1 className="text-xl font-bold text-white">Trackers</h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Action Items', value: totalOpen, color: totalOpen > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Open Grievances', value: openGrievances, color: openGrievances > 0 ? 'text-rose-400' : 'text-emerald-400' },
          { label: 'Open IR / IAD', value: openIrIad, color: openIrIad > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Overdue / Expired Training', value: activeTraining, color: activeTraining > 0 ? 'text-amber-400' : 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-muted-foreground/70 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-xl border border-white/10 bg-slate-800/50 hover:bg-slate-700/50 p-5 flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${m.bg} ring-1 ${m.ring} flex items-center justify-center shrink-0`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <div>
                <p className="font-semibold text-white">{m.label}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{m.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              {m.badge !== null && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                  {m.badge} open
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
