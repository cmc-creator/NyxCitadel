import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, AlertTriangle, CheckCircle2, Clock,
  XCircle, ShieldOff, ArrowRight, Minus,
} from 'lucide-react';
import { isPast, isWithinInterval, addDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Training' };

const STATUS_CONFIG = {
  COMPLETED:   { label: 'Current',     cls: 'bg-emerald-950/40 text-emerald-400 border-emerald-700/30', icon: CheckCircle2 },
  PENDING:     { label: 'Pending',     cls: 'bg-slate-950/30 text-slate-400 border-slate-700/30',       icon: Clock },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-950/40 text-blue-400 border-blue-700/30',          icon: Clock },
  OVERDUE:     { label: 'Overdue',     cls: 'bg-red-950/40 text-red-400 border-red-700/30',             icon: XCircle },
  EXPIRED:     { label: 'Expired',     cls: 'bg-red-950/40 text-red-400 border-red-700/30',             icon: XCircle },
  EXEMPT:      { label: 'Exempt',      cls: 'bg-slate-950/20 text-slate-500 border-slate-700/20',       icon: Minus },
};

export default async function MyTrainingPage({
  searchParams,
}: {
  searchParams: { department?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { facilityId, role } = session.user;
  const sessionEmail = session.user.email ?? null;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'EDUCATION'].includes(role);
  const deptFilter = searchParams.department;

  const [records, userLockout, allDepts] = await Promise.all([
    prisma.trainingRecord.findMany({
      where: {
        facilityId,
        ...(isAdmin
          ? deptFilter ? { department: deptFilter } : {}
          : sessionEmail ? { staffEmail: sessionEmail } : { id: 'none' }),
      },
      orderBy: [{ isRequired: 'desc' }, { expiryDate: 'asc' }, { staffName: 'asc' }],
      select: {
        id: true, staffName: true, staffEmail: true, department: true,
        trainingName: true, category: true, status: true,
        expiryDate: true, completedDate: true, isRequired: true, provider: true,
      },
    }),
    !isAdmin && sessionEmail
      ? prisma.user.findFirst({
          where: { email: sessionEmail, facilityId },
          select: {
            scheduleBlocked: true,
            scheduleBlockedAt: true,
            scheduleBlockReason: true,
            scheduleOverrideNote: true,
          },
        })
      : Promise.resolve(null),
    isAdmin
      ? prisma.trainingRecord.findMany({
          where: { facilityId },
          select: { department: true },
          distinct: ['department'],
          orderBy: { department: 'asc' },
        })
      : Promise.resolve([]),
  ]);

  const now = new Date();
  const in30 = addDays(now, 30);
  const in63 = addDays(now, 63);

  const required = records.filter((r) => r.isRequired);
  const optional = records.filter((r) => !r.isRequired);

  const overdueCount = required.filter(
    (r) => r.expiryDate && isPast(r.expiryDate) && r.status !== 'EXEMPT'
  ).length;
  const expiringCount = required.filter(
    (r) =>
      r.expiryDate &&
      isWithinInterval(r.expiryDate, { start: now, end: in63 }) &&
      r.status !== 'COMPLETED' &&
      r.status !== 'EXEMPT'
  ).length;

  const departments = (allDepts as { department: string | null }[])
    .map((d) => d.department)
    .filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-teal-600" />
            {isAdmin ? 'Staff Training Records' : 'My Training'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin
              ? `${records.length} records${deptFilter ? ` \u00b7 ${deptFilter}` : ''}`
              : `${required.length} required \u00b7 ${optional.length} optional`}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link
              href="/trackers/training/compliance"
              className="inline-flex items-center gap-1.5 text-sm border border-red-700/40 text-red-400 hover:bg-red-950/30 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <ShieldOff className="w-3.5 h-3.5" /> Lockout Dashboard
            </Link>
            <Link
              href="/trackers/training"
              className="inline-flex items-center gap-1.5 text-sm border border-border hover:bg-muted/30 text-foreground/80 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Full Tracker <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Lockout banner */}
      {userLockout?.scheduleBlocked && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-xl px-5 py-4">
          <div className="flex items-start gap-3">
            <ShieldOff className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300">Your Scheduling Access is Blocked</p>
              <p className="text-sm text-red-400/80 mt-0.5">
                {userLockout.scheduleBlockReason ?? 'Required training is past due.'}
                {userLockout.scheduleOverrideNote && (
                  <span className="ml-2 text-amber-400">(HR temporary override is active)</span>
                )}
              </p>
              <p className="text-xs text-red-500/70 mt-1">
                Complete all overdue required training below to restore access automatically.
                Contact HR if you need an emergency override.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* At-risk warning */}
      {!userLockout?.scheduleBlocked && expiringCount > 0 && (
        <div className="bg-amber-950/20 border border-amber-700/40 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            <span className="font-semibold">
              {expiringCount} required training{expiringCount !== 1 ? 's' : ''} due within 63 days.
            </span>{' '}
            Non-completion triggers an automatic scheduling lockout.
          </p>
        </div>
      )}

      {/* Dept filter (admin) */}
      {isAdmin && departments.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/education/training"
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${!deptFilter ? 'bg-teal-600 text-white border-teal-600' : 'border-border text-muted-foreground hover:border-teal-600/50 hover:text-foreground'}`}
          >
            All Departments
          </Link>
          {departments.map((dept) => (
            <Link
              key={dept}
              href={`/education/training?department=${encodeURIComponent(dept)}`}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${deptFilter === dept ? 'bg-teal-600 text-white border-teal-600' : 'border-border text-muted-foreground hover:border-teal-600/50 hover:text-foreground'}`}
            >
              {dept}
            </Link>
          ))}
        </div>
      )}

      {/* Required training */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Required Training</h2>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              {overdueCount > 0 ? `${overdueCount} overdue \u2014 ` : ''}
              completion required to maintain scheduling access
            </p>
          </div>
          {overdueCount > 0 && <AlertTriangle className="w-4 h-4 text-red-400" />}
        </div>

        {required.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground/60">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-teal-500" />
            No required training records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/30">
                <tr>
                  {isAdmin && <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Staff</th>}
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Training</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Expires</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Time Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {required.map((r) => {
                  const isExpiredRow = r.expiryDate && isPast(r.expiryDate) && r.status !== 'EXEMPT';
                  const isExpiringRow = r.expiryDate && isWithinInterval(r.expiryDate, { start: now, end: in30 }) && r.status !== 'EXEMPT';
                  const daysLeft = r.expiryDate
                    ? Math.ceil((new Date(r.expiryDate).getTime() - now.getTime()) / 86400000)
                    : null;
                  const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <tr key={r.id} className={`hover:bg-muted/20 ${isExpiredRow ? 'bg-red-950/10' : isExpiringRow ? 'bg-amber-950/10' : ''}`}>
                      {isAdmin && (
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground/90">{r.staffName}</p>
                          {r.staffEmail && <p className="text-xs text-muted-foreground">{r.staffEmail}</p>}
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <Link href={`/trackers/training/${r.id}`} className="font-medium text-foreground/90 hover:text-teal-400 transition-colors">
                          {r.trainingName}
                        </Link>
                        {r.provider && <p className="text-xs text-muted-foreground">{r.provider}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.category.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${cfg.cls}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '\u2014'}
                      </td>
                      <td className="px-4 py-3">
                        {daysLeft !== null ? (
                          <span className={`text-sm font-semibold ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 15 ? 'text-red-400' : daysLeft <= 30 ? 'text-amber-400' : daysLeft <= 63 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`}
                          </span>
                        ) : '\u2014'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Optional/additional training */}
      {optional.length > 0 && (
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Additional Training</h2>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{optional.length} optional / elective records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/30">
                <tr>
                  {isAdmin && <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Staff</th>}
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Training</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {optional.map((r) => {
                  const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <tr key={r.id} className="hover:bg-muted/20">
                      {isAdmin && (
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground/90">{r.staffName}</p>
                          {r.staffEmail && <p className="text-xs text-muted-foreground">{r.staffEmail}</p>}
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <Link href={`/trackers/training/${r.id}`} className="font-medium text-foreground/90 hover:text-teal-400 transition-colors">
                          {r.trainingName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.category.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${cfg.cls}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.completedDate ? new Date(r.completedDate).toLocaleDateString() : '\u2014'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {records.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No training records found.</p>
          {isAdmin && (
            <Link href="/trackers/training/new" className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg mt-4">
              Add Training Record
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
