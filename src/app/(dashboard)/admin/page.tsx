import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import {
  Users,
  Building2,
  ShieldCheck,
  Activity,
  ClipboardList,
  FileWarning,
  ShieldOff,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { RunAlertsNowButton } from '@/components/admin/RunAlertsNowButton';
import { AutomationStatusCard } from '@/components/admin/AutomationStatusCard';
import { ExportDeliveryListCard } from '@/components/admin/ExportDeliveryListCard';
import { ResetDemoDataButton } from '@/components/admin/ResetDemoDataButton';
import { RunWeeklyExportsButton } from '@/components/admin/RunWeeklyExportsButton';
import { QuickAddUserButton } from '@/components/admin/QuickAddUserButton';
import { AdminQuickActionsToolbar } from '@/components/admin/AdminQuickActionsToolbar';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Panel' };

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  RISK_MANAGER: 'Risk Manager',
  EM_COORDINATOR: 'EM Coordinator',
  QUALITY: 'Quality',
  EDUCATION: 'Education',
  STAFF: 'Staff',
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN';
  const demoToolsEnabled = process.env.ENABLE_DEMO_TOOLS === 'true';

  const [users, facilities] = await Promise.all([
    prisma.user.findMany({
      where: isSuperAdmin ? undefined : { facilityId: session.user.facilityId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        scheduleBlocked: true,
        scheduleBlockedAt: true,
        facility: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.facility.findMany({
      where: isSuperAdmin ? undefined : { id: session.user.facilityId },
      select: {
        id: true,
        name: true,
        facilityType: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            complianceItems: true,
            capItems: true,
            incidentReports: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const activeUsers = users.filter((u) => u.isActive).length;
  const totalFacilities = facilities.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            Admin Control Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isSuperAdmin ? 'All facilities · Super Admin view' : 'Your facility · Admin view'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <QuickAddUserButton />
          <RunAlertsNowButton />
          <RunWeeklyExportsButton />
          <div className="flex items-center gap-2">
            <Link href="/admin/audit-log" className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium px-3 py-2 rounded-xl transition">
              Audit Log
            </Link>
            <Link href="/admin/pilot-kpis" className="inline-flex items-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-medium px-3 py-2 rounded-xl transition">
              Pilot KPIs
            </Link>
          </div>
          {isSuperAdmin && (
            <Link href="/admin/facilities/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-xl transition">
              + New Facility
            </Link>
          )}
          {demoToolsEnabled && <ResetDemoDataButton />}
        </div>
      </div>

      <AdminQuickActionsToolbar />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <AutomationStatusCard />
        <ExportDeliveryListCard />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Users</p>
              <p className="text-3xl font-bold text-teal-400 mt-1">{users.length}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{activeUsers} active</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-950/40 ring-1 ring-teal-800/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Facilities</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{totalFacilities}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{facilities.filter((f) => f.isActive).length} active</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-950/40 ring-1 ring-blue-800/40 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total CAPs</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">
                {facilities.reduce((s, f) => s + f._count.capItems, 0)}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Across all facilities</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-950/40 ring-1 ring-amber-800/40 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">IR Reports</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {facilities.reduce((s, f) => s + f._count.incidentReports, 0)}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Across all facilities</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-950/40 ring-1 ring-red-800/40 flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Facilities table */}
      {isSuperAdmin && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
            <Building2 className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-foreground">All Facilities</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Facility</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Type</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">Users</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">CAPs</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">IR Reports</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Created</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {facilities.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground/90">{f.name}</td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">{f.facilityType.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-3 text-center text-foreground/70">{f._count.users}</td>
                    <td className="px-3 py-3 text-center text-foreground/70">{f._count.capItems}</td>
                    <td className="px-3 py-3 text-center text-foreground/70">{f._count.incidentReports}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{formatDate(f.createdAt, 'MMM d, yyyy')}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${f.isActive ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-red-950/40 text-red-400 border border-red-800/40'}`}>
                        {f.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {facilities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No facilities found.</p>
            )}
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-semibold text-foreground">
              {isSuperAdmin ? 'All Users' : 'Facility Users'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <QuickAddUserButton />
            <Link href="/settings/users" className="text-xs text-teal-400 hover:underline">
              Manage users →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Email</th>
                {isSuperAdmin && <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Facility</th>}
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Last login</th>
                <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">Sched. Lockout</th>
                <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground/90">{u.name ?? '-'}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{u.email}</td>
                  {isSuperAdmin && (
                    <td className="px-3 py-3 text-xs text-muted-foreground">{u.facility.name}</td>
                  )}
                  <td className="px-3 py-3">
                    <span className="text-xs bg-teal-950/40 text-teal-300 border border-teal-800/40 px-2 py-0.5 rounded-full">
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {u.lastLoginAt ? formatDate(u.lastLoginAt, 'MMM d, yyyy') : 'Never'}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {u.scheduleBlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-800/40">
                        <ShieldOff className="w-3 h-3" /> Locked
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/30"> - </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-red-950/40 text-red-400 border border-red-800/40'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
          )}
        </div>
      </div>

      {/* Activity note */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Platform Activity</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Detailed audit logs are tracked per user. View the{' '}
          <Link href="/admin/audit-log" className="text-teal-400 hover:underline">Audit Log</Link>{' '}
          for a full history of changes, or visit{' '}
          <Link href="/settings" className="text-teal-400 hover:underline">Settings</Link>{' '}
          to manage notification preferences and integrations.
        </p>
      </div>
    </div>
  );
}
