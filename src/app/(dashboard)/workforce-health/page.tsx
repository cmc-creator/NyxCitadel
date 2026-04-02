import Link from 'next/link';
import { Users2, ChevronRight, AlertTriangle, CheckCircle, HeartHandshake, Shield } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function WorkforceHealthPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const in90 = new Date(now); in90.setDate(in90.getDate() + 90);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [totalStaff, tbOverdue, oshaRecordable, fluDeclined] = await Promise.all([
    prisma.employeeHealthRecord.count({ where: { facilityId } }),
    prisma.employeeHealthRecord.count({ where: { facilityId, tbNextDueDate: { lt: now } } }),
    prisma.oshaLog.count({ where: { facilityId, recordable: true, injuryDate: { gte: yearStart } } }),
    prisma.employeeHealthRecord.count({ where: { facilityId, fluVaxDeclined: true } }),
  ]);

  const compliant = tbOverdue === 0 && oshaRecordable === 0;

  const subModules = [
    { href: '/workforce-health/employee-health', icon: HeartHandshake, label: 'Employee Health', desc: 'TB screening, flu vaccination, and exposure tracking', color: 'text-emerald-400' },
    { href: '/workforce-health/osha', icon: Shield, label: 'OSHA Log (300/300A)', desc: 'Recordable injuries, illnesses, and DART rates', color: 'text-amber-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Users2 className="w-5 h-5 text-emerald-400" />
        <h1 className="text-xl font-bold text-white">Workforce Health</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Staff Records', value: totalStaff, color: 'text-blue-400' },
          { label: 'TB Screening Overdue', value: tbOverdue, color: tbOverdue > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'OSHA Recordable (YTD)', value: oshaRecordable, color: oshaRecordable > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Flu Vax Declined', value: fluDeclined, color: fluDeclined > 0 ? 'text-amber-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-muted-foreground/70 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border p-4 flex items-center gap-3 ${compliant ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
        {compliant
          ? <><CheckCircle className="w-5 h-5 text-emerald-400" /><p className="text-sm text-emerald-300">No overdue TB screenings and no OSHA recordable incidents YTD.</p></>
          : <><AlertTriangle className="w-5 h-5 text-amber-400" /><p className="text-sm text-amber-300">Action required: {tbOverdue > 0 ? `${tbOverdue} TB screening(s) overdue. ` : ''}{oshaRecordable > 0 ? `${oshaRecordable} OSHA recordable incident(s) YTD.` : ''}</p></>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {subModules.map(m => (
          <Link key={m.href} href={m.href} className="rounded-xl border border-white/10 bg-slate-800/50 hover:bg-slate-700/50 p-5 flex items-center justify-between group transition-colors">
            <div className="flex items-center gap-3">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <div>
                <p className="font-semibold text-white">{m.label}</p>
                <p className="text-xs text-muted-foreground/70">{m.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
