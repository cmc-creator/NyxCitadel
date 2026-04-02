import Link from 'next/link';
import { Pill, AlertTriangle, ChevronRight, CheckCircle, Clipboard } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PharmacyPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [csDiscrepancies, highAlertThisMonth, pdmpThisMonth] = await Promise.all([
    prisma.controlledSubstanceLog.count({ where: { facilityId, status: 'DISCREPANCY_OPEN' } }),
    prisma.highAlertMedAudit.count({ where: { facilityId, auditDate: { gte: firstOfMonth } } }),
    prisma.pdmpCheck.count({ where: { facilityId, checkDate: { gte: firstOfMonth } } }),
  ]);

  const subModules = [
    {
      href: '/pharmacy/controlled-substances',
      title: 'Controlled Substance Log',
      description: 'Shift count verification, waste reconciliation, discrepancy tracking, and DEA reporting.',
      icon: '💊', badge: 'DEA Schedule II–V', badgeColor: 'bg-red-100 text-red-700',
      stat: csDiscrepancies > 0 ? `${csDiscrepancies} Open Discrepancies` : '0 Open Discrepancies',
      statColor: csDiscrepancies > 0 ? 'text-red-400' : 'text-emerald-400',
    },
    {
      href: '/pharmacy/high-alert',
      title: 'High-Alert Med Audits',
      description: 'ISMP high-alert medications — storage, labeling, double-check compliance audits.',
      icon: '⚠️', badge: 'ISMP / TJC MM', badgeColor: 'bg-amber-100 text-amber-700',
      stat: `${highAlertThisMonth} Audits This Month`, statColor: 'text-amber-400',
    },
    {
      href: '/pharmacy/pdmp',
      title: 'PDMP Check Log',
      description: 'Prescription Drug Monitoring Program — compliance log for Arizona mandatory PDMP checks.',
      icon: '🔍', badge: 'ARS §36-2606', badgeColor: 'bg-blue-100 text-blue-700',
      stat: `${pdmpThisMonth} Checks This Month`, statColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Pill className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Medication Management</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">CMS MM CoP</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">TJC MM.04</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Controlled substance reconciliation, high-alert medication audits, PDMP compliance, and P&T committee records.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'CS Discrepancies Open',        value: csDiscrepancies,    icon: Clipboard,    color: csDiscrepancies > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'High-Alert Audits This Month',  value: highAlertThisMonth, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'PDMP Checks This Month',        value: pdmpThisMonth,      icon: CheckCircle,  color: 'text-blue-400' },
          { label: 'Formulary Reviews',             value: '—',                icon: Pill,         color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground/70">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {subModules.map(m => (
          <Link key={m.href} href={m.href}
            className="rounded-xl bg-slate-800/50 border border-white/10 p-5 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">{m.title}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground/70 mb-3">{m.description}</p>
            <p className={`text-sm font-semibold ${m.statColor}`}>{m.stat}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
