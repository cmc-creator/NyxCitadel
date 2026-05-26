'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, UserX, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { ComplianceLockoutOverrideButton } from '@/components/trackers/ComplianceLockoutOverrideButton';

interface BlockedUser {
  id: string;
  name: string | null;
  email: string;
  department: string | null;
  scheduleBlockedAt: string | null;
  scheduleBlockReason: string | null;
  scheduleOverrideNote: string | null;
}

interface AtRiskRecord {
  id: string;
  staffName: string;
  staffEmail: string | null;
  department: string | null;
  trainingName: string;
  status: string;
  expiryDate: string | null;
}

interface GatekeeperData {
  blockedUsers: BlockedUser[];
  atRiskRecords: AtRiskRecord[];
  activeOverrides: number;
  compliancePct: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  OVERDUE: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-red-100 text-red-700',
};

export default function ComplianceGatekeeperPage() {
  const [data, setData] = useState<GatekeeperData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/training/compliance-lockout');
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = [
    { label: 'Scheduling Lockouts', value: data?.blockedUsers.length ?? 0, icon: UserX, color: 'text-red-500', bg: 'bg-red-950/20' },
    { label: 'At-Risk Staff', value: data?.atRiskRecords.length ?? 0, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/20' },
    { label: 'Facility Compliance', value: `${data?.compliancePct ?? 0}%`, icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-950/20' },
    { label: 'Active Overrides', value: data?.activeOverrides ?? 0, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-950/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/trackers/training" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Training &amp; Competency
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Compliance Gatekeeper
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Automated scheduling lockout enforcement for required training compliance
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} border border-border rounded-xl px-5 py-4`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Scheduling Lockouts */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border/30">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <UserX className="w-3.5 h-3.5 text-red-500" /> Scheduling Lockouts
          </h2>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Staff blocked from active scheduling due to incomplete required training
          </p>
        </div>
        {loading ? (
          <div className="px-5 py-6 text-sm text-muted-foreground/50">Loading...</div>
        ) : !data?.blockedUsers.length ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground/60">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-teal-500" />
            No staff currently locked out.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Staff Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Blocked</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reason</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data.blockedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-5 py-4">
                    <div className="font-medium text-foreground/90">{u.name ?? u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{u.department ?? '—'}</td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">
                    {u.scheduleBlockedAt ? new Date(u.scheduleBlockedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground max-w-xs truncate">{u.scheduleBlockReason ?? '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <ComplianceLockoutOverrideButton
                      userId={u.id}
                      userName={u.name ?? u.email}
                      onSuccess={load}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* At-Risk Staff */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border/30">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> At-Risk Staff
          </h2>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Required training due within 63 days — non-completion triggers lockout
          </p>
        </div>
        {loading ? (
          <div className="px-5 py-6 text-sm text-muted-foreground/50">Loading...</div>
        ) : !data?.atRiskRecords.length ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground/60">
            No at-risk training records found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Staff Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Training Module</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data.atRiskRecords.map((r) => {
                const daysLeft = r.expiryDate
                  ? Math.ceil((new Date(r.expiryDate).getTime() - Date.now()) / 86400000)
                  : null;
                return (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground/90 text-sm">{r.staffName}</div>
                      {r.staffEmail && <div className="text-xs text-muted-foreground">{r.staffEmail}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.department ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-foreground/80">{r.trainingName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[r.status] ?? 'bg-muted/30 text-muted-foreground'}`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {daysLeft !== null ? (
                        <span className={`text-sm font-semibold ${daysLeft <= 15 ? 'text-red-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                          {daysLeft}d
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
